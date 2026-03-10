// backend/src/modules/shipmozo/shipmozo.controller.js
const prisma = require('../../config/db');
const shipmozo = require('../../config/shipmozo');
const { sendOrderEmail } = require('../orders/order.email');

/**
 * POST /api/shipmozo/orders/:orderId/create-shipment  (admin)
 * Creates a shipment on ShipMozo for a given order.
 * Accepts optional override fields in the request body (weight, dimensions).
 */
const createShipment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { weightGrams, length, breadth, height } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        shippingAddress: true,
        user: { select: { name: true, email: true, phone: true } },
        items: { include: { product: { select: { weightGrams: true } } } },
      },
    });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.shipmozoShipmentId) {
      return res.status(400).json({ success: false, message: 'Shipment already created for this order', shipmozoShipmentId: order.shipmozoShipmentId });
    }

    // Calculate total weight from product weights, fallback to 500g per item
    const calculatedWeight = order.items.reduce((sum, item) => {
      const w = item.product?.weightGrams || 500;
      return sum + w * item.quantity;
    }, 0);

    const addr = order.shippingAddress;

    const result = await shipmozo.createShipment({
      orderNumber: order.orderNumber,
      weightGrams: weightGrams || calculatedWeight || 500,
      length: length || 15,
      breadth: breadth || 15,
      height: height || 10,
      paymentMode: order.paymentMethod === 'COD' ? 'COD' : 'PREPAID',
      declaredValue: parseFloat(order.totalAmount),
      codAmount: order.paymentMethod === 'COD' ? parseFloat(order.totalAmount) : undefined,
      consignee: {
        name: addr.name,
        phone: addr.phone,
        address: addr.line1,
        address2: addr.line2 || '',
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
      },
    });

    // Extract AWB and shipment ID from response
    const awbNumber = result?.data?.awb_number || result?.awb_number || result?.awb || null;
    const shipmozoShipmentId = result?.data?.shipment_id || result?.shipment_id || result?.order_id || null;
    const courierName = result?.data?.courier_name || result?.courier_name || null;

    // Persist to order
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        awbNumber: awbNumber || order.awbNumber,
        shipmozoShipmentId: shipmozoShipmentId ? String(shipmozoShipmentId) : null,
        shipmozoCourier: courierName,
        status: 'PROCESSING',
      },
      include: { user: true, items: true, shippingAddress: true },
    });

    // Notify customer
    await prisma.notification.create({
      data: {
        userId: order.userId,
        type: 'ORDER_UPDATE',
        title: 'Shipment Created',
        message: `Your order #${order.orderNumber} has been booked for shipping${courierName ? ` via ${courierName}` : ''}.${awbNumber ? ` AWB: ${awbNumber}` : ''}`,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Shipment created on ShipMozo',
      data: {
        shipmozoShipmentId,
        awbNumber,
        courierName,
        raw: result,
      },
    });
  } catch (err) {
    console.error('createShipment error:', err?.response?.data || err.message);
    const msg = err?.response?.data?.message || err.message || 'ShipMozo API error';
    return res.status(500).json({ success: false, message: msg });
  }
};

/**
 * GET /api/shipmozo/track/:awbNumber  (public - for customers)
 * Returns live tracking info from ShipMozo.
 */
const trackByAwb = async (req, res) => {
  try {
    const { awbNumber } = req.params;
    if (!awbNumber) return res.status(400).json({ success: false, message: 'AWB number required' });

    const result = await shipmozo.trackShipment(awbNumber);

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error('trackByAwb error:', err?.response?.data || err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch tracking info' });
  }
};

/**
 * GET /api/shipmozo/orders/:orderId/track  (authenticated - customer or admin)
 * Looks up the order's AWB and returns live tracking info.
 */
const trackOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'STAFF';

    const where = isAdmin ? { id: orderId } : { id: orderId, userId };
    const order = await prisma.order.findFirst({ where, select: { id: true, awbNumber: true, orderNumber: true, shipmozoCourier: true } });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!order.awbNumber) {
      return res.status(200).json({ success: true, data: null, message: 'No tracking info yet' });
    }

    const tracking = await shipmozo.trackShipment(order.awbNumber);
    return res.status(200).json({
      success: true,
      data: {
        awbNumber: order.awbNumber,
        courier: order.shipmozoCourier,
        tracking,
      },
    });
  } catch (err) {
    console.error('trackOrder error:', err?.response?.data || err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch tracking info' });
  }
};

