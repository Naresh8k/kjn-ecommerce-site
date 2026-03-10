const prisma = require('../../config/db');

const getCategories = async (req, res) => {
  try {
    const isAdmin = req.query.admin === 'true';
    const where = isAdmin ? { parentId: null } : { isActive: true, parentId: null };

    const categories = await prisma.category.findMany({
      where,
      include: { children: true },
      orderBy: { sortOrder: 'asc' },
    });

    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getCategoryProducts = async (req, res) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 12, sort, minPrice, maxPrice, brand } = req.query;

    const category = await prisma.category.findUnique({ where: { slug } });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = { categoryId: category.id, isActive: true };

    if (minPrice || maxPrice) {
      where.sellingPrice = {};
      if (minPrice) where.sellingPrice.gte = parseFloat(minPrice);
      if (maxPrice) where.sellingPrice.lte = parseFloat(maxPrice);
    }

    if (brand) {
      const br = await prisma.brand.findUnique({ where: { slug: brand } });
      if (br) where.brandId = br.id;
    }

    const sortOptions = {
      price_asc: { sellingPrice: 'asc' },
      price_desc: { sellingPrice: 'desc' },
      newest: { createdAt: 'desc' },
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where, skip, take: parseInt(limit),
        orderBy: sortOptions[sort] || { createdAt: 'desc' },
        include: {
          images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }], take: 1 },
          brand: { select: { name: true, slug: true } },
          reviews: { select: { rating: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      category,
      data: products.map((p) => ({
        id: p.id, name: p.name, slug: p.slug,
        mrp: parseFloat(p.mrp),
        sellingPrice: parseFloat(p.sellingPrice),
        discountPercent: Math.round(((p.mrp - p.sellingPrice) / p.mrp) * 100),
        image: p.images[0]?.image || p.image || null,
        brand: p.brand,
        inStock: p.stockQuantity > 0,
        averageRating: p.reviews.length > 0
          ? (p.reviews.reduce((a, b) => a + b.rating, 0) / p.reviews.length).toFixed(1) : null,
      })),
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createCategory = async (req, res) => {
try {
  const { name, slug, parentId, image, sortOrder } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

  const category = await prisma.category.create({
    data: {
      name, image, sortOrder: sortOrder || 0,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      parentId: parentId || null,
    },
  });

  return res.status(201).json({ success: true, data: category });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, image, isActive, sortOrder, parentId } = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(image !== undefined && { image }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(parentId !== undefined && { parentId: parentId || null }),
      },
    });

    return res.status(200).json({ success: true, data: category });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${productCount} product(s). Remove products first.`,
      });
    }

    await prisma.category.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

module.exports = { getCategories, getCategoryProducts, createCategory, updateCategory, deleteCategory };