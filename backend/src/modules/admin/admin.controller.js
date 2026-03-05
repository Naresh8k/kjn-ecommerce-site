const prisma = require('../../config/db');

const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    const [
      totalOrders, todayOrders, monthOrders,
      totalRevenue, monthRevenue, lastMonthRevenue,
      totalUsers, newUsersToday,
      pendingOrders, processingOrders,
      totalProducts, lowStockProducts,
      recentOrders, topProducts,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),

      prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: { paymentStatus: 'PAID', createdAt: { gte: startOfMonth } },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: { paymentStatus: 'PAID', createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
        _sum: { totalAmount: true },
      }),

      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.user.count({ where: { createdAt: { gte: startOfDay } } }),

      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'PROCESSING' } }),

      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isActive: true, stockQuantity: { lte: 5 } } }),

      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, phone: true } } },
      }),

      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ]);

    // Get top product names
    const topProductDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, slug: true, sellingPrice: true },
        });
        return { ...product, totalSold: item._sum.quantity };
      })
    );

    const currentMonthRevenue = parseFloat(monthRevenue._sum.totalAmount || 0);
    const previousMonthRevenue = parseFloat(lastMonthRevenue._sum.totalAmount || 0);
    const revenueGrowth = previousMonthRevenue > 0
      ? (((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100).toFixed(1)
      : 100;

    return res.status(200).json({
      success: true,
      data: {
        orders: {
          total: totalOrders,
          today: todayOrders,
          thisMonth: monthOrders,
          pending: pendingOrders,
          processing: processingOrders,
        },
        revenue: {
          total: parseFloat(totalRevenue._sum.totalAmount || 0),
          thisMonth: currentMonthRevenue,
          lastMonth: previousMonthRevenue,
          growthPercent: revenueGrowth,
        },
        users: {
          total: totalUsers,
          newToday: newUsersToday,
        },
        products: {
          total: totalProducts,
          lowStock: lowStockProducts,
        },
        recentOrders,
        topProducts: topProductDetails,
      },
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all users list for admin
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = { role: 'CUSTOMER' };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { orders: true } },
          orders: {
            select: { totalAmount: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const formattedUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      isVerified: u.isVerified,
      createdAt: u.createdAt,
      _count: u._count,
      totalSpent: u.orders.reduce(
        (sum, order) => sum + parseFloat(order.totalAmount),
        0
      ),
    }));

    return res.status(200).json({
      success: true, data: formattedUsers,
      pagination: { total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Low stock alert
const getLowStockProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, stockQuantity: { lte: 10 } },
      orderBy: { stockQuantity: 'asc' },
      include: { category: { select: { name: true } } },
      select: {
        id: true, name: true, sku: true,
        stockQuantity: true, sellingPrice: true,
        category: true,
      },
    });
    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update stock
const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stockQuantity } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: { stockQuantity: parseInt(stockQuantity) },
    });
    return res.status(200).json({ success: true, message: 'Stock updated', data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Revenue report by date range
const getRevenueReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    const fromDate = from ? new Date(from) : new Date(new Date().setDate(1));
    const toDate = to ? new Date(to) : new Date();

    const orders = await prisma.order.findMany({
      where: {
        status: { notIn: ['CANCELLED'] },
        createdAt: { gte: fromDate, lte: toDate },
      },
      select: {
        orderNumber: true, totalAmount: true,
        createdAt: true, paymentMethod: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const totalRevenue = orders.reduce((a, b) => a + parseFloat(b.totalAmount), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Daily revenue grouping
    const dailyMap = {};
    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!dailyMap[date]) dailyMap[date] = 0;
      dailyMap[date] += parseFloat(order.totalAmount);
    });

    // Monthly revenue grouping
    const monthlyMap = {};
    orders.forEach((order) => {
      const month = order.createdAt.getFullYear() + '-' + String(order.createdAt.getMonth() + 1).padStart(2, '0');
      if (!monthlyMap[month]) monthlyMap[month] = 0;
      monthlyMap[month] += parseFloat(order.totalAmount);
    });

    return res.status(200).json({
      success: true,
      data: {
        orders,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalOrders,
        averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
        dailyRevenue: Object.entries(dailyMap).map(([date, revenue]) => ({ date, revenue })),
        monthlyRevenue: Object.entries(monthlyMap).map(([month, revenue]) => ({ month, revenue })),
        from: fromDate,
        to: toDate,
      },
    });
  } catch (error) {
    console.error('Revenue report error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get single user detail (orders + cart) for admin
const getUserDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, phone: true, isVerified: true, createdAt: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true, orderNumber: true, totalAmount: true, status: true,
            paymentStatus: true, paymentMethod: true, createdAt: true,
            items: {
              select: {
                quantity: true, unitPrice: true, totalPrice: true,
                productName: true, productImage: true,
                product: {
                  select: {
                    name: true,
                    slug: true,
                    image: true,
                    images: { where: { isPrimary: true }, take: 1, select: { image: true } }
                  }
                },
              },
            },
          },
        },
        cart: {
          select: {
            items: {
              select: {
                id: true, quantity: true,
                product: {
                  select: {
                    id: true, name: true, slug: true, sellingPrice: true, mrp: true,
                    images: { where: { isPrimary: true }, take: 1, select: { image: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('getUserDetail error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all products for admin (includes inactive)
const getAdminProducts = async (req, res) => {
  try {
    const { page = 1, limit = 100, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { name: true, slug: true } },
          brand: { select: { name: true, slug: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const formatted = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      mrp: parseFloat(p.mrp),
      sellingPrice: parseFloat(p.sellingPrice),
      image: p.image,
      category: p.category,
      brand: p.brand,
      stockQuantity: p.stockQuantity,
      isActive: p.isActive,
      isFeatured: p.isFeatured,
      categoryId: p.categoryId,
      brandId: p.brandId,
      gstPercent: parseFloat(p.gstPercent),
      description: p.description,
      shortDescription: p.shortDescription,
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('getAdminProducts error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getDashboardStats, getAllUsers, getUserDetail, getLowStockProducts, updateStock, getRevenueReport, getAdminProducts };