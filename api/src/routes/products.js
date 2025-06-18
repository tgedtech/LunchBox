import express from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' },
      include: {
        category: true,
        defaultLocation: true,
        defaultUnitType: true,
      },
    });
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const {
    name,
    description,
    defaultQuantity,
    defaultUnit,
    categoryId,
    defaultLocationId,
    defaultUnitTypeId,
    inventoryBehavior, // <-- CRUCIAL!
  } = req.body;

  // LOG: Incoming payload
  console.log('--- PRODUCT CREATE PAYLOAD ---');
  console.log({
    name,
    description,
    defaultQuantity,
    defaultUnit,
    categoryId,
    defaultLocationId,
    defaultUnitTypeId,
    inventoryBehavior,
  });

  try {
    // CRITICAL: Always set inventoryBehavior (default to 1 if not valid)
    let safeInventoryBehavior = Number(inventoryBehavior);
    if (![1, 2, 3].includes(safeInventoryBehavior)) safeInventoryBehavior = 1;

    const data = {
      name,
      description,
      defaultQuantity,
      defaultUnit,
      ...(categoryId && { category: { connect: { id: categoryId } } }),
      ...(defaultLocationId && { defaultLocation: { connect: { id: defaultLocationId } } }),
      ...(defaultUnitTypeId && { defaultUnitType: { connect: { id: defaultUnitTypeId } } }),
      inventoryBehavior: safeInventoryBehavior,
    };

    // LOG: Prisma create data
    console.log('--- PRISMA PRODUCT CREATE DATA ---');
    console.log(data);

    const product = await prisma.product.create({
      data,
      include: {
        category: true,
        defaultLocation: true,
        defaultUnitType: true,
      },
    });
    // LOG: Product created
    console.log('--- PRODUCT CREATED ---');
    console.log(product);
    res.status(201).json(product);
  } catch (err) {
    console.error('Error creating product:', err);
    if (err.meta) console.error('Prisma error meta:', err.meta);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    defaultQuantity,
    defaultUnit,
    categoryId,
    defaultLocationId,
    defaultUnitTypeId,
    inventoryBehavior, // <-- CRUCIAL!
  } = req.body;

  // LOG: Incoming payload
  console.log('--- PRODUCT UPDATE PAYLOAD ---');
  console.log({
    name,
    description,
    defaultQuantity,
    defaultUnit,
    categoryId,
    defaultLocationId,
    defaultUnitTypeId,
    inventoryBehavior,
  });

  try {
    // CRITICAL: Always set inventoryBehavior (default to 1 if not valid)
    let safeInventoryBehavior = Number(inventoryBehavior);
    if (![1, 2, 3].includes(safeInventoryBehavior)) safeInventoryBehavior = 1;

    const data = {
      name,
      description,
      defaultQuantity,
      defaultUnit,
      category: categoryId
        ? { connect: { id: categoryId } }
        : { disconnect: true },
      defaultLocation: defaultLocationId
        ? { connect: { id: defaultLocationId } }
        : { disconnect: true },
      defaultUnitType: defaultUnitTypeId
        ? { connect: { id: defaultUnitTypeId } }
        : { disconnect: true },
      inventoryBehavior: safeInventoryBehavior,
    };

    // LOG: Prisma update data
    console.log('--- PRISMA PRODUCT UPDATE DATA ---');
    console.log(data);

    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        defaultLocation: true,
        defaultUnitType: true,
      },
    });
    // LOG: Product updated
    console.log('--- PRODUCT UPDATED ---');
    console.log(product);
    res.json(product);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.product.delete({
      where: { id },
    });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;