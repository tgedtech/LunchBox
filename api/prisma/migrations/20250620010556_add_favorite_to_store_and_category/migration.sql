-- AlterTable
ALTER TABLE "ProductCategory" ADD COLUMN     "favorite" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "favorite" BOOLEAN NOT NULL DEFAULT false;
