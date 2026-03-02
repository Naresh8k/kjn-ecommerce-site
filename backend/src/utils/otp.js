const prisma = require('../config/db');

// Generate 6 digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Save OTP in Database with 5 minute expiry
const saveOTP = async (key, otp) => {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  const prefixedKey = `otp:${key}`;

  // Upsert — avoids race condition between deleteMany + create
  await prisma.oTP.upsert({
    where: { key: prefixedKey },
    update: { otp, expiresAt },
    create: { key: prefixedKey, otp, expiresAt },
  });
};

// Verify OTP from Database
const verifyOTP = async (key, otp) => {
  const otpRecord = await prisma.oTP.findUnique({
    where: { key: `otp:${key}` }
  });
  
  if (!otpRecord) {
    return { valid: false, message: 'OTP expired or not found' };
  }
  
  // Check if expired
  if (new Date() > otpRecord.expiresAt) {
    await prisma.oTP.delete({ where: { key: `otp:${key}` } });
    return { valid: false, message: 'OTP expired' };
  }
  
  if (otpRecord.otp !== otp) {
    return { valid: false, message: 'Invalid OTP' };
  }
  
  // Delete OTP after successful verification (one time use)
  await prisma.oTP.delete({ where: { key: `otp:${key}` } });
  return { valid: true };
};

// Check if OTP was recently sent (prevent spam)
const checkOTPCooldown = async (key) => {
  const cooldown = await prisma.oTPCooldown.findUnique({
    where: { key: `cooldown:${key}` }
  });
  
  if (!cooldown) return false;
  
  // Check if expired
  if (new Date() > cooldown.expiresAt) {
    await prisma.oTPCooldown.delete({ where: { key: `cooldown:${key}` } });
    return false;
  }
  
  return true;
};

// Set cooldown after sending OTP (1 minute)
const setOTPCooldown = async (key) => {
  const expiresAt = new Date(Date.now() + 60 * 1000); // 1 minute
  const prefixedKey = `cooldown:${key}`;

  // Upsert — avoids race condition between deleteMany + create
  await prisma.oTPCooldown.upsert({
    where: { key: prefixedKey },
    update: { expiresAt },
    create: { key: prefixedKey, expiresAt },
  });
};

// Save temporary signup data
const saveSignupSession = async (email, name, phone) => {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  // Delete old session if exists
  await prisma.signupSession.deleteMany({
    where: { email }
  });
  
  await prisma.signupSession.create({
    data: {
      email,
      name,
      phone,
      expiresAt
    }
  });
};

// Get signup session data
const getSignupSession = async (email) => {
  const session = await prisma.signupSession.findUnique({
    where: { email }
  });
  
  if (!session) return null;
  
  // Check if expired
  if (new Date() > session.expiresAt) {
    await prisma.signupSession.delete({ where: { email } });
    return null;
  }
  
  return session;
};

// Delete signup session
const deleteSignupSession = async (email) => {
  await prisma.signupSession.deleteMany({
    where: { email }
  });
};

module.exports = { 
  generateOTP, 
  saveOTP, 
  verifyOTP, 
  checkOTPCooldown, 
  setOTPCooldown,
  saveSignupSession,
  getSignupSession,
  deleteSignupSession
};