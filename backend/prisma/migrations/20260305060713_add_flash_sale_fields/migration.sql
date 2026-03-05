-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "flashSaleEndDate" TIMESTAMP(3),
ADD COLUMN     "isFlashSale" BOOLEAN NOT NULL DEFAULT false;
