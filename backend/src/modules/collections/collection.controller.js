const prisma = require('../../config/db');

const getCollection = async (req, res) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Special handling for flash-sale: read directly from products with active flash sale
    if (slug === 'flash-sale') {
      const now = new Date();

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where: {
            isActive: true,
            isFlashSale: true,
            flashSaleEndDate: { gt: now },
          },
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            images: { where: { isPrimary: true }, take: 1 },
            category: { select: { name: true, slug: true } },
            reviews: { select: { rating: true } },
          },
        }),
        prisma.product.count({
          where: {
            isActive: true,
            isFlashSale: true,
            flashSaleEndDate: { gt: now },
          },
        }),
      ]);

      return res.status(200).json({
        success: true,
        collection: { id: 'flash-sale', name: 'Flash Sale', slug: 'flash-sale' },
        data: products.map((p) => ({
          id: p.id, name: p.name, slug: p.slug,
          mrp: parseFloat(p.mrp), sellingPrice: parseFloat(p.sellingPrice),
          discountPercent: Math.round(((p.mrp - p.sellingPrice) / p.mrp) * 100),
          image: p.images[0]?.url || null, category: p.category,
          inStock: p.stockQuantity > 0,
          isFlashSale: p.isFlashSale,
          flashSaleEndDate: p.flashSaleEndDate,
          averageRating: p.reviews.length > 0
            ? (p.reviews.reduce((a, b) => a + b.rating, 0) / p.reviews.length).toFixed(1) : null,
        })),
        pagination: { total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) },
      });
    }

    // use findFirst so we can match on non-unique fields like isActive
    const collection = await prisma.collection.findFirst({ where: { slug, isActive: true } });
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    const [items, total] = await Promise.all([
      prisma.collectionProduct.findMany({
        where: { collectionId: collection.id },
        skip, take: parseInt(limit),
        orderBy: { sortOrder: 'asc' },
        include: {
          product: {
            include: {
              images: { where: { isPrimary: true }, take: 1 },
              category: { select: { name: true, slug: true } },
              reviews: { select: { rating: true } },
            },
          },
        },
      }),
      prisma.collectionProduct.count({ where: { collectionId: collection.id } }),
    ]);

    return res.status(200).json({
      success: true,
      collection,
      data: items.map((i) => ({
        id: i.product.id, name: i.product.name, slug: i.product.slug,
        mrp: parseFloat(i.product.mrp), sellingPrice: parseFloat(i.product.sellingPrice),
        discountPercent: Math.round(((i.product.mrp - i.product.sellingPrice) / i.product.mrp) * 100),
        image: i.product.images[0]?.url || null, category: i.product.category,
        inStock: i.product.stockQuantity > 0,
        averageRating: i.product.reviews.length > 0
          ? (i.product.reviews.reduce((a, b) => a + b.rating, 0) / i.product.reviews.length).toFixed(1) : null,
      })),
      pagination: { total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    console.error('getCollection error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin — List all collections
const getAllCollections = async (req, res) => {
  try {
    const collections = await prisma.collection.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    return res.status(200).json({ success: true, data: collections });
  } catch (error) {
    console.error('getAllCollections error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin — Create collection
const createCollection = async (req, res) => {
  try {
    const { name, slug, description, imageUrl, isActive, sortOrder } = req.body;
    const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const existing = await prisma.collection.findFirst({ where: { slug: finalSlug } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Collection with this slug already exists' });
    }

    const collection = await prisma.collection.create({
      data: { name, slug: finalSlug, description: description || null, imageUrl: imageUrl || null, isActive: isActive !== false, sortOrder: sortOrder || 0 },
    });
    return res.status(201).json({ success: true, data: collection, message: 'Collection created' });
  } catch (error) {
    console.error('createCollection error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin — Update collection
const updateCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, imageUrl, isActive, sortOrder } = req.body;

    const collection = await prisma.collection.update({
      where: { id },
      data: { name, slug, description: description || null, imageUrl: imageUrl || null, isActive, sortOrder: sortOrder || 0 },
    });
    return res.status(200).json({ success: true, data: collection, message: 'Collection updated' });
  } catch (error) {
    console.error('updateCollection error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin — Delete collection
const deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;
    // Delete associated products first
    await prisma.collectionProduct.deleteMany({ where: { collectionId: id } });
    await prisma.collection.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Collection deleted' });
  } catch (error) {
    console.error('deleteCollection error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin — Add product to collection
const addProductToCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { productId } = req.body;

    const existing = await prisma.collectionProduct.findFirst({
      where: { collectionId: id, productId },
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Product already in collection' });
    }

    const maxSort = await prisma.collectionProduct.findFirst({
      where: { collectionId: id },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    await prisma.collectionProduct.create({
      data: { collectionId: id, productId, sortOrder: (maxSort?.sortOrder || 0) + 1 },
    });
    return res.status(201).json({ success: true, message: 'Product added to collection' });
  } catch (error) {
    console.error('addProductToCollection error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin — Remove product from collection
const removeProductFromCollection = async (req, res) => {
  try {
    const { id, productId } = req.params;
    await prisma.collectionProduct.deleteMany({
      where: { collectionId: id, productId },
    });
    return res.status(200).json({ success: true, message: 'Product removed from collection' });
  } catch (error) {
    console.error('removeProductFromCollection error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getCollection,
  getAllCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  addProductToCollection,
  removeProductFromCollection,
};
