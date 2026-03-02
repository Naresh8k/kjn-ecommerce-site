const express = require('express');
const router = express.Router();
const { getBanners, getAllBannersAdmin, createBanner, updateBanner, deleteBanner } = require('./banner.controller');
const { protect, adminOnly } = require('../../middleware/auth.middleware');

// Public
router.get('/', getBanners);

// Admin
router.get('/admin/all', protect, adminOnly, getAllBannersAdmin);
router.post('/', protect, adminOnly, createBanner);
router.put('/:id', protect, adminOnly, updateBanner);
router.delete('/:id', protect, adminOnly, deleteBanner);

module.exports = router;