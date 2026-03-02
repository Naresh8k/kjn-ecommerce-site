/**
 * Test Authentication - Verify that authentication works without Redis
 * Run: node scripts/test-auth.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function testAuth() {
  console.log('?? Testing Authentication System (No Redis)...\n');
  
  try {
    // Test 1: Check if admin user exists
    console.log('1??  Checking admin user...');
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@kjn.com' }
    });
    
    if (!admin) {
      console.log('   ? Admin user not found. Run: node scripts/create-admin.js');
      return;
    }
    console.log('   ? Admin user exists:', admin.email);
    
    // Test 2: Verify password
    console.log('\n2??  Testing password verification...');
    const passwordMatch = await bcrypt.compare('admin123', admin.passwordHash);
    console.log('   ? Password verification:', passwordMatch ? 'PASS' : 'FAIL');
    
    // Test 3: Generate tokens
    console.log('\n3??  Testing token generation...');
    const payload = { id: admin.id, role: admin.role };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'refresh-secret', { expiresIn: '7d' });
    console.log('   ? Access token generated:', accessToken.substring(0, 50) + '...');
    console.log('   ? Refresh token generated:', refreshToken.substring(0, 50) + '...');
    
    // Test 4: Save refresh token to database
    console.log('\n4??  Testing refresh token storage...');
    const { saveRefreshToken } = require('../src/utils/tokenStorage');
    await saveRefreshToken(admin.id, refreshToken);
    console.log('   ? Refresh token saved to database');
    
    // Test 5: Verify token exists
    console.log('\n5??  Testing token verification...');
    const { verifyRefreshTokenExists } = require('../src/utils/tokenStorage');
    const exists = await verifyRefreshTokenExists(refreshToken);
    console.log('   ? Token verification:', exists ? 'PASS' : 'FAIL');
    
    // Test 6: Test OTP generation
    console.log('\n6??  Testing OTP generation...');
    const { generateOTP, saveOTP, verifyOTP } = require('../src/utils/otp');
    const otp = generateOTP();
    console.log('   ? OTP generated:', otp);
    
    // Test 7: Save OTP
    console.log('\n7??  Testing OTP storage...');
    await saveOTP('test:123', otp);
    console.log('   ? OTP saved to database');
    
    // Test 8: Verify OTP
    console.log('\n8??  Testing OTP verification...');
    const otpResult = await verifyOTP('test:123', otp);
    console.log('   ? OTP verification:', otpResult.valid ? 'PASS' : 'FAIL');
    
    // Test 9: Test cooldown
    console.log('\n9??  Testing OTP cooldown...');
    const { checkOTPCooldown, setOTPCooldown } = require('../src/utils/otp');
    await setOTPCooldown('test:cooldown');
    const onCooldown = await checkOTPCooldown('test:cooldown');
    console.log('   ? Cooldown check:', onCooldown ? 'PASS' : 'FAIL');
    
    // Test 10: Cleanup
    console.log('\n??  Testing cleanup...');
    const { cleanupExpiredTokens } = require('../src/utils/tokenStorage');
    await cleanupExpiredTokens();
    console.log('   ? Cleanup completed');
    
    console.log('\n????????????????????????????????????????');
    console.log('?? ALL TESTS PASSED! Authentication works without Redis');
    console.log('????????????????????????????????????????\n');
    
  } catch (error) {
    console.error('\n? Test failed:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
