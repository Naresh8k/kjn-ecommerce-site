const prisma = require('../../config/db');

// Get or create cart helper
const getOrCreateCart = async (userId, sessionId) => {
  if (userId) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } }, variant: true } } },
    });
    if (!cart) cart = await prisma.cart.create({ data: { userId }, include: { items: { include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } }, variant: true } } } });
    return cart;
  }
  if (sessionId) {
    let cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: { items: { include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } }, variant: true } } },
    });
    if (!cart) cart = await prisma.cart.create({ data: { sessionId }, include: { items: { include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } }, variant: true } } } });
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
    image: item.product.images[0]?.url || null,
    variant: item.variant ? `${item.variant.variantName}: ${item.variant.variantValue}` : null,
    variantId: item.variantId,
    quantity: item.quantity,
    unitPrice: parseFloat(item.priceAtAdd),
    mrp: parseFloat(item.product.mrp),
    totalPrice: parseFloat(item.priceAtAdd) * item.quantity,
    inStock: item.product.stockQuantity >= item.quantity,
  }));

  const subtotal = items.reduce((a, b) => a + b.totalPrice, 0);
  const gstAmount = items.reduce((a, b) => {
    const gst = parseFloat(b.product?.gstPercent || 18);
    return a + (b.totalPrice * gst) / (100 + gst);
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

const getCart = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const sessionId = req.headers['x-session-id'] || null;
    if (!userId && !sessionId) return res.status(400).json({ success: false, message: 'Session ID required for guest cart' });

    const cart = await getOrCreateCart(userId, sessionId);
    return res.status(200).json({ success: true, data: formatCart(cart) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, variantId, quantity = 1 } = req.body;
    const userId = req.user?.id || null;
    const sessionId = req.headers['x-session-id'] || null;

    if (!productId) return res.status(400).json({ success: false, message: 'Product ID required' });

    // Check product exists and has stock
    const product = await prisma.product.findUnique({ where: { id: productId, isActive: true } });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.stockQuantity < quantity) return res.status(400).json({ success: false, message: 'Insufficient stock' });

    const cart = await getOrCreateCart(userId, sessionId);

    // Calculate price
    let price = parseFloat(product.sellingPrice);
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
    return res.status(200).json({ success: true, message: 'Added to cart', data: formatCart(updatedCart) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
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
    return res.status(200).json({ success: true, data: formatCart(updatedCart) });
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

    const updatedCart = await getOrCreateCart(userId, sessionId);
    return res.status(200).json({ success: true, message: 'Item removed', data: formatCart(updatedCart) });
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

    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase(), isActive: true } });
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });

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
    return res.status(200).json({ success: true, message: 'Coupon removed', data: formatCart(updatedCart) });
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
    return res.status(200).json({ success: true, message: 'Cart merged', data: formatCart(mergedCart) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, applyCoupon, removeCoupon, mergeCart };