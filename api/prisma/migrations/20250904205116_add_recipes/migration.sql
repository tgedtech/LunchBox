-- CreateEnum
CREATE TYPE "RecipeIngredientType" AS ENUM ('ITEM', 'HEADING');

-- CreateEnum
CREATE TYPE "IngredientLinkStatus" AS ENUM ('PENDING', 'LINKED');

-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdByUserId" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "description" TEXT,
    "servings" INTEGER,
    "yields" TEXT,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "imageUrl" TEXT,
    "courseId" TEXT,
    "cuisineId" TEXT,
    "keyIngredientId" TEXT,
    "keyIngredientText" TEXT,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeStep" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "idx" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "minutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecipeStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeIngredient" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "idx" INTEGER NOT NULL,
    "type" "RecipeIngredientType" NOT NULL DEFAULT 'ITEM',
    "amount" DECIMAL(10,3),
    "unitId" TEXT,
    "productId" TEXT,
    "name" TEXT,
    "notes" TEXT,
    "heading" TEXT,
    "rawText" TEXT NOT NULL,
    "linkStatus" "IngredientLinkStatus" NOT NULL DEFAULT 'PENDING',
    "candidateName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeCourse" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "createdByUserId" TEXT,

    CONSTRAINT "RecipeCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeCuisine" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "createdByUserId" TEXT,

    CONSTRAINT "RecipeCuisine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdByUserId" TEXT,

    CONSTRAINT "RecipeTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeTagOnRecipe" (
    "recipeId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "RecipeTagOnRecipe_pkey" PRIMARY KEY ("recipeId","tagId")
);

-- CreateIndex
CREATE INDEX "Recipe_createdByUserId_idx" ON "Recipe"("createdByUserId");

-- CreateIndex
CREATE INDEX "Recipe_courseId_idx" ON "Recipe"("courseId");

-- CreateIndex
CREATE INDEX "Recipe_cuisineId_idx" ON "Recipe"("cuisineId");

-- CreateIndex
CREATE INDEX "Recipe_favorite_idx" ON "Recipe"("favorite");

-- CreateIndex
CREATE INDEX "Recipe_title_idx" ON "Recipe"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_slug_createdByUserId_key" ON "Recipe"("slug", "createdByUserId");

-- CreateIndex
CREATE INDEX "RecipeStep_recipeId_idx_idx" ON "RecipeStep"("recipeId", "idx");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeStep_recipeId_idx_key" ON "RecipeStep"("recipeId", "idx");

-- CreateIndex
CREATE INDEX "RecipeIngredient_recipeId_idx_idx" ON "RecipeIngredient"("recipeId", "idx");

-- CreateIndex
CREATE INDEX "RecipeIngredient_productId_idx" ON "RecipeIngredient"("productId");

-- CreateIndex
CREATE INDEX "RecipeIngredient_unitId_idx" ON "RecipeIngredient"("unitId");

-- CreateIndex
CREATE INDEX "RecipeIngredient_linkStatus_idx" ON "RecipeIngredient"("linkStatus");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeIngredient_recipeId_idx_key" ON "RecipeIngredient"("recipeId", "idx");

-- CreateIndex
CREATE INDEX "RecipeCourse_favorite_idx" ON "RecipeCourse"("favorite");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeCourse_name_createdByUserId_key" ON "RecipeCourse"("name", "createdByUserId");

-- CreateIndex
CREATE INDEX "RecipeCuisine_favorite_idx" ON "RecipeCuisine"("favorite");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeCuisine_name_createdByUserId_key" ON "RecipeCuisine"("name", "createdByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeTag_name_createdByUserId_key" ON "RecipeTag"("name", "createdByUserId");

-- CreateIndex
CREATE INDEX "RecipeTagOnRecipe_tagId_idx" ON "RecipeTagOnRecipe"("tagId");

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "RecipeCourse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_cuisineId_fkey" FOREIGN KEY ("cuisineId") REFERENCES "RecipeCuisine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_keyIngredientId_fkey" FOREIGN KEY ("keyIngredientId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeStep" ADD CONSTRAINT "RecipeStep_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeCourse" ADD CONSTRAINT "RecipeCourse_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeCuisine" ADD CONSTRAINT "RecipeCuisine_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeTag" ADD CONSTRAINT "RecipeTag_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeTagOnRecipe" ADD CONSTRAINT "RecipeTagOnRecipe_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeTagOnRecipe" ADD CONSTRAINT "RecipeTagOnRecipe_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "RecipeTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
