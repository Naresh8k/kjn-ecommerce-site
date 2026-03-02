/**
 * Script to create an admin user with password
 * Run: node scripts/create-admin.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('?? Creating admin user...\n');

    const email = 'admin@kjn.com';
    const password = 'admin123';
    const name = 'KJN Admin';
    const phone = '9876543210';

    // Check if admin already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    
    if (existing) {
      console.log('??  Admin user already exists!');
      console.log('Updating password...\n');
      
      const passwordHash = await bcrypt.hash(password, 10);
      
      await prisma.user.update({
        where: { email },
        data: {
          passwordHash,
          role: 'ADMIN',
          isVerified: true,
        },
      });
      
      console.log('? Admin password updated successfully!\n');
    } else {
      // Create new admin user
      const passwordHash = await bcrypt.hash(password, 10);
      
      await prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          phone,
          role: 'ADMIN',
          isVerified: true,
        },
      });
      
      console.log('? Admin user created successfully!\n');
    }

    console.log('??????????????????????????????????');
    console.log('?? Admin Credentials:');
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}`);
    console.log('??????????????????????????????????\n');
    console.log('?? Login at: POST http://localhost:5000/api/auth/login/password');
    console.log('?? Request body:');
    console.log(JSON.stringify({ email, password }, null, 2));
    console.log('\n');
  } catch (error) {
    console.error('? Error creating admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
