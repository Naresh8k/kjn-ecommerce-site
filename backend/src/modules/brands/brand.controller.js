const prisma = require('../../config/db');

const getBrands = async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return res.status(200).json({ success: true, data: brands });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getBrandProducts = async (req, res) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const brand = await prisma.brand.findUnique({ where: { slug } });
    if (!brand) return res.status(404).json({ success: false, message: 'Brand not found' });

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { brandId: brand.id, isActive: true },
        skip, take: parseInt(limit),
        include: { images: { where: { isPrimary: true }, take: 1 }, category: { select: { name: true, slug: true } } },
      }),
      prisma.product.count({ where: { brandId: brand.id, isActive: true } }),
    ]);

    return res.status(200).json({
      success: true, brand,
      data: products.map((p) => ({
        id: p.id, name: p.name, slug: p.slug,
        mrp: parseFloat(p.mrp), sellingPrice: parseFloat(p.sellingPrice),
        discountPercent: Math.round(((p.mrp - p.sellingPrice) / p.mrp) * 100),
        image: p.images[0]?.url || null, category: p.category,
        inStock: p.stockQuantity > 0,
      })),
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createBrand = async (req, res) => {
  try {
    const { name, slug, logoUrl, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name required' });
    const brand = await prisma.brand.create({
      data: { name, logoUrl, description, slug: slug || name.toLowerCase().replace(/\s+/g, '-') },
    });
    return res.status(201).json({ success: true, data: brand });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getBrands, getBrandProducts, createBrand };