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
  } = req.body;

  // === DEBUG LOGGING: Output payload and IDs for troubleshooting ===
  console.log('--- PRODUCT CREATE PAYLOAD ---');
  console.log({
    name,
    description,
    defaultQuantity,
    defaultUnit,
    categoryId,
    defaultLocationId,
    defaultUnitTypeId,
  });

  try {
    const data = {
      name,
      description,
      defaultQuantity,
      defaultUnit,
      ...(categoryId && { category: { connect: { id: categoryId } } }),
      ...(defaultLocationId && { defaultLocation: { connect: { id: defaultLocationId } } }),
      ...(defaultUnitTypeId && { defaultUnitType: { connect: { id: defaultUnitTypeId } } }),
    };

    // Log final Prisma data object for additional verification
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
    res.status(201).json(product);
  } catch (err) {
    // Enhanced error logging for debugging
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
  } = req.body;

  try {
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
    };

    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        defaultLocation: true,
        defaultUnitType: true,
      },
    });
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