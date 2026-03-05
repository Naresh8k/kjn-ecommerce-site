const express = require('express');
const router = express.Router();
const { getActiveFlashSales } = require('./flashSale.controller');

// Public — active flash sales for storefront
router.get('/active', getActiveFlashSales);

module.exports = router;
