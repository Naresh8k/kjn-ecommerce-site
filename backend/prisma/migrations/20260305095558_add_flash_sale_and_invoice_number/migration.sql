/*
  Warnings:

  - A unique constraint covering the columns `[invoiceNumber]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "invoiceNumber" TEXT;

-- CreateTable
CREATE TABLE "FlashSale" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "flashPrice" DECIMAL(10,2) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlashSale_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FlashSale_productId_idx" ON "FlashSale"("productId");

-- CreateIndex
CREATE INDEX "FlashSale_endDate_idx" ON "FlashSale"("endDate");

-- CreateIndex
CREATE INDEX "FlashSale_isActive_endDate_idx" ON "FlashSale"("isActive", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "Order_invoiceNumber_key" ON "Order"("invoiceNumber");

-- AddForeignKey
ALTER TABLE "FlashSale" ADD CONSTRAINT "FlashSale_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
