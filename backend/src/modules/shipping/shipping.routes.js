const express = require('express');
const router = express.Router();
const { checkPincode, calculateShipping } = require('./shipping.controller');

router.get('/check/:pincode', checkPincode);
router.post('/calculate', calculateShipping);

module.exports = router;