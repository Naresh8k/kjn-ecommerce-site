const express = require('express');
const router = express.Router();
const { canReview, addReview, getProductReviews, approveReview, deleteReview, getPendingReviews } = require('./review.controller');
const { protect, adminOnly } = require('../../middleware/auth.middleware');
const { upload } = require('../../middleware/upload');

// Public — get approved reviews for a product
router.get('/product/:productId', getProductReviews);

// Authenticated — check if user can review this product
router.get('/can-review/:productId', protect, canReview);

// Authenticated — submit review with up to 5 images
router.post('/', protect, upload.array('images', 5), addReview);

// Admin
router.get('/admin/pending', protect, adminOnly, getPendingReviews);
router.put('/admin/:id/approve', protect, adminOnly, approveReview);
router.delete('/admin/:id', protect, adminOnly, deleteReview);

module.exports = router;

