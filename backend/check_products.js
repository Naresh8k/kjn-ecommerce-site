const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProducts() {
    const products = await prisma.product.findMany({
        take: 5,
        include: {
            images: { take: 1 }
        }
    });

    console.log('PRODUCTS DATA:');
    products.forEach(p => {
        console.log(`Product: ${p.name}`);
        console.log(`- direct image field: ${p.image ? 'exists' : 'null'}`);
        console.log(`- images relation: ${p.images.length > 0 ? 'exists' : 'empty'}`);
        if (p.images[0]) {
            console.log(`  - relation image field value: ${p.images[0].image ? 'exists' : 'null'}`);
        }
    });
}

checkProducts()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
