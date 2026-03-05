const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOrder() {
    const order = await prisma.order.findFirst({
        orderBy: { createdAt: 'desc' },
        include: {
            shippingAddress: true,
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

    if (!order) {
        console.log('No orders found');
        return;
    }

    console.log('ORDER DATA:');
    console.log(JSON.stringify({
        orderNumber: order.orderNumber,
        discountAmount: order.discountAmount,
        couponCode: order.couponCode,
        subtotal: order.subtotal,
        totalAmount: order.totalAmount,
        address: order.shippingAddress,
        firstItemProduct: order.items[0]?.product?.name,
        firstItemImage: order.items[0]?.product?.images[0]?.image?.substring(0, 50) + '...'
    }, null, 2));
}

checkOrder()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
