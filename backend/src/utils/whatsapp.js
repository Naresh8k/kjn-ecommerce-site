// ─────────────────────────────────────────────────────────────
// src/utils/whatsapp.js
// WhatsApp Business API via Interakt (https://interakt.ai)
// Set INTERAKT_API_KEY in backend/.env to enable
// ─────────────────────────────────────────────────────────────

const axios = require('axios');

const INTERAKT_BASE = 'https://api.interakt.ai/v1/public/message/';

const sendWhatsApp = async (phone, templateName, bodyValues = [], headerValue = null) => {
  if (!process.env.INTERAKT_API_KEY) {
    console.log(`[WhatsApp SKIP - no API key] ${templateName} → ${phone}`, bodyValues);
    return;
  }

  try {
    const payload = {
      countryCode: '+91',
      phoneNumber: phone,
      callbackData: `${templateName}_${Date.now()}`,
      type: 'Template',
      template: {
        name: templateName,
        languageCode: 'en',
        ...(headerValue && {
          headerValues: [headerValue],
        }),
        bodyValues,
      },
    };

    const res = await axios.post(INTERAKT_BASE, payload, {
      headers: {
        Authorization: `Basic ${process.env.INTERAKT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 8000,
    });

    console.log(`[WhatsApp OK] ${templateName} → +91${phone}`);
    return res.data;
  } catch (err) {
    // Never crash the order flow due to WhatsApp failure
    console.error(`[WhatsApp ERROR] ${templateName} → ${phone}:`, err?.response?.data || err.message);
  }
};

// ── Public helpers ────────────────────────────────────────────

/**
 * OTP login message
 * Template body: "Hi {1}, your KJN Shop OTP is {2}. Valid for 10 minutes."
 */
const sendOTPWhatsApp = async (phone, otp, name) => {
  return sendWhatsApp(phone, 'kjn_login_otp', [name || 'Customer', otp]);
};

/**
 * Order confirmed message
 * Template body: "Hi {1}, your order #{2} worth ₹{3} is confirmed! We'll notify you when it ships."
 */
const sendOrderConfirmed = async (phone, name, orderNumber, amount) => {
  return sendWhatsApp(phone, 'kjn_order_confirmed', [
    name,
    orderNumber,
    amount.toLocaleString('en-IN'),
  ]);
};

/**
 * Order shipped message
 * Template body: "Great news {1}! Order #{2} has been shipped. AWB: {3}. Track at: {4}"
 */
const sendOrderShipped = async (phone, name, orderNumber, awbNumber, trackingUrl) => {
  return sendWhatsApp(phone, 'kjn_order_shipped', [
    name,
    orderNumber,
    awbNumber || 'N/A',
    trackingUrl || 'https://panel.shipmozo.com',
  ]);
};

/**
 * Out for delivery message
 * Template body: "Hi {1}! Your order #{2} is out for delivery today. Please keep your phone available."
 */
const sendOutForDelivery = async (phone, name, orderNumber) => {
  return sendWhatsApp(phone, 'kjn_out_for_delivery', [name, orderNumber]);
};

/**
 * Order delivered message
 * Template body: "Hi {1}! Order #{2} delivered. We hope you love it! Rate your experience: {3}"
 */
const sendOrderDelivered = async (phone, name, orderNumber, reviewUrl) => {
  return sendWhatsApp(phone, 'kjn_order_delivered', [
    name,
    orderNumber,
    reviewUrl || 'https://www.shopatkjn.com',
  ]);
};

/**
 * Order cancelled message
 * Template body: "Hi {1}, your order #{2} has been cancelled. Refund of ₹{3} will be processed in 5-7 days."
 */
const sendOrderCancelled = async (phone, name, orderNumber, refundAmount) => {
  return sendWhatsApp(phone, 'kjn_order_cancelled', [
    name,
    orderNumber,
    refundAmount > 0 ? refundAmount.toLocaleString('en-IN') : '0',
  ]);
};

module.exports = {
  sendOTPWhatsApp,
  sendOrderConfirmed,
  sendOrderShipped,
  sendOutForDelivery,
  sendOrderDelivered,
  sendOrderCancelled,
};