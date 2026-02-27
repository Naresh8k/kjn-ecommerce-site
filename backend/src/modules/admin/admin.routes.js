const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, getLowStockProducts, updateStock, getRevenueReport } = require('./admin.controller');
const { protect, adminOnly } = require('../../middleware/auth.middleware');

router.use(protect, adminOnly); // All admin routes protected

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/low-stock', getLowStockProducts);
router.put('/products/:id/stock', updateStock);
router.get('/revenue-report', getRevenueReport);

module.exports = router;