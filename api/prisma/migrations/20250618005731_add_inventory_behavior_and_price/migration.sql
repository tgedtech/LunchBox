-- AlterTable
ALTER TABLE "InventoryItem" ADD COLUMN     "price" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "inventoryBehavior" INTEGER NOT NULL DEFAULT 1;
