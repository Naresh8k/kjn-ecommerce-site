const Razorpay = require('razorpay');
const crypto = require('crypto');
const prisma = require('../../config/db');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─────────────────────────────────────────────
// CREATE RAZORPAY ORDER
// POST /api/payments/create-order
// ─────────────────────────────────────────────
const createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
    });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.paymentStatus === 'PAID') return res.status(400).json({ success: false, message: 'Order already paid' });

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(parseFloat(order.totalAmount) * 100), // paise
      currency: 'INR',
      receipt: order.orderNumber,
      notes: { orderId: order.id, userId },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { razorpayOrderId: razorpayOrder.id },
    });

    return res.status(200).json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        orderNumber: order.orderNumber,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error('createPaymentOrder error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────
// VERIFY PAYMENT AFTER SUCCESS
// POST /api/payments/verify
// ─────────────────────────────────────────────
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Update order
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
        paymentId: razorpay_payment_id,
        status: 'CONFIRMED',
      },
      include: { user: true },
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId: order.userId,
        type: 'order_update',
        title: 'Payment Successful!',
        message: `Payment received for order ${order.orderNumber}. We are processing your order.`,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: { orderNumber: order.orderNumber, status: order.status },
    });
  } catch (error) {
    console.error('verifyPayment error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────
// RAZORPAY WEBHOOK (automatic payment updates)
// POST /api/payments/webhook
// ─────────────────────────────────────────────
const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const { event, payload } = req.body;

    if (event === 'payment.captured') {
      const paymentId = payload.payment.entity.id;
      const razorpayOrderId = payload.payment.entity.order_id;

      await prisma.order.updateMany({
        where: { razorpayOrderId },
        data: { paymentStatus: 'PAID', paymentId, status: 'CONFIRMED' },
      });
    }

    if (event === 'payment.failed') {
      const razorpayOrderId = payload.payment.entity.order_id;
      await prisma.order.updateMany({
        where: { razorpayOrderId },
        data: { paymentStatus: 'FAILED', status: 'CANCELLED' },
      });
    }

    if (event === 'refund.processed') {
      const paymentId = payload.refund.entity.payment_id;
      await prisma.order.updateMany({
        where: { paymentId },
        data: { paymentStatus: 'REFUNDED', status: 'REFUNDED' },
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('webhook error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ADMIN — Initiate Refund
const initiateRefund = async (req, res) => {
  try {
    const { orderId, reason } = req.body;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!order.paymentId) return res.status(400).json({ success: false, message: 'No payment found for this order' });

    const refund = await razorpay.payments.refund(order.paymentId, {
      amount: Math.round(parseFloat(order.totalAmount) * 100),
      notes: { reason, orderId },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'REFUNDED', paymentStatus: 'REFUNDED' },
    });

    await prisma.notification.create({
      data: {
        userId: order.userId,
        type: 'order_update',
        title: 'Refund Initiated',
        message: `Refund of ₹${order.totalAmount} for order ${order.orderNumber} has been initiated. It will reflect in 5-7 business days.`,
      },
    });

    return res.status(200).json({ success: true, message: 'Refund initiated', data: refund });
  } catch (error) {
    console.error('initiateRefund error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createPaymentOrder, verifyPayment, handleWebhook, initiateRefund };