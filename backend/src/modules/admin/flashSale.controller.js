const prisma = require('../../config/db');

// ─── GET ALL FLASH SALES ──────────────────────
const getFlashSales = async (req, res) => {
    try {
        // Auto-expire past flash sales
        await prisma.flashSale.updateMany({
            where: { endDate: { lt: new Date() }, isActive: true },
            data: { isActive: false },
        });

        const { status } = req.query; // 'active' | 'expired' | 'all'
        const where = {};
        if (status === 'active') {
            where.isActive = true;
            where.endDate = { gte: new Date() };
        } else if (status === 'expired') {
            where.OR = [
                { isActive: false },
                { endDate: { lt: new Date() } },
            ];
        }

        const flashSales = await prisma.flashSale.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                product: {
                    select: {
                        id: true, name: true, slug: true, mrp: true, sellingPrice: true,
                        image: true, stockQuantity: true, isActive: true,
                        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }], take: 1 },
                    },
                },
            },
        });

        return res.status(200).json({ success: true, data: flashSales });
    } catch (error) {
        console.error('getFlashSales error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ─── CREATE FLASH SALE ────────────────────────
const createFlashSale = async (req, res) => {
    try {
        // New format: products = [{ id, flashPrice }]
        // Legacy format: productIds + flashPrice (single price for all)
        const { products, productIds, flashPrice, endDate, startDate } = req.body;

        // Normalise to per-product array regardless of which format was sent
        let productEntries = [];
        if (Array.isArray(products) && products.length > 0) {
            productEntries = products;
        } else if (Array.isArray(productIds) && productIds.length > 0 && flashPrice) {
            productEntries = productIds.map(id => ({ id, flashPrice }));
        }

        if (productEntries.length === 0) {
            return res.status(400).json({ success: false, message: 'At least one product is required' });
        }
        if (!endDate) {
            return res.status(400).json({ success: false, message: 'End date is required' });
        }
        for (const entry of productEntries) {
            if (!entry.flashPrice || isNaN(parseFloat(entry.flashPrice))) {
                return res.status(400).json({ success: false, message: 'A valid flash price is required for every product' });
            }
        }
        if (new Date(endDate) <= new Date()) {
            return res.status(400).json({ success: false, message: 'End date must be in the future' });
        }

        const ids = productEntries.map(e => e.id);

        // Deactivate any existing active flash sales for these products
        await prisma.flashSale.updateMany({
            where: { productId: { in: ids }, isActive: true },
            data: { isActive: false },
        });

        // Create flash sales for all selected products with their individual prices
        const created = await prisma.$transaction(
            productEntries.map(entry =>
                prisma.flashSale.create({
                    data: {
                        productId: entry.id,
                        flashPrice: parseFloat(entry.flashPrice),
                        startDate: startDate ? new Date(startDate) : new Date(),
                        endDate: new Date(endDate),
                        isActive: true,
                    },
                    include: {
                        product: {
                            select: { id: true, name: true, slug: true, mrp: true, sellingPrice: true, image: true },
                        },
                    },
                })
            )
        );

        return res.status(201).json({
            success: true,
            message: `Flash sale created for ${created.length} product(s)`,
            data: created,
        });
    } catch (error) {
        console.error('createFlashSale error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ─── UPDATE FLASH SALE ────────────────────────
const updateFlashSale = async (req, res) => {
    try {
        const { id } = req.params;
        const { flashPrice, endDate, startDate, isActive } = req.body;

        const existing = await prisma.flashSale.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ success: false, message: 'Flash sale not found' });

        const updated = await prisma.flashSale.update({
            where: { id },
            data: {
                flashPrice: flashPrice ? parseFloat(flashPrice) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                startDate: startDate ? new Date(startDate) : undefined,
                isActive: isActive !== undefined ? isActive : undefined,
            },
            include: {
                product: {
                    select: { id: true, name: true, slug: true, mrp: true, sellingPrice: true, image: true },
                },
            },
        });

        return res.status(200).json({ success: true, message: 'Flash sale updated', data: updated });
    } catch (error) {
        console.error('updateFlashSale error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ─── DELETE FLASH SALE ────────────────────────
const deleteFlashSale = async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await prisma.flashSale.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ success: false, message: 'Flash sale not found' });

        await prisma.flashSale.delete({ where: { id } });

        return res.status(200).json({ success: true, message: 'Flash sale deleted' });
    } catch (error) {
        console.error('deleteFlashSale error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ─── GET ACTIVE FLASH SALES (Public) ──────────
const getActiveFlashSales = async (req, res) => {
    try {
        const now = new Date();

        // Auto-expire
        await prisma.flashSale.updateMany({
            where: { endDate: { lt: now }, isActive: true },
            data: { isActive: false },
        });

        const flashSales = await prisma.flashSale.findMany({
            where: { isActive: true, endDate: { gte: now }, startDate: { lte: now } },
            orderBy: { createdAt: 'desc' },
            include: {
                product: {
                    select: {
                        id: true, name: true, slug: true, mrp: true, sellingPrice: true,
                        image: true, stockQuantity: true,
                        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }], take: 1 },
                        category: { select: { name: true, slug: true } },
                        reviews: { select: { rating: true } },
                    },
                },
            },
        });

        return res.status(200).json({ success: true, data: flashSales });
    } catch (error) {
        console.error('getActiveFlashSales error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { getFlashSales, createFlashSale, updateFlashSale, deleteFlashSale, getActiveFlashSales };
