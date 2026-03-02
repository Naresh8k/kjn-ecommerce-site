const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeCartItem, applyCoupon, removeCoupon, mergeCart } = require('./cart.controller');
const { protect, optionalProtect } = require('../../middleware/auth.middleware');

router.get('/',            optionalProtect, getCart);
router.post('/items',      optionalProtect, addToCart);
router.put('/items/:id',   optionalProtect, updateCartItem);
router.delete('/items/:id',optionalProtect, removeCartItem);
router.post('/coupon',     protect, applyCoupon);
router.delete('/coupon',   protect, removeCoupon);
router.post('/merge',      protect, mergeCart);

module.exports = router;