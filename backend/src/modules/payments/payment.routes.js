const express = require('express');
const router = express.Router();
const { createPaymentOrder, verifyPayment, handleWebhook, initiateRefund } = require('./payment.controller');
const { protect, adminOnly } = require('../../middleware/auth.middleware');

router.post('/create-order', protect, createPaymentOrder);
router.post('/verify', protect, verifyPayment);
router.post('/webhook', handleWebhook); // No auth — Razorpay calls this directly
router.post('/refund', protect, adminOnly, initiateRefund);

module.exports = router;