/**
 * ─────────────────────────────────────────────────────────────
 * Complete Database Seeding Script for KJN Shop
 * Run: npx prisma db seed
 * Creates: Categories, Brands, Products, Banners, Collections
 * ─────────────────────────────────────────────────────────────
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const productImages = {
  sprayers: [
    'https://image.cdn.shpy.in/386933/1749178393402.jpeg',
    'https://image.cdn.shpy.in/386933/1749178393405.jpeg',
  ],
  fans: [
    'https://image.cdn.shpy.in/386933/Fans3-1743170301396.jpeg',
    'https://image.cdn.shpy.in/386933/Fans1-1742631509893.jpeg',
  ],
  pumps: [
    'https://image.cdn.shpy.in/386933/Screenshot250-1731403908158.jpeg',
  ],
  tools: [
    'https://image.cdn.shpy.in/386933/PowerTools-1743170522784.jpeg',
  ],
};

async function main() {
  console.log('🌱 Starting complete database seeding...\n');

  try {
    // ──────────────────────────────────────────────────────────
    // 1. CATEGORIES
    // ──────────────────────────────────────────────────────────
    console.log('📂 Creating categories...');
    const categories = [
      { name: 'Farming Tools',          slug: 'farm-equipments',              sortOrder: 1, imageUrl: 'https://image.cdn.shpy.in/386933/Seeders2-1742015463459.jpeg' },
      { name: 'Garden Tools',           slug: 'garden-tools',                 sortOrder: 2, imageUrl: 'https://image.cdn.shpy.in/386933/Gardentools43-1743169177417.jpeg' },
      { name: 'Chaff Cutters',          slug: 'chaff-cutters',                sortOrder: 3, imageUrl: 'https://image.cdn.shpy.in/386933/ChaffCutters1-1743171746610.jpeg' },
      { name: 'Control Panels',         slug: 'control-panels',               sortOrder: 4, imageUrl: 'https://image.cdn.shpy.in/386933/ControlPanels-1743170833594.jpeg' },
      { name: 'Bathware & Kitchen',     slug: 'bathware-kitchen',             sortOrder: 5, imageUrl: 'https://image.cdn.shpy.in/386933/Gardentools45-1743170052083.jpeg' },
      { name: 'Fans & Lighting',        slug: 'fans-lighting',                sortOrder: 6, imageUrl: 'https://image.cdn.shpy.in/386933/Fans3-1743170301396.jpeg' },
      { name: 'Irrigation Fittings',    slug: 'irrigation-items',             sortOrder: 7, imageUrl: 'https://image.cdn.shpy.in/386933/Screenshot250-1731403908158.jpeg' },
      { name: 'Hand & Power Tools',     slug: 'power-tools',                  sortOrder: 8, imageUrl: 'https://image.cdn.shpy.in/386933/PowerTools-1743170522784.jpeg' },
      { name: 'Motors & Fittings',      slug: 'motors-fittings',              sortOrder: 9, imageUrl: 'https://image.cdn.shpy.in/386933/ChaffCutters-1749270182096.jpeg' },
      { name: 'Accessories & Spares',   slug: 'accessiories-spare-parts',     sortOrder: 10, imageUrl: 'https://image.cdn.shpy.in/386933/Pngtreegearicon_4812867-1724842776624.png' },
    ];

    // const categoryMap = {};
    // for (const cat of categories) {
    //   const created = await prisma.category.upsert({
    //     where: { slug: cat.slug },
    //     update: { imageUrl: cat.imageUrl, sortOrder: cat.sortOrder },
    //     create: { ...cat, isActive: true },
    //   });
    //   categoryMap[cat.slug] = created.id;
    // }
    // console.log(`✅ ${categories.length} categories created\n`);


    const categoryMap = {};
for (const cat of categories) {
  const created = await prisma.category.upsert({
    where: { slug: cat.slug },
    update: { image: cat.imageUrl, sortOrder: cat.sortOrder },
    create: { 
      name: cat.name,
      slug: cat.slug,
      image: cat.imageUrl,
      sortOrder: cat.sortOrder,
      isActive: true
    },
  });

  categoryMap[cat.slug] = created.id;
}
    // ──────────────────────────────────────────────────────────
    // 2. BRANDS
    // ──────────────────────────────────────────────────────────
    console.log('🏷️  Creating brands...');
    const brands = [
      { name: 'Agrimate',           slug: 'agrimate',              logoUrl: 'https://image.cdn.shpy.in/386933/agrimate-logo.png' },
      { name: 'Neptune',            slug: 'neptune',               logoUrl: 'https://img.cdnx.in/386933/6-1742535756694.png' },
      { name: 'Taro Pumps',         slug: 'taro-pumps',            logoUrl: 'https://img.cdnx.in/386933/1-1742535677257.png' },
      { name: 'TATA Pipes',         slug: 'tata-pipes',            logoUrl: 'https://img.cdnx.in/386933/2-1742535697592.png' },
      { name: 'Taparia',            slug: 'taparia',               logoUrl: 'https://img.cdnx.in/386933/3-1742535714697.png' },
      { name: 'Super Steel',        slug: 'super-steel',           logoUrl: 'https://img.cdnx.in/386933/4-1742535728193.png' },
      { name: 'Sunya',              slug: 'sunya',                 logoUrl: 'https://img.cdnx.in/386933/5-1742535743282.png' },
      { name: 'Anchor (Panasonic)', slug: 'anchor',                logoUrl: '' },
      { name: 'Orient',             slug: 'orient',                logoUrl: '' },
      { name: 'Usha',               slug: 'usha',                  logoUrl: '' },
      { name: 'V-Guard',            slug: 'v-guard',               logoUrl: '' },
      { name: 'Polycab',            slug: 'polycab',               logoUrl: '' },
      { name: 'Crompton',           slug: 'crompton',              logoUrl: '' },
      { name: 'Havells',            slug: 'havells',               logoUrl: '' },
      { name: 'Kirloskar',          slug: 'kirloskar',             logoUrl: '' },
    ];

    // const brandMap = {};
    // for (const brand of brands) {
    //   const created = await prisma.brand.upsert({
    //     where: { slug: brand.slug },
    //     update: { logoUrl: brand.logoUrl },
    //     create: { ...brand, isActive: true },
    //   });
    //   brandMap[brand.slug] = created.id;
    // }
    // console.log(`✅ ${brands.length} brands created\n`);

    const brandMap = {};
for (const brand of brands) {
  const created = await prisma.brand.upsert({
    where: { slug: brand.slug },
    update: { logo: brand.logoUrl },
    create: {
      name: brand.name,
      slug: brand.slug,
      logo: brand.logoUrl,
      isActive: true
    },
  });

  brandMap[brand.slug] = created.id;
}

console.log(`✅ ${brands.length} brands created\n`);

    // ──────────────────────────────────────────────────────────
    // 3. PRODUCTS
    // ──────────────────────────────────────────────────────────
    console.log('🛒 Creating products...');
    const products = [
      // SPRAYERS
      {
        name: 'Agrimate GX25 4Stroke Power Sprayer with Honda Engine',
        slug: 'agrimate-gx25-power-sprayer',
        sku: 'AGRI-GX25-001',
        categorySlug: 'farm-equipments',
        brandSlug: 'agrimate',
        mrp: 14990,
        sellingPrice: 10499,
        description: 'Powerful 4-stroke power sprayer with genuine Honda engine. Perfect for large farm areas.',
        shortDescription: 'Honda-powered sprayer, 54% off',
        stockQuantity: 45,
        imageUrl: 'https://image.cdn.shpy.in/386933/1749178393402.jpeg',
        tags: ['sprayer', 'power-sprayer', 'agriculture', 'farming'],
      },
      {
        name: 'Agrimate 3" Inch Water Pump (AM-WPS-30P-NT)',
        slug: 'agrimate-water-pump-3inch',
        sku: 'AGRI-PUMP-30-001',
        categorySlug: 'irrigation-items',
        brandSlug: 'agrimate',
        mrp: 53800,
        sellingPrice: 24999,
        description: '3 inch agricultural water pump for irrigation. Heavy duty construction.',
        shortDescription: '3" water pump, 35% off',
        stockQuantity: 28,
        imageUrl: 'https://image.cdn.shpy.in/386933/Screenshot250-1731403908158.jpeg',
        tags: ['pump', 'water-pump', 'irrigation', 'agriculture'],
      },
      {
        name: 'Neptune MAX Gold 14Plus Double Motor Battery Sprayer',
        slug: 'neptune-max-battery-sprayer',
        sku: 'NEPT-MAX-14-001',
        categorySlug: 'farm-equipments',
        brandSlug: 'neptune',
        mrp: 16900,
        sellingPrice: 10999,
        description: 'Battery operated sprayer with dual motors. Perfect for small to medium farms.',
        shortDescription: 'Battery sprayer, 36% off',
        stockQuantity: 62,
        imageUrl: 'https://image.cdn.shpy.in/386933/1749178393405.jpeg',
        tags: ['sprayer', 'battery', 'agriculture'],
      },

      // FANS
      {
        name: 'Anchor Eco Breeze Urban Ceiling Fan With Remote',
        slug: 'anchor-eco-breeze-fan',
        sku: 'ANCH-ECOBRZ-001',
        categorySlug: 'fans-lighting',
        brandSlug: 'anchor',
        mrp: 7000,
        sellingPrice: 4499,
        description: 'Sleek ceiling fan with remote control and energy-efficient motor.',
        shortDescription: 'Eco ceiling fan, 36% off',
        stockQuantity: 120,
        imageUrl: 'https://image.cdn.shpy.in/386933/Fans1-1742631509893.jpeg',
        tags: ['fan', 'ceiling-fan', 'appliance', 'home'],
      },
      {
        name: 'Anchor Venezia Ceiling Fan',
        slug: 'anchor-venezia-fan',
        sku: 'ANCH-VENEZIA-001',
        categorySlug: 'fans-lighting',
        brandSlug: 'anchor',
        mrp: 5775,
        sellingPrice: 5425,
        description: 'Premium Venezia model ceiling fan with elegant design.',
        shortDescription: 'Venezia fan, 6% off',
        stockQuantity: 85,
        imageUrl: 'https://image.cdn.shpy.in/386933/Fans3-1743170301396.jpeg',
        tags: ['fan', 'ceiling-fan', 'appliance'],
      },
      {
        name: 'Anchor mineo Personal Fan',
        slug: 'anchor-mineo-personal-fan',
        sku: 'ANCH-MINEO-BLUE-001',
        categorySlug: 'fans-lighting',
        brandSlug: 'anchor',
        mrp: 10750,
        sellingPrice: 10200,
        description: 'Compact personal fan, perfect for small rooms. Available in multiple colors.',
        shortDescription: 'Personal fan, 5% off',
        stockQuantity: 150,
        imageUrl: 'https://image.cdn.shpy.in/386933/Fans1-1742631509893.jpeg',
        tags: ['fan', 'personal-fan', 'appliance'],
      },
      {
        name: 'Orient Ventilator DX 150MM Exhaust Fan',
        slug: 'orient-ventilator-exhaust-fan',
        sku: 'ORIENT-VXT-150-001',
        categorySlug: 'fans-lighting',
        brandSlug: 'orient',
        mrp: 2660,
        sellingPrice: 2149,
        description: 'Professional exhaust fan for kitchens and bathrooms.',
        shortDescription: 'Exhaust fan, 19% off',
        stockQuantity: 95,
        imageUrl: 'https://image.cdn.shpy.in/386933/Fans3-1743170301396.jpeg',
        tags: ['fan', 'exhaust-fan', 'bathroom'],
      },
      {
        name: 'Polycab Superia SP05 Ceiling Fan',
        slug: 'polycab-superia-fan',
        sku: 'POLYCAB-SP05-001',
        categorySlug: 'fans-lighting',
        brandSlug: 'polycab',
        mrp: 9000,
        sellingPrice: 5399,
        description: 'Superia series ceiling fan with premium finish and high air delivery.',
        shortDescription: 'Superia fan, 40% off',
        stockQuantity: 110,
        imageUrl: 'https://image.cdn.shpy.in/386933/Fans1-1742631509893.jpeg',
        tags: ['fan', 'ceiling-fan', 'appliance'],
      },
      {
        name: 'Usha Aeroclean Exhaust Fan - 230MM',
        slug: 'usha-aeroclean-exhaust-fan',
        sku: 'USHA-AEROCLEAN-230-001',
        categorySlug: 'fans-lighting',
        brandSlug: 'usha',
        mrp: 3045,
        sellingPrice: 1999,
        description: 'Aeroclean series exhaust fan for efficient air circulation.',
        shortDescription: 'Exhaust fan, 34% off',
        stockQuantity: 75,
        imageUrl: 'https://image.cdn.shpy.in/386933/Fans3-1743170301396.jpeg',
        tags: ['fan', 'exhaust-fan'],
      },
      {
        name: 'V-Guard Shovair S12 Electric Exhaust Fan',
        slug: 'vguard-shovair-exhaust-fan',
        sku: 'VGUARD-S12-001',
        categorySlug: 'fans-lighting',
        brandSlug: 'v-guard',
        mrp: 2150,
        sellingPrice: 2049,
        description: 'Shovair series high-performance exhaust fan.',
        shortDescription: 'Exhaust fan, 5% off',
        stockQuantity: 60,
        imageUrl: 'https://image.cdn.shpy.in/386933/Fans1-1742631509893.jpeg',
        tags: ['fan', 'exhaust-fan'],
      },
      {
        name: 'Altrix 1200MM Ceiling Fan',
        slug: 'altrix-ceiling-fan',
        sku: 'ALTRIX-1200-RUBY-001',
        categorySlug: 'fans-lighting',
        brandSlug: 'anchor',
        mrp: 2590,
        sellingPrice: 2199,
        description: 'Altrix series 1200MM ceiling fan in elegant Ruby color.',
        shortDescription: '1200MM fan, 15% off',
        stockQuantity: 88,
        imageUrl: 'https://image.cdn.shpy.in/386933/Fans3-1743170301396.jpeg',
        tags: ['fan', 'ceiling-fan', '1200mm'],
      },

      // TOOLS
      {
        name: 'Taparia Hand Tool Kit (40 pieces)',
        slug: 'taparia-toolkit-40pc',
        sku: 'TAPA-TOOL-40-001',
        categorySlug: 'power-tools',
        brandSlug: 'taparia',
        mrp: 4500,
        sellingPrice: 3299,
        description: 'Complete 40-piece hand tool kit for household and professional use.',
        shortDescription: 'Tool kit 40pc, 27% off',
        stockQuantity: 50,
        imageUrl: 'https://image.cdn.shpy.in/386933/PowerTools-1743170522784.jpeg',
        tags: ['tools', 'hand-tools', 'kit'],
      },
      {
        name: 'Super Steel Garden Tool Set',
        slug: 'super-steel-garden-tools',
        sku: 'SSTEEL-GTOOLS-001',
        categorySlug: 'garden-tools',
        brandSlug: 'super-steel',
        mrp: 2999,
        sellingPrice: 1899,
        description: 'Professional garden tool set with shovel, rake, hoe, and more.',
        shortDescription: 'Garden tools set, 37% off',
        stockQuantity: 75,
        imageUrl: 'https://image.cdn.shpy.in/386933/Gardentools43-1743169177417.jpeg',
        tags: ['tools', 'garden', 'outdoor'],
      },

      // MOTORS
      {
        name: 'Kirloskar 1 HP Single Phase Motor',
        slug: 'kirloskar-motor-1hp-sp',
        sku: 'KILO-MOTOR-1HP-SP-001',
        categorySlug: 'motors-fittings',
        brandSlug: 'kirloskar',
        mrp: 8999,
        sellingPrice: 6799,
        description: '1 HP single phase induction motor, ideal for agricultural applications.',
        shortDescription: '1HP motor, 24% off',
        stockQuantity: 35,
        imageUrl: 'https://image.cdn.shpy.in/386933/ChaffCutters-1749270182096.jpeg',
        tags: ['motor', 'electric-motor', 'agriculture'],
      },
      {
        name: 'Havells 0.5 HP Centrifugal Pump',
        slug: 'havells-centrifugal-pump-half-hp',
        sku: 'HAVELLS-PUMP-CENT-5-001',
        categorySlug: 'irrigation-items',
        brandSlug: 'havells',
        mrp: 5999,
        sellingPrice: 4299,
        description: '0.5 HP centrifugal pump for water supply and agriculture.',
        shortDescription: '0.5HP pump, 28% off',
        stockQuantity: 42,
        imageUrl: 'https://image.cdn.shpy.in/386933/Screenshot250-1731403908158.jpeg',
        tags: ['pump', 'centrifugal-pump', 'irrigation'],
      },

      // ACCESSORIES
      {
        name: 'TATA Steel Pipe 1 Inch (10 Meter)',
        slug: 'tata-steel-pipe-1inch-10m',
        sku: 'TATA-PIPE-1IN-10M-001',
        categorySlug: 'accessiories-spare-parts',
        brandSlug: 'tata-pipes',
        mrp: 3500,
        sellingPrice: 2799,
        description: '10 meter TATA steel pipe, 1 inch diameter. Durable and reliable.',
        shortDescription: 'Steel pipe 1", 20% off',
        stockQuantity: 200,
        imageUrl: 'https://image.cdn.shpy.in/386933/Screenshot250-1731403908158.jpeg',
        tags: ['pipe', 'accessories', 'irrigation'],
      },
      {
        name: 'Agricultural Spare Parts Bundle',
        slug: 'spare-parts-bundle-agri',
        sku: 'SPARE-BUNDLE-AGRI-001',
        categorySlug: 'accessiories-spare-parts',
        brandSlug: 'agrimate',
        mrp: 2999,
        sellingPrice: 1999,
        description: 'Essential spare parts bundle for regular maintenance.',
        shortDescription: 'Spare parts bundle, 33% off',
        stockQuantity: 80,
        imageUrl: 'https://image.cdn.shpy.in/386933/Pngtreegearicon_4812867-1724842776624.png',
        tags: ['accessories', 'spares', 'maintenance'],
      },
    ];

    const productMap = {};
    for (const prod of products) {
      // const { categorySlug, brandSlug, ...prodData } = prod;
      // const created = await prisma.product.upsert({
      //   where: { slug: prod.slug },
      //   update: {
      //     mrp: prod.mrp,
      //     sellingPrice: prod.sellingPrice,
      //     stockQuantity: prod.stockQuantity,
      //   },
      //   create: {
      //     ...prodData,
      //     categoryId: categoryMap[categorySlug],
      //     brandId: brandSlug ? brandMap[brandSlug] : null,
      //     isActive: true,
      //     isFeatured: Math.random() > 0.6,
      //   },
      // });
      const { categorySlug, brandSlug, imageUrl, ...prodData } = prod;

const created = await prisma.product.upsert({
  where: { slug: prod.slug },
  update: {
    mrp: prod.mrp,
    sellingPrice: prod.sellingPrice,
    stockQuantity: prod.stockQuantity,
    image: imageUrl
  },
  create: {
    ...prodData,
    image: imageUrl,
    categoryId: categoryMap[categorySlug],
    brandId: brandSlug ? brandMap[brandSlug] : null,
    isActive: true,
    isFeatured: Math.random() > 0.6,
  },
});
      productMap[prod.slug] = created.id;

      // Add product images
      if (prod.imageUrl) {
        await prisma.productImage.upsert({
          where: { id: `${created.id}-primary` },
          update: {},
          create: {
            id: `${created.id}-primary`,
            productId: created.id,
            url: prod.imageUrl,
            altText: prod.name,
            isPrimary: true,
            sortOrder: 0,
          },
        }).catch(() => {});
      }
    }
    console.log(`✅ ${products.length} products created\n`);

    // ──────────────────────────────────────────────────────────
    // 4. COLLECTIONS
    // ──────────────────────────────────────────────────────────
    console.log('📦 Creating collections...');
    const collections = [
      { name: 'New Launch',    slug: 'new-launch',    description: 'Latest products added to our store',   sortOrder: 1, imageUrl: 'https://image.cdn.shpy.in/386933/Seeders2-1742015463459.jpeg' },
      { name: 'Fans',          slug: 'fans',          description: 'Ceiling fans, exhaust fans, table fans', sortOrder: 2, imageUrl: 'https://image.cdn.shpy.in/386933/Fans3-1743170301396.jpeg' },
      { name: 'Best Sellers',  slug: 'best-sellers',  description: 'Most popular products loved by farmers', sortOrder: 3, imageUrl: 'https://image.cdn.shpy.in/386933/Gardentools43-1743169177417.jpeg' },
      { name: 'Sprayers',      slug: 'sprayers',      description: 'Battery sprayers, power sprayers',      sortOrder: 4, imageUrl: 'https://image.cdn.shpy.in/386933/1749178393402.jpeg' },
      { name: 'Water Pumps',   slug: 'water-pumps',   description: 'Submersible and surface water pumps',   sortOrder: 5, imageUrl: 'https://image.cdn.shpy.in/386933/Screenshot250-1731403908158.jpeg' },
    ];

    // const collectionMap = {};
    // for (const col of collections) {
    //   const created = await prisma.collection.upsert({
    //     where: { slug: col.slug },
    //     update: { name: col.name, description: col.description, image: col.imageUrl },
    //     create: { ...col, isActive: true },
       

    //   });
    //   collectionMap[col.slug] = created.id;
    // }

    const collectionMap = {};
for (const col of collections) {
  const created = await prisma.collection.upsert({
    where: { slug: col.slug },
    update: {
      name: col.name,
      description: col.description,
      image: col.imageUrl,
      sortOrder: col.sortOrder
    },
    create: {
      name: col.name,
      slug: col.slug,
      description: col.description,
      image: col.imageUrl,
      sortOrder: col.sortOrder,
      isActive: true
    },
  });

  collectionMap[col.slug] = created.id;
}
    console.log(`✅ ${collections.length} collections created\n`);

    // ──────────────────────────────────────────────────────────
    // 5. COLLECTION PRODUCTS
    // ──────────────────────────────────────────────────────────
    console.log('🔗 Adding products to collections...');
    
    // New Launch
    const newLaunchProducts = ['neptune-max-battery-sprayer', 'anchor-mineo-personal-fan', 'taparia-toolkit-40pc'];
    // Fans collection
    const fanProducts = ['anchor-eco-breeze-fan', 'anchor-venezia-fan', 'anchor-mineo-personal-fan', 'orient-ventilator-exhaust-fan', 'polycab-superia-fan', 'usha-aeroclean-exhaust-fan', 'v-guard-shovair-exhaust-fan', 'altrix-ceiling-fan'];
    // Best Sellers
    const bestSellerProducts = ['agrimate-gx25-power-sprayer', 'neptune-max-battery-sprayer', 'anchor-eco-breeze-fan', 'taparia-toolkit-40pc'];
    // Sprayers
    const sprayers = ['agrimate-gx25-power-sprayer', 'neptune-max-battery-sprayer'];
    // Water Pumps
    const pumps = ['agrimate-water-pump-3inch', 'havells-centrifugal-pump-half-hp'];

    for (const [idx, slug] of newLaunchProducts.entries()) {
      await prisma.collectionProduct.upsert({
        where: { collectionId_productId: { collectionId: collectionMap['new-launch'], productId: productMap[slug] } },
        update: { sortOrder: idx },
        create: { collectionId: collectionMap['new-launch'], productId: productMap[slug], sortOrder: idx },
      }).catch(() => {});
    }

    for (const [idx, slug] of fanProducts.entries()) {
      await prisma.collectionProduct.upsert({
        where: { collectionId_productId: { collectionId: collectionMap['fans'], productId: productMap[slug] } },
        update: { sortOrder: idx },
        create: { collectionId: collectionMap['fans'], productId: productMap[slug], sortOrder: idx },
      }).catch(() => {});
    }

    for (const [idx, slug] of bestSellerProducts.entries()) {
      await prisma.collectionProduct.upsert({
        where: { collectionId_productId: { collectionId: collectionMap['best-sellers'], productId: productMap[slug] } },
        update: { sortOrder: idx },
        create: { collectionId: collectionMap['best-sellers'], productId: productMap[slug], sortOrder: idx },
      }).catch(() => {});
    }

    for (const [idx, slug] of sprayers.entries()) {
      await prisma.collectionProduct.upsert({
        where: { collectionId_productId: { collectionId: collectionMap['sprayers'], productId: productMap[slug] } },
        update: { sortOrder: idx },
        create: { collectionId: collectionMap['sprayers'], productId: productMap[slug], sortOrder: idx },
      }).catch(() => {});
    }

    for (const [idx, slug] of pumps.entries()) {
      await prisma.collectionProduct.upsert({
        where: { collectionId_productId: { collectionId: collectionMap['water-pumps'], productId: productMap[slug] } },
        update: { sortOrder: idx },
        create: { collectionId: collectionMap['water-pumps'], productId: productMap[slug], sortOrder: idx },
      }).catch(() => {});
    }
    console.log(`✅ Products added to collections\n`);

    // ──────────────────────────────────────────────────────────
    // 6. BANNERS
    // ──────────────────────────────────────────────────────────
    console.log('🎨 Creating banners...');
    const banners = [
      {
        id: 'banner-hero-1',
        title: 'Premium Farm Equipment Sale',
        imageUrl: 'https://image.cdn.shpy.in/386933/Untitleddesign1-1751433617997.jpeg',
        linkUrl: '/categories/farm-equipments',
        position: 'hero',
        sortOrder: 1,
      },
      {
        id: 'banner-hero-2',
        title: 'Ceiling Fans Collection',
        imageUrl: 'https://image.cdn.shpy.in/386933/Fans3-1743170301396.jpeg',
        linkUrl: '/collections/fans',
        position: 'hero',
        sortOrder: 2,
      },
      {
        id: 'banner-section-1',
        title: 'Sprayers & Pumps',
        imageUrl: 'https://image.cdn.shpy.in/386933/1749178393402.jpeg',
        linkUrl: '/collections/sprayers',
        position: 'section',
        sortOrder: 1,
      },
      {
        id: 'banner-section-2',
        title: 'Garden Tools',
        imageUrl: 'https://image.cdn.shpy.in/386933/Gardentools43-1743169177417.jpeg',
        linkUrl: '/categories/garden-tools',
        position: 'section',
        sortOrder: 2,
      },
      {
        id: 'banner-bottom-1',
        title: 'Download Our App',
        imageUrl: 'https://image.cdn.shpy.in/386933/Seeders2-1742015463459.jpeg',
        linkUrl: '#app-download',
        position: 'bottom',
        sortOrder: 1,
      },
    ];

    for (const banner of banners) {
      await prisma.banner.upsert({
        where: { id: banner.id },
        update: {},
        create: { ...banner, isActive: true },
      }).catch(() => {});
    }
    console.log(`✅ ${banners.length} banners created\n`);

    // ──────────────────────────────────────────────────────────
    // 7. COUPON
    // ──────────────────────────────────────────────────────────
    console.log('🎟️  Creating coupons...');
    await prisma.coupon.upsert({
      where: { code: 'WELCOME10' },
      update: {},
      create: {
        code: 'WELCOME10',
        type: 'PERCENT',
        value: 10,
        minOrderAmount: 500,
        maxDiscount: 200,
        usesLimit: 1000,
        perUserLimit: 1,
        isActive: true,
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    }).catch(() => {});

    await prisma.coupon.upsert({
      where: { code: 'PREPAID15' },
      update: {},
      create: {
        code: 'PREPAID15',
        type: 'PERCENT',
        value: 15,
        minOrderAmount: 2000,
        maxDiscount: 1000,
        usesLimit: 500,
        perUserLimit: 1,
        isActive: true,
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    }).catch(() => {});
    console.log('✅ Coupons created\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY! 🎉');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📊 Summary:');
    console.log(`   ✅ ${categories.length} Categories`);
    console.log(`   ✅ ${brands.length} Brands`);
    console.log(`   ✅ ${products.length} Products`);
    console.log(`   ✅ ${collections.length} Collections`);
    console.log(`   ✅ ${banners.length} Banners`);
    console.log(`   ✅ 2 Coupons`);
    console.log('\n📝 Next Steps:');
    console.log('   1. Start the backend server: npm run dev');
    console.log('   2. Start the frontend: cd ../frontend && npm run dev');
    console.log('   3. Visit: http://localhost:3000');
    console.log('   4. Create admin: Go to /admin and login with your credentials');
    console.log('\n🌐 Admin Panel: http://localhost:3000/admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
