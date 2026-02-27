const redis = require('../config/redis');

// Generate 6 digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Save OTP in Redis with 5 minute expiry
const saveOTP = async (key, otp) => {
  // key = phone:919876543210 or email:test@gmail.com
  await redis.setex(`otp:${key}`, 300, otp); // 300 seconds = 5 minutes
};

// Verify OTP from Redis
const verifyOTP = async (key, otp) => {
  const savedOTP = await redis.get(`otp:${key}`);
  if (!savedOTP) return { valid: false, message: 'OTP expired or not found' };
  if (savedOTP !== otp) return { valid: false, message: 'Invalid OTP' };
  
  // Delete OTP after successful verification (one time use)
  await redis.del(`otp:${key}`);
  return { valid: true };
};

// Check if OTP was recently sent (prevent spam)
const checkOTPCooldown = async (key) => {
  const cooldown = await redis.get(`cooldown:${key}`);
  return !!cooldown;
};

// Set cooldown after sending OTP (1 minute)
const setOTPCooldown = async (key) => {
  await redis.setex(`cooldown:${key}`, 60, '1');
};

module.exports = { generateOTP, saveOTP, verifyOTP, checkOTPCooldown, setOTPCooldown };