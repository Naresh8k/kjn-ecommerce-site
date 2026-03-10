const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
  initiateRefund,
  getRefunds,
  getPaymentDetails,
  getPaymentsList,
  getPaymentSummary,
  getSettlements,
  getDisputes,
} = require('./payment.controller');
const { protect, adminOnly } = require('../../middleware/auth.middleware');

// Webhook — raw body required for HMAC signature verification
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Customer
router.post('/create-order', protect, createPaymentOrder);
router.post('/verify', protect, verifyPayment);

// Admin — refunds
router.post('/refund', protect, adminOnly, initiateRefund);
router.get('/refunds', protect, adminOnly, getRefunds);

// Admin — Razorpay data
router.get('/summary', protect, adminOnly, getPaymentSummary);
router.get('/list', protect, adminOnly, getPaymentsList);
router.get('/settlements', protect, adminOnly, getSettlements);
router.get('/disputes', protect, adminOnly, getDisputes);
router.get('/details/:paymentId', protect, adminOnly, getPaymentDetails);

module.exports = router;