const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, getUserDetail, getLowStockProducts, updateStock, getRevenueReport, getAdminProducts } = require('./admin.controller');
const { protect, adminOnly } = require('../../middleware/auth.middleware');
const { adminLimiter } = require('../../middleware/rateLimiter.middleware');

// Apply authentication/authorization first, then a generous rate limiter
router.use(protect, adminOnly, adminLimiter);

router.get('/dashboard', getDashboardStats);
router.get('/products', getAdminProducts);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetail);
router.get('/low-stock', getLowStockProducts);
router.put('/products/:id/stock', updateStock);
router.get('/revenue-report', getRevenueReport);

module.exports = router;