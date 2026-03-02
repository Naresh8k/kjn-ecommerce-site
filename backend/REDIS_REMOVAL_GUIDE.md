# Redis Removal - Migration Guide

## Overview

This project has been migrated from Redis to PostgreSQL for all authentication and caching operations. This eliminates the need for a separate Redis server while maintaining all functionality.

## What Changed

### 1. **Database Schema Updates**
New tables added to PostgreSQL:
- `OTP` - Stores one-time passwords for signup/login
- `OTPCooldown` - Prevents OTP spam
- `RefreshToken` - Stores JWT refresh tokens
- `SignupSession` - Stores temporary signup data

### 2. **Removed Dependencies**
- `ioredis` package removed
- `redis` package removed
- `backend/src/config/redis.js` deleted

### 3. **New Utility Functions**
- `backend/src/utils/otp.js` - Database-based OTP management
- `backend/src/utils/tokenStorage.js` - Database-based token storage

### 4. **Updated Controllers**
- `auth.controller.js` - Uses database instead of Redis
- `product.controller.js` - Removed Redis caching
- `category.controller.js` - Removed Redis caching
- `review.controller.js` - Removed Redis caching

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Run Database Migration
```bash
npx prisma migrate dev
```

### 3. Create Admin User
```bash
node scripts/create-admin.js
```

### 4. Start Server
```bash
npm run dev
```

## API Endpoints

### Password Login (Admin/Staff)
```http
POST /api/auth/login/password
Content-Type: application/json

{
  "email": "admin@kjn.com",
  "password": "admin123"
}
```

### Signup Flow
```http
# Step 1: Send OTP
POST /api/auth/signup/send-otp
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210"
}

# Step 2: Verify OTP
POST /api/auth/signup/verify-otp
{
  "email": "john@example.com",
  "otp": "123456"
}
```

### Login Flow (OTP)
```http
# Step 1: Send OTP
POST /api/auth/login/send-otp
{
  "phone": "9876543210"
}

# Step 2: Verify OTP
POST /api/auth/login/verify-otp
{
  "phone": "9876543210",
  "otp": "123456"
}
```

### Token Refresh
```http
POST /api/auth/refresh
# Uses httpOnly cookie automatically
```

### Logout
```http
POST /api/auth/logout
```

## Maintenance

### Cleanup Expired Data
Run periodically to remove expired tokens, OTPs, and sessions:
```bash
node scripts/cleanup-expired.js
```

**Recommended:** Setup a cron job to run this daily:
```bash
# Add to crontab
0 2 * * * cd /path/to/backend && node scripts/cleanup-expired.js
```

## Data Expiration

- **OTPs**: 5 minutes
- **OTP Cooldown**: 1 minute
- **Refresh Tokens**: 7 days
- **Signup Sessions**: 10 minutes

## Performance Considerations

### Removed Features
- Product caching (Redis)
- Category caching (Redis)

### Alternative Solutions
If you need caching in the future:
1. Use PostgreSQL materialized views
2. Use application-level caching (memory)
3. Use CDN for static content

## Troubleshooting

### Server Won't Start
```bash
# Check database connection
npx prisma db push

# Regenerate Prisma Client
npx prisma generate
```

### Migration Issues
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Run seed
npx prisma db seed
```

### Token Issues
```bash
# Clear expired tokens
node scripts/cleanup-expired.js
```

## Environment Variables

Make sure your `.env` file has:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/kjn_stores"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Email configuration (for OTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@kjnshop.com"
```

## Testing

Test the authentication flow:
```bash
# Use the test file
# Open backend/test-login.http in VS Code REST Client extension
```

## Benefits of This Migration

? **Simplified Infrastructure** - No need to run Redis server  
? **Reduced Dependencies** - Fewer packages to maintain  
? **ACID Compliance** - Better data consistency with PostgreSQL  
? **Single Source of Truth** - All data in one database  
? **Automatic Cleanup** - Database queries handle expiration  
? **Better Debugging** - Can query data directly in database  

## Support

For issues or questions:
1. Check Prisma logs: `npx prisma studio`
2. Check server logs in console
3. Review this guide

---

**Last Updated:** January 2025  
**Version:** 2.0.0 (Redis Removed)
