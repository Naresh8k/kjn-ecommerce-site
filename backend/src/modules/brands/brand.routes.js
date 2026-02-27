const express = require('express');
const router = express.Router();
const { getBrands, getBrandProducts, createBrand } = require('./brand.controller');
const { protect, adminOnly } = require('../../middleware/auth.middleware');

router.get('/', getBrands);
router.get('/:slug/products', getBrandProducts);
router.post('/', protect, adminOnly, createBrand);

module.exports = router;