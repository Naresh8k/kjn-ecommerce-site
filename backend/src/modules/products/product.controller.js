const prisma = require('../../config/db');
const redis = require('../../config/redis');

// ─────────────────────────────────────────────
// GET ALL PRODUCTS with filters, search, pagination
// GET /api/products
// ─────────────────────────────────────────────
const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      brand,
      minPrice,
      maxPrice,
      search,
      sort = 'createdAt',
      order = 'desc',
      featured,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filters
    const where = { isActive: true };

    if (category) {
      const cat = await prisma.category.findUnique({ where: { slug: category } });
      if (cat) where.categoryId = cat.id;
    }

    if (brand) {
      const br = await prisma.brand.findUnique({ where: { slug: brand } });
      if (br) where.brandId = br.id;
    }

    if (minPrice || maxPrice) {
      where.sellingPrice = {};
      if (minPrice) where.sellingPrice.gte = parseFloat(minPrice);
      if (maxPrice) where.sellingPrice.lte = parseFloat(maxPrice);
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    if (featured === 'true') where.isFeatured = true;

    // Sort options
    const sortOptions = {
      price_asc: { sellingPrice: 'asc' },
      price_desc: { sellingPrice: 'desc' },
      newest: { createdAt: 'desc' },
      discount: { mrp: 'desc' },
      name: { name: 'asc' },
    };

    const orderBy = sortOptions[sort] || { createdAt: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          category: { select: { name: true, slug: true } },
          brand: { select: { name: true, slug: true } },
          reviews: { select: { rating: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Format products
    const formatted = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      mrp: parseFloat(p.mrp),
      sellingPrice: parseFloat(p.sellingPrice),
      discountPercent: Math.round(((p.mrp - p.sellingPrice) / p.mrp) * 100),
      image: p.images[0]?.url || null,
      category: p.category,
      brand: p.brand,
      stockQuantity: p.stockQuantity,
      averageRating:
        p.reviews.length > 0
          ? (p.reviews.reduce((a, b) => a + b.rating, 0) / p.reviews.length).toFixed(1)
          : null,
      totalReviews: p.reviews.length,
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('getProducts error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────
// GET SINGLE PRODUCT by slug
// GET /api/products/:slug
// ─────────────────────────────────────────────
const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Check cache first
    const cached = await redis.get(`product:${slug}`);
    if (cached) {
      return res.status(200).json({ success: true, data: JSON.parse(cached), cached: true });
    }

    const product = await prisma.product.findUnique({
      where: { slug, isActive: true },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        category: true,
        brand: true,
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { name: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const formatted = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      shortDescription: product.shortDescription,
      specifications: product.specifications,
      mrp: parseFloat(product.mrp),
      sellingPrice: parseFloat(product.sellingPrice),
      discountPercent: Math.round(
        ((product.mrp - product.sellingPrice) / product.mrp) * 100
      ),
      gstPercent: parseFloat(product.gstPercent),
      stockQuantity: product.stockQuantity,
      inStock: product.stockQuantity > 0,
      isFeatured: product.isFeatured,
      images: product.images,
      variants: product.variants,
      category: product.category,
      brand: product.brand,
      tags: product.tags,
      averageRating:
        product.reviews.length > 0
          ? (
              product.reviews.reduce((a, b) => a + b.rating, 0) /
              product.reviews.length
            ).toFixed(1)
          : null,
      totalReviews: product.reviews.length,
      reviews: product.reviews,
    };

    // Cache for 10 minutes
    await redis.setex(`product:${slug}`, 600, JSON.stringify(formatted));

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error('getProductBySlug error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────
// SEARCH PRODUCTS
// GET /api/products/search?q=sprayer
// ─────────────────────────────────────────────
const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Search query too short' });
    }

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { shortDescription: { contains: q, mode: 'insensitive' } },
          { tags: { has: q.toLowerCase() } },
        ],
      },
      take: 10,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { name: true, slug: true } },
      },
    });

    return res.status(200).json({
      success: true,
      data: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        sellingPrice: parseFloat(p.sellingPrice),
        mrp: parseFloat(p.mrp),
        image: p.images[0]?.url || null,
        category: p.category,
      })),
    });
  } catch (error) {
    console.error('searchProducts error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────
// ADMIN — CREATE PRODUCT
// POST /api/admin/products
// ─────────────────────────────────────────────
const createProduct = async (req, res) => {
  try {
    const {
      name, slug, sku, description, shortDescription,
      categoryId, brandId, mrp, sellingPrice, gstPercent,
      stockQuantity, isFeatured, weightGrams, tags,
      specifications, metaTitle, metaDescription,
      images, variants,
    } = req.body;

    if (!name || !categoryId || !mrp || !sellingPrice) {
      return res.status(400).json({ success: false, message: 'Name, category, MRP and selling price are required' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        sku,
        description,
        shortDescription,
        categoryId,
        brandId,
        mrp: parseFloat(mrp),
        sellingPrice: parseFloat(sellingPrice),
        gstPercent: parseFloat(gstPercent || 18),
        stockQuantity: parseInt(stockQuantity || 0),
        isFeatured: isFeatured || false,
        weightGrams: weightGrams ? parseInt(weightGrams) : null,
        tags: tags || [],
        specifications: specifications || null,
        metaTitle,
        metaDescription,
        images: images
          ? { create: images.map((img, i) => ({ url: img.url, altText: img.altText, sortOrder: i, isPrimary: i === 0 })) }
          : undefined,
        variants: variants
          ? { create: variants.map((v) => ({ variantName: v.variantName, variantValue: v.variantValue, additionalPrice: v.additionalPrice || 0, stockQuantity: v.stockQuantity || 0 })) }
          : undefined,
      },
      include: { images: true, variants: true },
    });

    return res.status(201).json({ success: true, message: 'Product created', data: product });
  } catch (error) {
    console.error('createProduct error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Product slug or SKU already exists' });
    }
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────
// ADMIN — UPDATE PRODUCT
// PUT /api/admin/products/:id
// ─────────────────────────────────────────────
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        mrp: updateData.mrp ? parseFloat(updateData.mrp) : undefined,
        sellingPrice: updateData.sellingPrice ? parseFloat(updateData.sellingPrice) : undefined,
        updatedAt: new Date(),
      },
    });

    // Clear cache
    await redis.del(`product:${product.slug}`);

    return res.status(200).json({ success: true, message: 'Product updated', data: product });
  } catch (error) {
    console.error('updateProduct error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────
// ADMIN — DELETE PRODUCT
// DELETE /api/admin/products/:id
// ─────────────────────────────────────────────
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    await prisma.product.update({ where: { id }, data: { isActive: false } });
    await redis.del(`product:${product.slug}`);

    return res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('deleteProduct error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getProducts, getProductBySlug, searchProducts, createProduct, updateProduct, deleteProduct };