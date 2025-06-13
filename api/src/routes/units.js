import express from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const units = await prisma.unit.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(units);
  } catch (err) {
    console.error('Error fetching units:', err);
    res.status(500).json({ error: 'Failed to fetch units' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const { name } = req.body;

  try {
    const unit = await prisma.unit.create({
      data: { name },
    });
    res.status(201).json(unit);
  } catch (err) {
    console.error('Error creating unit:', err);
    res.status(500).json({ error: 'Failed to create unit' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const unit = await prisma.unit.update({
      where: { id },
      data: { name },
    });
    res.json(unit);
  } catch (err) {
    console.error('Error updating unit:', err);
    res.status(500).json({ error: 'Failed to update unit' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.unit.delete({
      where: { id },
    });
    res.json({ message: 'Unit deleted' });
  } catch (err) {
    console.error('Error deleting unit:', err);
    res.status(500).json({ error: 'Failed to delete unit' });
  }
});

export default router;