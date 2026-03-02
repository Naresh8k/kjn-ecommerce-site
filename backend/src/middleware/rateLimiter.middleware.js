const rateLimit = require('express-rate-limit');

// General API limit – bumped to a higher cap so bulk admin actions don't
// trip the limiter.  You can also apply a separate `adminLimiter` after
// authentication if you want to exempt admins completely.
exports.generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: { success: false, message: 'Too many requests, please try again later' },
});

// Admin-specific limiter (apply after protect/adminOnly middleware when
// you want to give these routes generous limits).  Not used by default but
// exported for convenience.
exports.adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  message: { success: false, message: 'Too many requests from admin, please slow down' },
});

// Strict limit for OTP endpoints
exports.otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3,
  message: { success: false, message: 'Too many OTP requests, please wait 1 minute' },
});

// Auth endpoints
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts, please try again later' },
});