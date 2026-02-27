const prisma = require('../../config/db');

const createCoupon = async (req, res) => {
  try {
    const { code, type, value, minOrderAmount, maxDiscount, usesLimit, perUserLimit, validFrom, validUntil } = req.body;

    if (!code || !type || !value) {
      return res.status(400).json({ success: false, message: 'Code, type and value required' });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        type, value: parseFloat(value),
        minOrderAmount: parseFloat(minOrderAmount || 0),
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usesLimit: usesLimit ? parseInt(usesLimit) : null,
        perUserLimit: parseInt(perUserLimit || 1),
        validFrom: validFrom ? new Date(validFrom) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
      },
    });

    return res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getAllCoupons = async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    return res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const toggleCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    const updated = await prisma.coupon.update({ where: { id }, data: { isActive: !coupon.isActive } });
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const userId = req.user.id;

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase(), isActive: true } });
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });

    const now = new Date();
    if (coupon.validUntil && now > coupon.validUntil) return res.status(400).json({ success: false, message: 'Coupon expired' });
    if (coupon.validFrom && now < coupon.validFrom) return res.status(400).json({ success: false, message: 'Coupon not yet active' });
    if (coupon.usesLimit && coupon.usesCount >= coupon.usesLimit) return res.status(400).json({ success: false, message: 'Coupon fully used' });
    if (parseFloat(orderAmount) < parseFloat(coupon.minOrderAmount)) {
      return res.status(400).json({ success: false, message: `Minimum order ₹${coupon.minOrderAmount} required` });
    }

    const userUsage = await prisma.couponUsage.count({ where: { couponId: coupon.id, userId } });
    if (userUsage >= coupon.perUserLimit) return res.status(400).json({ success: false, message: 'You have already used this coupon' });

    let discount = 0;
    if (coupon.type === 'PERCENT') {
      discount = (parseFloat(orderAmount) * parseFloat(coupon.value)) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, parseFloat(coupon.maxDiscount));
    } else if (coupon.type === 'FLAT') {
      discount = parseFloat(coupon.value);
    } else if (coupon.type === 'FREE_SHIPPING') {
      discount = 0;
    }

    return res.status(200).json({
      success: true,
      message: `Coupon applied! You save ₹${discount.toFixed(2)}`,
      data: { code: coupon.code, type: coupon.type, discount: parseFloat(discount.toFixed(2)), freeShipping: coupon.type === 'FREE_SHIPPING' },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createCoupon, getAllCoupons, toggleCoupon, validateCoupon };