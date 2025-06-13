import express from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' },
      include: { category: true },
    });
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const { name, description, defaultQuantity, defaultUnit, categoryId } = req.body;

  try {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        defaultQuantity,
        defaultUnit,
        categoryId,
      },
    });
    res.status(201).json(product);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, description, defaultQuantity, defaultUnit, categoryId } = req.body;

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        defaultQuantity,
        defaultUnit,
        categoryId,
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