const prisma = require('../../config/db');

// Get or create cart helper
const IMAGE_INCLUDE = {
  images: {
    orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
    take: 1,
  },
};

const CART_INCLUDE = {
  items: {
    include: {
      product: { include: IMAGE_INCLUDE },
      variant: true,
    },
  },
};

const getOrCreateCart = async (userId, sessionId) => {
  if (userId) {
    let cart = await prisma.cart.findUnique({ where: { userId }, include: CART_INCLUDE });
    if (!cart) cart = await prisma.cart.create({ data: { userId }, include: CART_INCLUDE });
    return cart;
  }
  if (sessionId) {
    let cart = await prisma.cart.findUnique({ where: { sessionId }, include: CART_INCLUDE });
    if (!cart) cart = await prisma.cart.create({ data: { sessionId }, include: CART_INCLUDE });
    return cart;
  }
  throw new Error('userId or sessionId required');
};

// Format cart response with totals
const formatCart = (cart, couponDiscount = 0) => {
const items = cart.items.map((item) => ({
  id: item.id,
  productId: item.productId,
  name: item.product.name,
  slug: item.product.slug,
  image: item.product.images?.[0]?.image || item.product.image || null,
  variant: item.variant ? `${item.variant.variantName}: ${item.variant.variantValue}` : null,
  variantId: item.variantId,
  quantity: item.quantity,
  unitPrice: parseFloat(item.priceAtAdd),
  mrp: parseFloat(item.product.mrp),
  sellingPrice: parseFloat(item.product.sellingPrice),
  isFlashSalePrice: parseFloat(item.priceAtAdd) < parseFloat(item.product.sellingPrice),
  totalPrice: parseFloat(item.priceAtAdd) * item.quantity,
  gstPercent: parseFloat(item.product.gstPercent || 18),
  inStock: item.product.stockQuantity >= item.quantity,
}));

const subtotal = items.reduce((a, b) => a + b.totalPrice, 0);
const gstAmount = items.reduce((a, b) => {
  return a + (b.totalPrice * b.gstPercent) / (100 + b.gstPercent);
}, 0);
  const shippingCharge = subtotal >= 500 ? 0 : 99;
  const totalAmount = subtotal - couponDiscount + shippingCharge;

  return {
    id: cart.id,
    items,
    couponCode: cart.couponCode,
    subtotal: parseFloat(subtotal.toFixed(2)),
    couponDiscount: parseFloat(couponDiscount.toFixed(2)),
    gstAmount: parseFloat(gstAmount.toFixed(2)),
    shippingCharge,
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    totalItems: items.reduce((a, b) => a + b.quantity, 0),
    freeShippingEligible: subtotal >= 500,
    freeShippingRemaining: subtotal < 500 ? parseFloat((500 - subtotal).toFixed(2)) : 0,
  };
};

const calcCouponDiscount = async (cart) => {
  if (!cart.couponCode) return 0;
  const coupon = await prisma.coupon.findUnique({
    where: { code: cart.couponCode },
  });
  if (!coupon || !coupon.isActive) return 0;
  const now = new Date();
  if (coupon.validFrom && now < coupon.validFrom) return 0;
  if (coupon.validUntil && now > coupon.validUntil) return 0;
  const subtotal = cart.items.reduce((a, b) => a + parseFloat(b.priceAtAdd) * b.quantity, 0);
  if (subtotal < parseFloat(coupon.minOrderAmount)) return 0;
  let discount = 0;
  if (coupon.type === 'PERCENT') {
    discount = (subtotal * parseFloat(coupon.value)) / 100;
    if (coupon.maxDiscount) discount = Math.min(discount, parseFloat(coupon.maxDiscount));
  } else if (coupon.type === 'FLAT') {
    discount = parseFloat(coupon.value);
  }
  return discount;
};

