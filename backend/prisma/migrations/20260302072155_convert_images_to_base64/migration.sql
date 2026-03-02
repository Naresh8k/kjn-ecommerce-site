/*
  Convert all image storage from URLs to base64
  
  WARNING: This will clear existing data in tables with images
  Run seed script after migration to repopulate with base64 images
*/

-- Clear tables with required image fields first
TRUNCATE TABLE "CollectionProduct" CASCADE;
TRUNCATE TABLE "ProductImage" CASCADE;
TRUNCATE TABLE "Banner" CASCADE;

-- Clear dependent data
TRUNCATE TABLE "CartItem" CASCADE;
TRUNCATE TABLE "OrderItem" CASCADE;
TRUNCATE TABLE "Wishlist" CASCADE;
TRUNCATE TABLE "Review" CASCADE;
TRUNCATE TABLE "ProductVariant" CASCADE;
TRUNCATE TABLE "Product" CASCADE;
TRUNCATE TABLE "Collection" CASCADE;

-- Update User table (optional field)
ALTER TABLE "User" DROP COLUMN IF EXISTS "avatarUrl";
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatar" TEXT;

-- Update Brand table (optional field)
ALTER TABLE "Brand" DROP COLUMN IF EXISTS "logoUrl";
ALTER TABLE "Brand" ADD COLUMN IF NOT EXISTS "logo" TEXT;

-- Update Category table (optional field)
ALTER TABLE "Category" DROP COLUMN IF EXISTS "imageUrl";
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "image" TEXT;

-- Update Collection table (optional field)
ALTER TABLE "Collection" DROP COLUMN IF EXISTS "imageUrl";
ALTER TABLE "Collection" ADD COLUMN IF NOT EXISTS "image" TEXT;

-- Update Product table (optional field)
ALTER TABLE "Product" DROP COLUMN IF EXISTS "imageUrl";
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "image" TEXT;

-- Update ProductImage table (required field)
ALTER TABLE "ProductImage" DROP COLUMN IF EXISTS "url";
ALTER TABLE "ProductImage" ADD COLUMN "image" TEXT NOT NULL DEFAULT '';

-- Update Banner table (required field)
ALTER TABLE "Banner" DROP COLUMN IF EXISTS "imageUrl";
ALTER TABLE "Banner" ADD COLUMN "image" TEXT NOT NULL DEFAULT '';

-- Update OrderItem (optional field for historical data)
ALTER TABLE "OrderItem" ALTER COLUMN "productImage" TYPE TEXT;

-- Update Blog coverImage (optional field)
ALTER TABLE "Blog" ALTER COLUMN "coverImage" TYPE TEXT;
