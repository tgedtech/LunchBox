import express from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const categories = await prisma.productCategory.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const { name, favorite } = req.body;
  try {
    const category = await prisma.productCategory.create({
      data: { name, favorite: !!favorite },
    });
    res.status(201).json(category);
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, favorite } = req.body;
  try {
    const category = await prisma.productCategory.update({
      where: { id },
      data: { ...(name && { name }), ...(favorite !== undefined && { favorite }) },
    });
    res.json(category);
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.productCategory.delete({
      where: { id },
    });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

router.post('/:id/reassign-and-delete', authMiddleware, async (req, res) => {
  const { id } = req.params; // category to delete
  const { reassignToCategoryId } = req.body;
  if (!reassignToCategoryId) {
    return res.status(400).json({ error: 'Missing reassignment category.' });
  }
  try {
    // 1. Update all products pointing to this category
    await prisma.product.updateMany({
      where: { categoryId: id },
      data: { categoryId: reassignToCategoryId }
    });
    // 2. Delete the old category
    await prisma.productCategory.delete({ where: { id } });
    res.json({ message: 'Category reassigned and deleted.' });
  } catch (err) {
    console.error('Error reassigning/deleting category:', err);
    res.status(500).json({ error: 'Failed to reassign and delete category.' });
  }
});

export default router;