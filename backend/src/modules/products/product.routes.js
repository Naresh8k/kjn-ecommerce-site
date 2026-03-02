const express = require('express');
const router = express.Router();
const { getProducts, getProductBySlug, searchProducts, createProduct, updateProduct, deleteProduct } = require('./product.controller');
const { protect, adminOnly } = require('../../middleware/auth.middleware');

router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/:slug', getProductBySlug);

// Admin routes (with a relaxed limiter so bulk operations don't hit 429)
const { adminLimiter } = require('../../middleware/rateLimiter.middleware');
router.post('/', protect, adminOnly, adminLimiter, createProduct);
router.put('/:id', protect, adminOnly, adminLimiter, updateProduct);
router.delete('/:id', protect, adminOnly, adminLimiter, deleteProduct);

module.exports = router;