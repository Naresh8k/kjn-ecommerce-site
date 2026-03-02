/**
 * Cleanup Script - Remove expired OTPs, tokens, and sessions
 * Run: node scripts/cleanup-expired.js
 * Or setup as a cron job to run periodically
 */

const { cleanupExpiredTokens } = require('../src/utils/tokenStorage');

async function main() {
  console.log('?? Starting cleanup of expired data...\n');
  
  try {
    await cleanupExpiredTokens();
    
    console.log('? Cleanup completed successfully!');
    console.log('   - Expired OTPs removed');
    console.log('   - Expired OTP cooldowns removed');
    console.log('   - Expired refresh tokens removed');
    console.log('   - Expired signup sessions removed\n');
  } catch (error) {
    console.error('? Cleanup failed:', error);
    process.exit(1);
  }
}

main();