/**
 * POST /api/shipmozo/orders/:orderId/cancel-shipment  (admin)
 * Cancels the shipment on ShipMozo.
 */
const cancelShipment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!order.awbNumber) return res.status(400).json({ success: false, message: 'No AWB number on this order' });

    const result = await shipmozo.cancelShipment(order.awbNumber);

    return res.status(200).json({ success: true, message: 'Shipment cancellation requested', data: result });
  } catch (err) {
    console.error('cancelShipment error:', err?.response?.data || err.message);
    return res.status(500).json({ success: false, message: 'Failed to cancel shipment on ShipMozo' });
  }
};

/**
 * GET /api/shipmozo/serviceability  (admin)
 * Check if a pincode is serviceable.
 */
const checkServiceability = async (req, res) => {
  try {
    const { pincode, weight = 500, paymentMode = 'PREPAID' } = req.query;
    if (!pincode) return res.status(400).json({ success: false, message: 'pincode required' });

    const result = await shipmozo.getServiceability(pincode, parseInt(weight), paymentMode);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error('checkServiceability error:', err?.response?.data || err.message);
    return res.status(500).json({ success: false, message: 'Failed to check serviceability' });
  }
};

// ??? ShipMozo status string ? your OrderStatus enum ??????????????????????????
//
// ShipMozo sends a "current_status" or "status" string in the webhook payload.
// Map every known ShipMozo status to the closest OrderStatus value.
// Statuses NOT listed here are ignored (no DB update triggered).
//
const SHIPMOZO_STATUS_MAP = {
  // Pickup / processing
  'pickup scheduled':      'PROCESSING',
  'pickup generated':      'PROCESSING',
  'out for pickup':        'PROCESSING',
  'picked up':             'PROCESSING',
  'pickup done':           'PROCESSING',
  'manifested':            'PROCESSING',

  // In transit / shipped
  'in transit':            'SHIPPED',
  'shipment booked':       'SHIPPED',
  'shipped':               'SHIPPED',
  'dispatched':            'SHIPPED',
  'reached at hub':        'SHIPPED',
  'reached at destination hub': 'SHIPPED',

  // Out for delivery
  'out for delivery':      'OUT_FOR_DELIVERY',
  'with delivery agent':   'OUT_FOR_DELIVERY',

  // Delivered
  'delivered':             'DELIVERED',
  'delivery done':         'DELIVERED',

  // Cancelled / returned
  'cancelled':             'CANCELLED',
  'rto initiated':         'RETURNED',
  'rto in transit':        'RETURNED',
  'rto delivered':         'RETURNED',
  'return initiated':      'RETURNED',
  'return in transit':     'RETURNED',
  'return delivered':      'RETURNED',
};

/**
 * POST /api/shipmozo/webhook  (public - called by ShipMozo)
 *
 * ShipMozo posts a JSON payload whenever a shipment status changes.
 * We look up the order by AWB, map the status, update the DB,
 * send a customer notification + email, all silently (always 200 back to ShipMozo).
 *
 * ShipMozo expects a 200 response quickly - we do all work synchronously
 * but never let errors propagate back as non-200.
 */