const getCart = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const sessionId = req.headers['x-session-id'] || null;
    if (!userId && !sessionId) return res.status(400).json({ success: false, message: 'Session ID required for guest cart' });

    const cart = await getOrCreateCart(userId, sessionId);
    const discount = await calcCouponDiscount(cart);
    return res.status(200).json({ success: true, data: formatCart(cart, discount) });
  } catch (error) {
    console.error('getCart error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, variantId, quantity = 1 } = req.body;
    const userId = req.user?.id || null;
    const sessionId = req.headers['x-session-id'] || null;

    if (!productId) return res.status(400).json({ success: false, message: 'Product ID required' });
    if (!userId && !sessionId) return res.status(400).json({ success: false, message: 'Session ID required for guest cart' });

    // Check product exists and has stock
    const product = await prisma.product.findUnique({ where: { id: productId, isActive: true } });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.stockQuantity < quantity) return res.status(400).json({ success: false, message: 'Insufficient stock' });

    const cart = await getOrCreateCart(userId, sessionId);

    // Check for active flash sale — use flash price if available
    const now = new Date();
    const activeFlashSale = await prisma.flashSale.findFirst({
      where: {
        productId,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    // Calculate price (flash sale overrides selling price)
    let price = activeFlashSale
      ? parseFloat(activeFlashSale.flashPrice)
      : parseFloat(product.sellingPrice);

    if (variantId) {
      const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
      if (variant) price += parseFloat(variant.additionalPrice);
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId, variantId: variantId || null },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + parseInt(quantity) },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, variantId: variantId || null, quantity: parseInt(quantity), priceAtAdd: price },
      });
    }

    const updatedCart = await getOrCreateCart(userId, sessionId);
    const discount = await calcCouponDiscount(updatedCart);
    return res.status(200).json({ success: true, message: 'Added to cart', data: formatCart(updatedCart, discount) });
  } catch (error) {
    console.error('addToCart error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = req.user?.id || null;
    const sessionId = req.headers['x-session-id'] || null;

    if (quantity < 1) return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });

    const item = await prisma.cartItem.findUnique({ where: { id }, include: { product: true } });
    if (!item) return res.status(404).json({ success: false, message: 'Cart item not found' });
    if (item.product.stockQuantity < quantity) return res.status(400).json({ success: false, message: 'Insufficient stock' });

    await prisma.cartItem.update({ where: { id }, data: { quantity: parseInt(quantity) } });

    const updatedCart = await getOrCreateCart(userId, sessionId);
    const discount = await calcCouponDiscount(updatedCart);
    return res.status(200).json({ success: true, data: formatCart(updatedCart, discount) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || null;
    const sessionId = req.headers['x-session-id'] || null;

    await prisma.cartItem.delete({ where: { id } });

    const updatedCart2 = await getOrCreateCart(userId, sessionId);
    const discount2 = await calcCouponDiscount(updatedCart2);
    return res.status(200).json({ success: true, message: 'Item removed', data: formatCart(updatedCart2, discount2) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const applyCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Login required to apply coupon' });

    const cart = await getOrCreateCart(userId, null);

    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
    if (!coupon || !coupon.isActive) return res.status(404).json({ success: false, message: 'Invalid coupon code' });

    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) return res.status(400).json({ success: false, message: 'Coupon not yet active' });
    if (coupon.validUntil && now > coupon.validUntil) return res.status(400).json({ success: false, message: 'Coupon expired' });
    if (coupon.usesLimit && coupon.usesCount >= coupon.usesLimit) return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });

    // Check per user usage
    const userUsage = await prisma.couponUsage.count({ where: { couponId: coupon.id, userId } });
    if (userUsage >= coupon.perUserLimit) return res.status(400).json({ success: false, message: 'You have already used this coupon' });

    const subtotal = cart.items.reduce((a, b) => a + parseFloat(b.priceAtAdd) * b.quantity, 0);
    if (subtotal < parseFloat(coupon.minOrderAmount)) {
      return res.status(400).json({ success: false, message: `Minimum order amount ₹${coupon.minOrderAmount} required` });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === 'PERCENT') {
      discount = (subtotal * parseFloat(coupon.value)) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, parseFloat(coupon.maxDiscount));
    } else if (coupon.type === 'FLAT') {
      discount = parseFloat(coupon.value);
    }

    await prisma.cart.update({ where: { id: cart.id }, data: { couponCode: coupon.code } });

    const updatedCart = await getOrCreateCart(userId, null);
    return res.status(200).json({
      success: true,
      message: `Coupon applied! You save ₹${discount.toFixed(2)}`,
      data: formatCart(updatedCart, discount),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const removeCoupon = async (req, res) => {
  try {
    const userId = req.user?.id;
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    await prisma.cart.update({ where: { id: cart.id }, data: { couponCode: null } });
    const updatedCart = await getOrCreateCart(userId, null);
    return res.status(200).json({ success: true, message: 'Coupon removed', data: formatCart(updatedCart, 0) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const mergeCart = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.id;

    const guestCart = await prisma.cart.findUnique({
      where: { sessionId },
      include: { items: true },
    });

    if (!guestCart || guestCart.items.length === 0) {
      return res.status(200).json({ success: true, message: 'Nothing to merge' });
    }

    const userCart = await getOrCreateCart(userId, null);

    for (const item of guestCart.items) {
      const existing = await prisma.cartItem.findFirst({
        where: { cartId: userCart.id, productId: item.productId, variantId: item.variantId },
      });
      if (existing) {
        await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + item.quantity } });
      } else {
        await prisma.cartItem.create({
          data: { cartId: userCart.id, productId: item.productId, variantId: item.variantId, quantity: item.quantity, priceAtAdd: item.priceAtAdd },
        });
      }
    }

    await prisma.cart.delete({ where: { id: guestCart.id } });
    const mergedCart = await getOrCreateCart(userId, null);
    const discount = await calcCouponDiscount(mergedCart);
    return res.status(200).json({ success: true, message: 'Cart merged', data: formatCart(mergedCart, discount) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, applyCoupon, removeCoupon, mergeCart };