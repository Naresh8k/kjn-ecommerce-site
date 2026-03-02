const prisma = require('../../config/db');

const getCollection = async (req, res) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

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

module.exports = { getCollection };
