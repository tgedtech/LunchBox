/*
  Warnings:

  - You are about to drop the column `category` on the `ShoppingListItem` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `ShoppingListItemHistory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ShoppingListItem" DROP COLUMN "category",
ADD COLUMN     "categoryId" TEXT;

-- AlterTable
ALTER TABLE "ShoppingListItemHistory" DROP COLUMN "category",
ADD COLUMN     "categoryId" TEXT;
