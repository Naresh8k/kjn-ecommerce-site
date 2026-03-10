-- AlterTable
ALTER TABLE "Banner" ADD COLUMN     "bgColor" TEXT,
ADD COLUMN     "buttonText" TEXT,
ADD COLUMN     "overlayOpacity" DOUBLE PRECISION,
ADD COLUMN     "popupDelay" INTEGER DEFAULT 1,
ADD COLUMN     "subtitle" TEXT,
ADD COLUMN     "textColor" TEXT;
