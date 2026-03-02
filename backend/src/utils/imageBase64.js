/**
 * Base64 Image Utilities
 * Convert images to/from base64 format with validation and optimization
 */

const sharp = require('sharp');

/**
 * Convert buffer to base64 data URL
 * @param {Buffer} buffer - Image buffer
 * @param {string} mimeType - MIME type (image/jpeg, image/png, etc.)
 * @returns {string} Base64 data URL
 */
const bufferToBase64 = (buffer, mimeType = 'image/jpeg') => {
  const base64 = buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
};

/**
 * Convert base64 data URL to buffer
 * @param {string} base64String - Base64 data URL
 * @returns {Buffer} Image buffer
 */
const base64ToBuffer = (base64String) => {
  if (!base64String || typeof base64String !== 'string') {
    throw new Error('Invalid base64 string');
  }
  
  // Remove data URL prefix if present
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
};

/**
 * Get MIME type from base64 data URL
 * @param {string} base64String - Base64 data URL
 * @returns {string} MIME type
 */
const getMimeType = (base64String) => {
  const match = base64String.match(/^data:(image\/\w+);base64,/);
  return match ? match[1] : 'image/jpeg';
};

/**
 * Process and convert image to optimized base64
 * @param {Buffer} buffer - Original image buffer
 * @param {Object} options - Processing options
 * @returns {Promise<string>} Base64 data URL
 */
const processImageToBase64 = async (buffer, options = {}) => {
  const {
    width = null,
    height = null,
    quality = 85,
    format = 'jpeg',
    fit = 'inside',
    maxSize = 500 * 1024, // 500KB max by default
  } = options;

  try {
    let pipeline = sharp(buffer);

    // Resize if dimensions specified
    if (width || height) {
      pipeline = pipeline.resize(width, height, {
        fit,
        withoutEnlargement: true,
      });
    }

    // Convert to specified format with quality
    if (format === 'jpeg' || format === 'jpg') {
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
    } else if (format === 'png') {
      pipeline = pipeline.png({ quality, compressionLevel: 9 });
    } else if (format === 'webp') {
      pipeline = pipeline.webp({ quality });
    }

    let processedBuffer = await pipeline.toBuffer();
    
    // If still too large, reduce quality iteratively
    let currentQuality = quality;
    while (processedBuffer.length > maxSize && currentQuality > 40) {
      currentQuality -= 10;
      pipeline = sharp(buffer);
      
      if (width || height) {
        pipeline = pipeline.resize(width, height, { fit, withoutEnlargement: true });
      }
      
      if (format === 'jpeg' || format === 'jpg') {
        pipeline = pipeline.jpeg({ quality: currentQuality, mozjpeg: true });
      } else if (format === 'webp') {
        pipeline = pipeline.webp({ quality: currentQuality });
      }
      
      processedBuffer = await pipeline.toBuffer();
    }

    const mimeType = `image/${format === 'jpg' ? 'jpeg' : format}`;
    return bufferToBase64(processedBuffer, mimeType);
  } catch (error) {
    throw new Error(`Image processing failed: ${error.message}`);
  }
};

/**
 * Validate base64 image string
 * @param {string} base64String - Base64 data URL
 * @returns {Object} Validation result
 */
const validateBase64Image = (base64String) => {
  if (!base64String || typeof base64String !== 'string') {
    return { valid: false, error: 'Invalid input' };
  }

  // Check if it's a data URL
  if (!base64String.startsWith('data:image/')) {
    return { valid: false, error: 'Not a valid image data URL' };
  }

  // Check size (rough estimate: base64 is ~33% larger than binary)
  const sizeInBytes = Math.ceil((base64String.length * 3) / 4);
  const maxSize = 2 * 1024 * 1024; // 2MB max
  
  if (sizeInBytes > maxSize) {
    return { valid: false, error: 'Image too large (max 2MB)' };
  }

  return { valid: true, size: sizeInBytes };
};

/**
 * Image processing presets for different use cases
 */
const presets = {
  // Product images
  product: {
    main: { width: 800, height: 800, quality: 85, format: 'jpeg', maxSize: 400 * 1024 },
    thumbnail: { width: 300, height: 300, quality: 80, format: 'jpeg', maxSize: 100 * 1024 },
    gallery: { width: 1200, height: 1200, quality: 90, format: 'jpeg', maxSize: 500 * 1024 },
  },
  
  // Category images
  category: {
    main: { width: 600, height: 400, quality: 85, format: 'jpeg', maxSize: 200 * 1024 },
    thumbnail: { width: 200, height: 133, quality: 80, format: 'jpeg', maxSize: 50 * 1024 },
  },
  
  // Brand logos
  brand: {
    logo: { width: 400, height: 400, quality: 90, format: 'png', fit: 'contain', maxSize: 150 * 1024 },
    thumbnail: { width: 100, height: 100, quality: 85, format: 'png', fit: 'contain', maxSize: 30 * 1024 },
  },
  
  // Banners
  banner: {
    desktop: { width: 1920, height: 600, quality: 85, format: 'jpeg', maxSize: 500 * 1024 },
    mobile: { width: 800, height: 600, quality: 80, format: 'jpeg', maxSize: 200 * 1024 },
  },
  
  // User avatars
  avatar: {
    main: { width: 200, height: 200, quality: 85, format: 'jpeg', fit: 'cover', maxSize: 100 * 1024 },
    thumbnail: { width: 64, height: 64, quality: 80, format: 'jpeg', fit: 'cover', maxSize: 20 * 1024 },
  },
  
  // Blog covers
  blog: {
    cover: { width: 1200, height: 630, quality: 85, format: 'jpeg', maxSize: 400 * 1024 },
    thumbnail: { width: 400, height: 210, quality: 80, format: 'jpeg', maxSize: 100 * 1024 },
  },
};

/**
 * Process image with preset
 * @param {Buffer} buffer - Image buffer
 * @param {string} presetType - Preset category (product, category, etc.)
 * @param {string} presetName - Preset name (main, thumbnail, etc.)
 * @returns {Promise<string>} Base64 data URL
 */
const processWithPreset = async (buffer, presetType, presetName = 'main') => {
  const preset = presets[presetType]?.[presetName];
  
  if (!preset) {
    throw new Error(`Invalid preset: ${presetType}.${presetName}`);
  }
  
  return processImageToBase64(buffer, preset);
};

/**
 * Get image dimensions from base64
 * @param {string} base64String - Base64 data URL
 * @returns {Promise<Object>} Image metadata
 */
const getImageInfo = async (base64String) => {
  try {
    const buffer = base64ToBuffer(base64String);
    const metadata = await sharp(buffer).metadata();
    
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: buffer.length,
      hasAlpha: metadata.hasAlpha,
    };
  } catch (error) {
    throw new Error(`Failed to get image info: ${error.message}`);
  }
};

module.exports = {
  bufferToBase64,
  base64ToBuffer,
  getMimeType,
  processImageToBase64,
  validateBase64Image,
  processWithPreset,
  getImageInfo,
  presets,
};
