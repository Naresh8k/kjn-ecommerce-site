const prisma = require('../../config/db');
const { processWithPreset } = require('../../utils/imageBase64');

// ??? Shared include fragment ??????????????????????????????????????????????????
const reviewInclude = {
  user: { select: { name: true, avatar: true } },
  images: { orderBy: { sortOrder: 'asc' } },
};

// ??? GET /api/reviews/can-review/:productId ??????????????????????????????????
// Returns whether the logged-in user can review a product:
//   - must have a DELIVERED order containing this product
//   - must not have already reviewed it
const canReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const purchase = await prisma.orderItem.findFirst({
      where: { productId, order: { userId, status: 'DELIVERED' } },
    });

    if (!purchase) {
      return res.status(200).json({
        success: true,
        canReview: false,
        reason: 'no_purchase',
        message: 'You can only review products you have purchased and received.',
      });
    }

    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        canReview: false,
        reason: 'already_reviewed',
        message: 'You have already submitted a review for this product.',
        existingReview: existing,
      });
    }

    return res.status(200).json({ success: true, canReview: true });
  } catch (error) {
    console.error('canReview error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ??? POST /api/reviews ????????????????????????????????????????????????????????
const addReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, rating, title, body } = req.body;

    if (!productId || !rating)
      return res.status(400).json({ success: false, message: 'Product and rating required' });
    if (rating < 1 || rating > 5)
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });

    // ?? Enforce: only customers with a delivered order can review ??
    const purchase = await prisma.orderItem.findFirst({
      where: { productId, order: { userId, status: 'DELIVERED' } },
    });
    if (!purchase) {
      return res.status(403).json({
        success: false,
        message: 'You can only review products you have purchased and received.',
      });
    }

    // Check for duplicate
    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing)
      return res.status(400).json({ success: false, message: 'You have already reviewed this product.' });

    // Process uploaded images (if any)
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < Math.min(req.files.length, 5); i++) {
        const base64 = await processWithPreset(req.files[i].buffer, 'product', 'main');
        imageUrls.push({ url: base64, sortOrder: i });
      }
    }

    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating: parseInt(rating),
        title,
        body,
        isVerifiedPurchase: true, // always true since we enforced the purchase check above
        images: imageUrls.length > 0 ? { create: imageUrls } : undefined,
      },
      include: reviewInclude,
    });

    return res.status(201).json({ success: true, message: 'Review submitted for approval', data: review });
  } catch (error) {
    console.error('addReview error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ??? GET /api/reviews/:productId ?????????????????????????????????????????????
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filterRating = req.query.rating ? parseInt(req.query.rating) : null;

    const where = {
      productId,
      isApproved: true,
      ...(filterRating ? { rating: filterRating } : {}),
    };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: reviewInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    // Distribution always from all approved reviews for this product
    const allReviews = await prisma.review.findMany({
      where: { productId, isApproved: true },
      select: { rating: true },
    });

    const totalAll = allReviews.length;
    const average = totalAll > 0
      ? (allReviews.reduce((a, b) => a + b.rating, 0) / totalAll).toFixed(1)
      : '0.0';

    const distribution = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: allReviews.filter((r) => r.rating === star).length,
      percent: totalAll > 0
        ? Math.round((allReviews.filter((r) => r.rating === star).length / totalAll) * 100)
        : 0,
    }));

    return res.status(200).json({
      success: true,
      data: {
        reviews,
        total,
        totalAll,
        average,
        distribution,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('getProductReviews error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ??? PUT /api/reviews/admin/:id/approve ??????????????????????????????????????
const approveReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await prisma.review.update({
      where: { id },
      data: { isApproved: true },
      include: reviewInclude,
    });
    return res.status(200).json({ success: true, message: 'Review approved', data: review });
  } catch (error) {
    console.error('approveReview error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ??? DELETE /api/reviews/admin/:id ???????????????????????????????????????????
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.review.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Review deleted' });
  } catch (error) {
    console.error('deleteReview error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ??? GET /api/reviews/admin/pending ??????????????????????????????????????????
const getPendingReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { isApproved: false },
      include: {
        ...reviewInclude,
        product: { select: { name: true, slug: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.error('getPendingReviews error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { canReview, addReview, getProductReviews, approveReview, deleteReview, getPendingReviews };
