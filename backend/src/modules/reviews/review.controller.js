const prisma = require('../../config/db');

const addReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, rating, title, body } = req.body;

    if (!productId || !rating) return res.status(400).json({ success: false, message: 'Product and rating required' });
    if (rating < 1 || rating > 5) return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });

    // Check if user already reviewed
    const existing = await prisma.review.findUnique({ where: { userId_productId: { userId, productId } } });
    if (existing) return res.status(400).json({ success: false, message: 'You have already reviewed this product' });

    // Check if verified purchase
    const purchase = await prisma.orderItem.findFirst({
      where: { productId, order: { userId, status: 'DELIVERED' } },
    });

    const review = await prisma.review.create({
      data: { userId, productId, rating: parseInt(rating), title, body, isVerifiedPurchase: !!purchase },
      include: { user: { select: { name: true, avatarUrl: true } } },
    });

    return res.status(201).json({ success: true, message: 'Review submitted for approval', data: review });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { productId, isApproved: true },
      include: { user: { select: { name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const total = reviews.length;
    const average = total > 0 ? (reviews.reduce((a, b) => a + b.rating, 0) / total).toFixed(1) : 0;
    const distribution = [5, 4, 3, 2, 1].map((star) => ({
      star, count: reviews.filter((r) => r.rating === star).length,
    }));

    return res.status(200).json({ success: true, data: { reviews, total, average, distribution } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin approve review
const approveReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await prisma.review.update({ where: { id }, data: { isApproved: true } });
    return res.status(200).json({ success: true, message: 'Review approved', data: review });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { addReview, getProductReviews, approveReview };