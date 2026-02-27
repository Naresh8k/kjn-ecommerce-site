const express = require('express');
const router = express.Router();
const { getCategories, getCategoryProducts, createCategory } = require('./category.controller');
const { protect, adminOnly } = require('../../middleware/auth.middleware');

router.get('/', getCategories);
router.get('/:slug/products', getCategoryProducts);
router.post('/', protect, adminOnly, createCategory);

module.exports = router;