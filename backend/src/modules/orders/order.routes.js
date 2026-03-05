const express = require('express');
const router = express.Router();
const { placeOrder, getMyOrders, getOrderById, cancelOrder, getAllOrders, updateOrderStatus, getHappyCustomers } = require('./order.controller');
const { protect, adminOnly } = require('../../middleware/auth.middleware');

router.post('/', protect, placeOrder);
router.get('/', protect, getMyOrders);
router.get('/happy/customers', getHappyCustomers);
router.get('/:id', protect, getOrderById);
router.post('/:id/cancel', protect, cancelOrder);

// Admin
router.get('/admin/all', protect, adminOnly, getAllOrders);
router.put('/admin/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;