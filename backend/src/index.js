const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { notFound, errorHandler } = require('./middleware/error.middleware');
const { generalLimiter } = require('./middleware/rateLimiter.middleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Rate limiting
app.use('/api', generalLimiter);

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'KJN Shop API Running ...by kiran',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth',        require('./modules/auth/auth.routes'));
app.use('/api/products',    require('./modules/products/product.routes'));
app.use('/api/categories',  require('./modules/categories/category.routes'));
app.use('/api/brands',      require('./modules/brands/brand.routes'));
app.use('/api/cart',        require('./modules/cart/cart.routes'));
app.use('/api/orders',      require('./modules/orders/order.routes'));
app.use('/api/payments',    require('./modules/payments/payment.routes'));
app.use('/api/reviews',     require('./modules/reviews/review.routes'));
app.use('/api/user',        require('./modules/users/user.routes'));
app.use('/api/banners',     require('./modules/banners/banner.routes'));
app.use('/api/collections', require('./modules/collections/collection.routes'));
app.use('/api/blogs',       require('./modules/blogs/blog.routes'));
app.use('/api/shipping',    require('./modules/shipping/shipping.routes'));
app.use('/api/coupons',     require('./modules/coupons/coupon.routes'));
app.use('/api/admin',       require('./modules/admin/admin.routes'));

// Error handlers (must be last)
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📦 API: http://localhost:${PORT}`);
  console.log(`🌐 Frontend: ${process.env.FRONTEND_URL}`);
  console.log(`📅 ${new Date().toLocaleString()}\n`);
});