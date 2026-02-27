const express = require('express');
const router = express.Router();
const { getProducts, getProductBySlug, searchProducts, createProduct, updateProduct, deleteProduct } = require('./product.controller');
const { protect, adminOnly } = require('../../middleware/auth.middleware');

router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/:slug', getProductBySlug);

// Admin routes
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;