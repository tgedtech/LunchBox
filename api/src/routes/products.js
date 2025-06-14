import express from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

// GET all products (with category, default location, default unit type)
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

// POST create new product (handling relations)
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

  try {
    const data = {
      name,
      description,
      defaultQuantity,
      defaultUnit,
      // Relations: Only connect if the ID is present and non-empty
      ...(categoryId && { category: { connect: { id: categoryId } } }),
      ...(defaultLocationId && { defaultLocation: { connect: { id: defaultLocationId } } }),
      ...(defaultUnitTypeId && { defaultUnitType: { connect: { id: defaultUnitTypeId } } }),
    };

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
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT update product (handling relations)
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
      // Relations: connect if value present, set to null if explicitly null/empty
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

// DELETE product
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