// ─────────────────────────────────────────────────────────────────────────────
// backend/src/middleware/upload.js
//
// Multer config for image uploads.
// Images are resized with sharp and saved to /public/uploads/
// Served as static files at: http://localhost:5000/uploads/filename.webp
// ─────────────────────────────────────────────────────────────────────────────

const multer = require('multer');
const sharp  = require('sharp');
const path   = require('path');
const fs     = require('fs');

// ── Ensure upload directories exist ──────────────────────────
const UPLOAD_BASE = path.join(__dirname, '../../public/uploads');
const DIRS = ['products', 'banners', 'brands', 'categories', 'blogs', 'temp'];
DIRS.forEach(d => fs.mkdirSync(path.join(UPLOAD_BASE, d), { recursive: true }));

// ── Multer: store in memory, we'll write with sharp ──────────
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WEBP, and GIF images are allowed'), false);
  }
};

// Max 10 MB per image
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ── Sharp processor ───────────────────────────────────────────
/**
 * processImage(buffer, folder, options)
 * Resizes, converts to WebP, saves to /public/uploads/<folder>/
 * Returns: { filename, url, width, height, sizeKB }
 */
const processImage = async (buffer, folder = 'temp', options = {}) => {
  const {
    width    = 800,
    height   = 800,
    fit      = sharp.fit.inside,    // inside = maintain aspect ratio
    quality  = 82,
    withoutEnlargement = true,
  } = options;

  const filename  = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
  const savePath  = path.join(UPLOAD_BASE, folder, filename);

  const info = await sharp(buffer)
    .resize({ width, height, fit, withoutEnlargement })
    .webp({ quality })
    .toFile(savePath);

  const BASE_URL = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
  const url = `${BASE_URL}/uploads/${folder}/${filename}`;

  return {
    filename,
    url,
    width:  info.width,
    height: info.height,
    sizeKB: Math.round(info.size / 1024),
  };
};

// ── Presets per image type ─────────────────────────────────────
const PRESETS = {
  product  : { width: 800,  height: 800,  fit: sharp.fit.inside,   quality: 82 },
  banner   : { width: 1920, height: 600,  fit: sharp.fit.cover,    quality: 85 },
  brand    : { width: 400,  height: 400,  fit: sharp.fit.contain,  quality: 85, background: { r:255, g:255, b:255, alpha:1 } },
  category : { width: 600,  height: 600,  fit: sharp.fit.cover,    quality: 82 },
  blog     : { width: 1200, height: 630,  fit: sharp.fit.cover,    quality: 85 },
  avatar   : { width: 200,  height: 200,  fit: sharp.fit.cover,    quality: 80 },
};

const processWithPreset = (buffer, folder, preset = 'product') =>
  processImage(buffer, folder, PRESETS[preset] || PRESETS.product);

// ── Delete image helper ───────────────────────────────────────
const deleteImage = (urlOrFilename) => {
  try {
    // Extract filename from URL if full URL passed
    const filename = urlOrFilename.includes('/uploads/')
      ? urlOrFilename.split('/uploads/')[1]
      : urlOrFilename;
    const fullPath = path.join(UPLOAD_BASE, filename);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
  } catch (e) {
    console.error('Delete image error:', e.message);
  }
  return false;
};

module.exports = { upload, processImage, processWithPreset, deleteImage, UPLOAD_BASE };