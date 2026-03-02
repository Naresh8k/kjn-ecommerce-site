const prisma = require('../../config/db');

// Public — active banners only (with schedule filtering)
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

// Admin — ALL banners (active + inactive, no schedule filter)
const getAllBannersAdmin = async (req, res) => {
  try {
    const banners = await prisma.banner.findMany({ orderBy: { sortOrder: 'asc' } });
    return res.status(200).json({ success: true, data: banners });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Normalise payload — frontend sends `imageUrl`, DB column is `image`
const normaliseBannerPayload = (body) => {
  const payload = { ...body };
  // accept either field name
  if (payload.imageUrl !== undefined && payload.image === undefined) {
    payload.image = payload.imageUrl;
  }
  delete payload.imageUrl; // remove so Prisma doesn't complain

  if (payload.startsAt) {
    const d = new Date(payload.startsAt);
    payload.startsAt = isNaN(d) ? null : d;
  } else {
    payload.startsAt = null;
  }
  if (payload.endsAt) {
    const d = new Date(payload.endsAt);
    payload.endsAt = isNaN(d) ? null : d;
  } else {
    payload.endsAt = null;
  }
  return payload;
};

const createBanner = async (req, res) => {
  try {
    const payload = normaliseBannerPayload(req.body);
    if (!payload.image) return res.status(400).json({ success: false, message: 'Banner image is required' });
    const banner = await prisma.banner.create({ data: payload });
    return res.status(201).json({ success: true, data: banner });
  } catch (error) {
    console.error('createBanner error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateBanner = async (req, res) => {
  try {
    const payload = normaliseBannerPayload(req.body);
    const banner = await prisma.banner.update({ where: { id: req.params.id }, data: payload });
    return res.status(200).json({ success: true, data: banner });
  } catch (error) {
    console.error('updateBanner error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteBanner = async (req, res) => {
  try {
    await prisma.banner.delete({ where: { id: req.params.id } });
    return res.status(200).json({ success: true, message: 'Banner deleted' });
  } catch (error) {
    console.error('deleteBanner error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getBanners, getAllBannersAdmin, createBanner, updateBanner, deleteBanner };