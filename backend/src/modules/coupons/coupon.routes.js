const express = require('express');
const router = express.Router();
const { createCoupon, getAllCoupons, getActiveCoupons, toggleCoupon, validateCoupon } = require('./coupon.controller');
const { protect, adminOnly } = require('../../middleware/auth.middleware');

router.get('/active', getActiveCoupons);          // public — no auth needed
router.post('/validate', protect, validateCoupon);
router.get('/', protect, adminOnly, getAllCoupons);
router.post('/', protect, adminOnly, createCoupon);
router.put('/:id/toggle', protect, adminOnly, toggleCoupon);

module.exports = router;