const prisma = require('../../config/db');

const getBanners = async (req, res) => {
  try {
    const { position } = req.query;
    const now = new Date();
    const where = {
      isActive: true,
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
    };
    if (position) where.position = position;

    const banners = await prisma.banner.findMany({ where, orderBy: { sortOrder: 'asc' } });
    return res.status(200).json({ success: true, data: banners });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createBanner = async (req, res) => {
  try {
    const banner = await prisma.banner.create({ data: req.body });
    return res.status(201).json({ success: true, data: banner });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateBanner = async (req, res) => {
  try {
    const banner = await prisma.banner.update({ where: { id: req.params.id }, data: req.body });
    return res.status(200).json({ success: true, data: banner });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteBanner = async (req, res) => {
  try {
    await prisma.banner.delete({ where: { id: req.params.id } });
    return res.status(200).json({ success: true, message: 'Banner deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getBanners, createBanner, updateBanner, deleteBanner };