const handleWebhook = async (req, res) => {
  // Always ACK immediately so ShipMozo does not retry
  res.status(200).json({ received: true });

  try {
    const payload = req.body;

    // ShipMozo webhook payload shape (may vary slightly by account config):
    // { awb: "...", current_status: "...", order_reference_id: "KJNxxxxx", ... }
    // Also seen: { data: { awb_number: "...", current_status: "..." } }
    const awb =
      payload?.awb ||
      payload?.awb_number ||
      payload?.data?.awb_number ||
      payload?.data?.awb ||
      null;

    const rawStatus = (
      payload?.current_status ||
      payload?.status ||
      payload?.data?.current_status ||
      payload?.data?.status ||
      ''
    ).toLowerCase().trim();

    const orderRef =
      payload?.order_reference_id ||
      payload?.reference_id ||
      payload?.data?.order_reference_id ||
      null;

    console.log(`[ShipMozo Webhook] awb=${awb} status="${rawStatus}" ref=${orderRef}`);

    if (!awb && !orderRef) {
      console.warn('[ShipMozo Webhook] No AWB or order reference in payload, skipping');
      return;
    }

    // Map to our status
    const newStatus = SHIPMOZO_STATUS_MAP[rawStatus];
    if (!newStatus) {
      console.log(`[ShipMozo Webhook] Unmapped status "${rawStatus}", ignoring`);
      return;
    }

    // Find order by AWB first, fall back to order number
    let order = null;
    if (awb) {
      order = await prisma.order.findFirst({
        where: { awbNumber: awb },
        include: { user: { select: { email: true, name: true } }, shippingAddress: true, items: true },
      });
    }
    if (!order && orderRef) {
      order = await prisma.order.findFirst({
        where: { orderNumber: orderRef },
        include: { user: { select: { email: true, name: true } }, shippingAddress: true, items: true },
      });
    }

    if (!order) {
      console.warn(`[ShipMozo Webhook] Order not found for awb=${awb} ref=${orderRef}`);
      return;
    }

    // Don't go backwards (e.g. don't change DELIVERED ? SHIPPED)
    const STATUS_RANK = {
      PENDING: 0, CONFIRMED: 1, PROCESSING: 2, SHIPPED: 3,
      OUT_FOR_DELIVERY: 4, DELIVERED: 5, CANCELLED: 6, RETURNED: 7, REFUNDED: 8,
    };
    const currentRank = STATUS_RANK[order.status] ?? 0;
    const newRank = STATUS_RANK[newStatus] ?? 0;

    if (newRank <= currentRank && !['CANCELLED', 'RETURNED'].includes(newStatus)) {
      console.log(`[ShipMozo Webhook] Order ${order.orderNumber} already at ${order.status}, skipping downgrade to ${newStatus}`);
      return;
    }

    // Update order in DB
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: newStatus,
        ...(newStatus === 'DELIVERED' ? { paymentStatus: 'PAID' } : {}),
      },
      include: { items: true, shippingAddress: true },
    });

    console.log(`[ShipMozo Webhook] Order ${order.orderNumber}: ${order.status} -> ${newStatus}`);

    // Build notification message
    const notifMessages = {
      PROCESSING:        `Your order #${order.orderNumber} has been picked up by the courier.`,
      SHIPPED:           `Your order #${order.orderNumber} is in transit.${awb ? ` AWB: ${awb}` : ''}`,
      OUT_FOR_DELIVERY:  `Your order #${order.orderNumber} is out for delivery today!`,
      DELIVERED:         `Your order #${order.orderNumber} has been delivered. Thank you for shopping with us!`,
      CANCELLED:         `Your order #${order.orderNumber} shipment has been cancelled.`,
      RETURNED:          `Your order #${order.orderNumber} is being returned.`,
    };

    const notifTitles = {
      PROCESSING:        'Shipment Picked Up',
      SHIPPED:           'Order Shipped',
      OUT_FOR_DELIVERY:  'Out for Delivery',
      DELIVERED:         'Order Delivered',
      CANCELLED:         'Shipment Cancelled',
      RETURNED:          'Order Returned',
    };

    // Create in-app notification
    await prisma.notification.create({
      data: {
        userId: order.userId,
        type: `ORDER_${newStatus}`,
        title: notifTitles[newStatus] || `Order ${newStatus}`,
        message: notifMessages[newStatus] || `Your order #${order.orderNumber} status: ${newStatus}`,
      },
    });

    // Send email (non-blocking, fire-and-forget)
    const { sendOrderEmail } = require('../orders/order.email');
    sendOrderEmail(
      order.user?.email,
      newStatus,
      { ...updated, awbNumber: awb || order.awbNumber },
      order.user?.name || 'Customer'
    ).catch(err => console.error('[ShipMozo Webhook] Email error:', err.message));

  } catch (err) {
    // Log but never crash - we already sent 200
    console.error('[ShipMozo Webhook] Processing error:', err.message);
  }
};

module.exports = { createShipment, trackByAwb, trackOrder, cancelShipment, checkServiceability, handleWebhook };
