const express = require('express');
const router = express.Router();
const { getCategories, getCategoryProducts, createCategory, updateCategory, deleteCategory } = require('./category.controller');
const { protect, adminOnly } = require('../../middleware/auth.middleware');

router.get('/', getCategories);
router.get('/:slug/products', getCategoryProducts);
router.post('/', protect, adminOnly, createCategory);
router.put('/:id', protect, adminOnly, updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

module.exports = router;