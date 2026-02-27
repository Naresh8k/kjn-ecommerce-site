const express = require('express');
const router = express.Router();
const { addReview, getProductReviews, approveReview } = require('./review.controller');
const { protect, adminOnly } = require('../../middleware/auth.middleware');

router.post('/', protect, addReview);
router.get('/:productId', getProductReviews);
router.put('/admin/:id/approve', protect, adminOnly, approveReview);

module.exports = router;