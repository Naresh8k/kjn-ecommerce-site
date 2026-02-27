const prisma = require('../src/config/db');
const bcrypt = require('bcryptjs');

async function main() {
  const email = process.argv[2] || 'admin@kjnshop.com';
  const phone = process.argv[3] || '9999999999';
  const password = process.argv[4] || 'admin123';

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: 'Super Admin',
      email,
      phone,
      passwordHash: hash,
      role: 'ADMIN',
      isVerified: true,
    },
  });

  console.log('Admin user created/updated:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
