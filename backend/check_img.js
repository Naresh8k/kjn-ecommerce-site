const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOrder() {
    const order = await prisma.order.findFirst({
        orderBy: { createdAt: 'desc' },
        include: {
            items: {
                include: {
                    product: {
                        include: {
                            images: { where: { isPrimary: true }, take: 1 }
                        }
                    }
                }
            }
        }
    });

    if (!order || !order.items[0]) {
        console.log('No orders or items found');
        return;
    }

    const item = order.items[0];
    console.log('ITEM DATA:');
    console.log('productImage in OrderItem:', item.productImage ? item.productImage.substring(0, 50) + '...' : 'null');

    const productImg = item.product?.images?.[0];
    if (productImg) {
        console.log('image in ProductImage:', productImg.image ? productImg.image.substring(0, 50) + '...' : 'null');
        console.log('image field name exists in ProductImage:', Object.keys(productImg));
    } else {
        console.log('No product images found via relation');
    }
}

checkOrder()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
