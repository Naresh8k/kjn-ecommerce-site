const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeCartItem, applyCoupon, removeCoupon, mergeCart } = require('./cart.controller');
const { protect } = require('../../middleware/auth.middleware');

router.get('/', getCart);
router.post('/items', addToCart);
router.put('/items/:id', updateCartItem);
router.delete('/items/:id', removeCartItem);
router.post('/coupon', protect, applyCoupon);
router.delete('/coupon', protect, removeCoupon);
router.post('/merge', protect, mergeCart);

module.exports = router;