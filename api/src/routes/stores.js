import express from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const stores = await prisma.store.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(stores);
  } catch (err) {
    console.error('Error fetching stores:', err);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const { name } = req.body;

  try {
    const store = await prisma.store.create({
      data: { name },
    });
    res.status(201).json(store);
  } catch (err) {
    console.error('Error creating store:', err);
    res.status(500).json({ error: 'Failed to create store' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const store = await prisma.store.update({
      where: { id },
      data: { name },
    });
    res.json(store);
  } catch (err) {
    console.error('Error updating store:', err);
    res.status(500).json({ error: 'Failed to update store' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.store.delete({
      where: { id },
    });
    res.json({ message: 'Store deleted' });
  } catch (err) {
    console.error('Error deleting store:', err);
    res.status(500).json({ error: 'Failed to delete store' });
  }
});

export default router;