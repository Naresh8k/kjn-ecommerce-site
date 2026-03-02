const prisma = require('../../config/db');

// Generate order number
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `KJN${year}${month}${random}`;
};

const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddressId, paymentMethod, notes } = req.body;

    if (!shippingAddressId || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'Shipping address and payment method required' });
    }

    // Get user cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }], take: 1 },
              },
            },
            variant: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Verify address belongs to user
    const address = await prisma.address.findFirst({ where: { id: shippingAddressId, userId } });
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });

    // Verify stock and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      if (item.product.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${item.product.name} only has ${item.product.stockQuantity} units in stock`,
        });
      }

      const itemTotal = parseFloat(item.priceAtAdd) * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: item.productId,
        variantId: item.variantId || null,
        productName: item.product.name,
        productImage: item.product.images?.[0]?.image || null,
        variantInfo: item.variant ? `${item.variant.variantName}: ${item.variant.variantValue}` : null,
        quantity: item.quantity,
        unitPrice: parseFloat(item.priceAtAdd),
        mrp: parseFloat(item.product.mrp),
        gstPercent: parseFloat(item.product.gstPercent),
        totalPrice: itemTotal,
      });
    }

    // Apply coupon if any
    let discountAmount = 0;
    if (cart.couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: cart.couponCode, isActive: true } });
      if (coupon) {
        if (coupon.type === 'PERCENT') {
          discountAmount = (subtotal * parseFloat(coupon.value)) / 100;
          if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, parseFloat(coupon.maxDiscount));
        } else if (coupon.type === 'FLAT') {
          discountAmount = parseFloat(coupon.value);
        }
      }
    }

    const gstAmount = orderItems.reduce((a, b) => a + (b.totalPrice * b.gstPercent) / (100 + b.gstPercent), 0);
    const shippingCharge = subtotal >= 500 ? 0 : 99;

    // Prepaid discount (1.5%)
    let prepaidDiscount = 0;
    if (paymentMethod !== 'COD') {
      prepaidDiscount = (subtotal - discountAmount) * 0.015;
      discountAmount += prepaidDiscount;
    }

    const totalAmount = subtotal - discountAmount + shippingCharge;

    // Create order with transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          shippingAddressId,
          paymentMethod,
          notes: notes || null,
          couponCode: cart.couponCode || null,
          subtotal: parseFloat(subtotal.toFixed(2)),
          discountAmount: parseFloat(discountAmount.toFixed(2)),
          gstAmount: parseFloat(gstAmount.toFixed(2)),
          shippingCharge: parseFloat(shippingCharge.toFixed(2)),
          totalAmount: parseFloat(totalAmount.toFixed(2)),
          status: paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING',
          paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
          items: { create: orderItems },
        },
        include: { items: true, shippingAddress: true },
      });

      // Reduce stock for each product
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        });
      }

      // Update coupon usage count
      if (cart.couponCode) {
        const coupon = await tx.coupon.findUnique({ where: { code: cart.couponCode } });
        if (coupon) {
          await tx.coupon.update({ where: { id: coupon.id }, data: { usesCount: { increment: 1 } } });
          await tx.couponUsage.create({ data: { couponId: coupon.id, userId, orderId: newOrder.id } });
        }
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.update({ where: { id: cart.id }, data: { couponCode: null } });

      return newOrder;
    });

    // Send notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'order_update',
        title: 'Order Placed Successfully!',
        message: `Your order ${order.orderNumber} has been placed. Total: ₹${order.totalAmount}`,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        totalAmount: parseFloat(order.totalAmount),
        status: order.status,
        paymentMethod: order.paymentMethod,
      },
    });
  } catch (error) {
    console.error('placeOrder error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        skip, take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }], take: 1 },
                },
              },
            },
          },
          shippingAddress: true,
        },
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    return res.status(200).json({
      success: true,
      data: orders,
      pagination: { total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }], take: 1 },
              },
            },
            variant: true,
          },
        },
        shippingAddress: true,
        user: { select: { name: true, email: true, phone: true } },
      },
    });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await prisma.order.findFirst({ where: { id, userId } });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id }, data: { status: 'CANCELLED' } });

      // Restore stock
      const items = await tx.orderItem.findMany({ where: { orderId: id } });
      for (const item of items) {
        await tx.product.update({ where: { id: item.productId }, data: { stockQuantity: { increment: item.quantity } } });
      }
    });

    await prisma.notification.create({
      data: { userId, type: 'order_update', title: 'Order Cancelled', message: `Your order ${order.orderNumber} has been cancelled.` },
    });

    return res.status(200).json({ success: true, message: 'Order cancelled successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ADMIN — Get all orders
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where, skip, take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, phone: true, email: true } }, shippingAddress: true, items: true },
      }),
      prisma.order.count({ where }),
    ]);

    return res.status(200).json({
      success: true, data: orders,
      pagination: { total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ADMIN — Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingId, awbNumber } = req.body;

    const order = await prisma.order.update({
      where: { id },
      data: { status, trackingId: trackingId || undefined, awbNumber: awbNumber || undefined },
      include: { user: true },
    });

    await prisma.notification.create({
      data: {
        userId: order.userId,
        type: 'order_update',
        title: `Order ${status.replace('_', ' ')}`,
        message: `Your order ${order.orderNumber} is now ${status.toLowerCase().replace('_', ' ')}.${awbNumber ? ` Tracking: ${awbNumber}` : ''}`,
      },
    });

    return res.status(200).json({ success: true, message: 'Order status updated', data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { placeOrder, getMyOrders, getOrderById, cancelOrder, getAllOrders, updateOrderStatus };