const express = require('express');
const router = express.Router();
const { getBrands, getBrandProducts, createBrand, updateBrand, deleteBrand } = require('./brand.controller');
const { protect, adminOnly } = require('../../middleware/auth.middleware');

router.get('/', getBrands);
router.get('/:slug/products', getBrandProducts);
router.post('/', protect, adminOnly, createBrand);
router.put('/:id', protect, adminOnly, updateBrand);
router.delete('/:id', protect, adminOnly, deleteBrand);

module.exports = router;