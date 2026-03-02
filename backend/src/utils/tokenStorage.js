const prisma = require('../config/db');

// Save refresh token to database
const saveRefreshToken = async (userId, token) => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  // Delete old tokens for this user
  await prisma.refreshToken.deleteMany({
    where: { userId }
  });
  
  // Create new token
  await prisma.refreshToken.create({
    data: {
      userId,
      token,
      expiresAt
    }
  });
};

// Get refresh token from database
const getRefreshToken = async (userId) => {
  const tokenRecord = await prisma.refreshToken.findFirst({
    where: { 
      userId,
      expiresAt: { gt: new Date() }
    }
  });
  
  return tokenRecord ? tokenRecord.token : null;
};

// Verify refresh token exists and is valid
const verifyRefreshTokenExists = async (token) => {
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token }
  });
  
  if (!tokenRecord) return false;
  
  // Check if expired
  if (new Date() > tokenRecord.expiresAt) {
    await prisma.refreshToken.delete({ where: { token } });
    return false;
  }
  
  return true;
};

// Delete refresh token (logout)
const deleteRefreshToken = async (userId) => {
  await prisma.refreshToken.deleteMany({
    where: { userId }
  });
};

// Clean up expired tokens (can be run periodically)
const cleanupExpiredTokens = async () => {
  await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: { lt: new Date() }
    }
  });
  
  await prisma.oTP.deleteMany({
    where: {
      expiresAt: { lt: new Date() }
    }
  });
  
  await prisma.oTPCooldown.deleteMany({
    where: {
      expiresAt: { lt: new Date() }
    }
  });
  
  await prisma.signupSession.deleteMany({
    where: {
      expiresAt: { lt: new Date() }
    }
  });
};

module.exports = {
  saveRefreshToken,
  getRefreshToken,
  verifyRefreshTokenExists,
  deleteRefreshToken,
  cleanupExpiredTokens
};
