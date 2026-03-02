const prisma = require('../../config/db');

const getBrands = async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    return res.status(200).json({ success: true, data: brands });
  } catch (error) {
    console.error('getBrands error:', error);
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
        include: { images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }], take: 1 }, category: { select: { name: true, slug: true } } },
      }),
      prisma.product.count({ where: { brandId: brand.id, isActive: true } }),
    ]);

    return res.status(200).json({
      success: true, brand,
      data: products.map((p) => ({
        id: p.id, name: p.name, slug: p.slug,
        mrp: parseFloat(p.mrp), sellingPrice: parseFloat(p.sellingPrice),
        discountPercent: Math.round(((p.mrp - p.sellingPrice) / p.mrp) * 100),
        image: p.images[0]?.image || p.image || null, category: p.category,
        inStock: p.stockQuantity > 0,
      })),
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    console.error('getBrandProducts error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createBrand = async (req, res) => {
  try {
    const { name, slug, logo, description, isActive } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name required' });
    
    const brand = await prisma.brand.create({
      data: { 
        name, 
        logo, 
        description, 
        isActive: isActive !== undefined ? isActive : true,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      },
    });
    return res.status(201).json({ success: true, data: brand });
  } catch (error) {
    console.error('createBrand error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, logo, description, isActive } = req.body;
    
    const brand = await prisma.brand.update({
      where: { id },
      data: { name, slug, logo, description, isActive },
    });
    
    return res.status(200).json({ success: true, data: brand });
  } catch (error) {
    console.error('updateBrand error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if brand has products
    const productCount = await prisma.product.count({ where: { brandId: id } });
    if (productCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete brand with ${productCount} product(s). Remove products first.` 
      });
    }
    
    await prisma.brand.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Brand deleted' });
  } catch (error) {
    console.error('deleteBrand error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

module.exports = { getBrands, getBrandProducts, createBrand, updateBrand, deleteBrand };