const prisma = require('../../config/db');

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, phone: true, role: true, avatarUrl: true, createdAt: true },
    });
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, avatarUrl } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, email, avatarUrl },
      select: { id: true, name: true, email: true, phone: true, avatarUrl: true },
    });
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getAddresses = async (req, res) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: { isDefault: 'desc' },
    });
    return res.status(200).json({ success: true, data: addresses });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const addAddress = async (req, res) => {
  try {
    const { name, phone, line1, line2, city, state, pincode, isDefault } = req.body;
    if (!name || !phone || !line1 || !city || !state || !pincode) {
      return res.status(400).json({ success: false, message: 'All address fields are required' });
    }

    if (isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
    }

    const address = await prisma.address.create({
      data: { userId: req.user.id, name, phone, line1, line2, city, state, pincode, isDefault: isDefault || false },
    });
    return res.status(201).json({ success: true, data: address });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, line1, line2, city, state, pincode, isDefault } = req.body;

    if (isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
    }

    const address = await prisma.address.update({
      where: { id, userId: req.user.id },
      data: { name, phone, line1, line2, city, state, pincode, isDefault },
    });
    return res.status(200).json({ success: true, data: address });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.address.delete({ where: { id, userId: req.user.id } });
    return res.status(200).json({ success: true, message: 'Address deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getWishlist = async (req, res) => {
  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: { images: { where: { isPrimary: true }, take: 1 } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({
      success: true,
      data: wishlist.map((w) => ({
        id: w.id,
        productId: w.productId,
        name: w.product.name,
        slug: w.product.slug,
        mrp: parseFloat(w.product.mrp),
        sellingPrice: parseFloat(w.product.sellingPrice),
        discountPercent: Math.round(((w.product.mrp - w.product.sellingPrice) / w.product.mrp) * 100),
        image: w.product.images[0]?.url || null,
        inStock: w.product.stockQuantity > 0,
      })),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const existing = await prisma.wishlist.findUnique({ where: { userId_productId: { userId, productId } } });

    if (existing) {
      await prisma.wishlist.delete({ where: { userId_productId: { userId, productId } } });
      return res.status(200).json({ success: true, message: 'Removed from wishlist', wishlisted: false });
    } else {
      await prisma.wishlist.create({ data: { userId, productId } });
      return res.status(200).json({ success: true, message: 'Added to wishlist', wishlisted: true });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    const unreadCount = await prisma.notification.count({ where: { userId: req.user.id, isRead: false } });
    return res.status(200).json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const markNotificationsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({ where: { userId: req.user.id, isRead: false }, data: { isRead: true } });
    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getProfile, updateProfile, getAddresses, addAddress, updateAddress, deleteAddress, getWishlist, toggleWishlist, getNotifications, markNotificationsRead };