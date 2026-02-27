// const express = require('express');
// const router = express.Router();

// // Basic health route for the auth module
// router.get('/', (req, res) => {
//   res.json({ message: 'Auth routes are working' });
// });

// // TODO: Wire actual auth controllers
// // Example:
// // const authController = require('./auth.controller');
// // router.post('/login', authController.login);

// module.exports = router;


const express = require('express');
const router = express.Router();
const {
  signupSendOTP,
  signupVerifyOTP,
  loginSendOTP,
  loginVerifyOTP,
  loginWithPassword,
  refreshToken,
  logout,
  getMe,
} = require('./auth.controller');
const { protect } = require('../../middleware/auth.middleware');
const { otpLimiter, authLimiter } = require('../../middleware/rateLimiter.middleware');
const validate = require('../../middleware/validate.middleware');

// Signup routes
router.post('/signup/send-otp', signupSendOTP);
router.post('/signup/verify-otp', signupVerifyOTP);

// Login routes
router.post('/login/send-otp', loginSendOTP);
router.post('/login/verify-otp', loginVerifyOTP);

// Token routes
router.post('/refresh', refreshToken);
router.post('/logout', logout);

// password login for admin
router.post('/login/password', validate('loginPassword'), loginWithPassword);

// Protected route
router.get('/me', protect, getMe);

module.exports = router;