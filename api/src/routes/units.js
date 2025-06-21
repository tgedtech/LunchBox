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
    // Uniqueness check
    const exists = await prisma.unit.findUnique({ where: { name } });
    if (exists) {
      return res.status(400).json({ error: 'Unit name must be unique.' });
    }
    const unit = await prisma.unit.create({ data: { name } });
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
    // Uniqueness check
    if (name) {
      const exists = await prisma.unit.findFirst({
        where: { name, NOT: { id } },
      });
      if (exists) {
        return res.status(400).json({ error: 'Unit name must be unique.' });
      }
    }
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
    await prisma.unit.delete({ where: { id } });
    res.json({ message: 'Unit deleted' });
  } catch (err) {
    console.error('Error deleting unit:', err);
    res.status(500).json({ error: 'Failed to delete unit' });
  }
});

// ----------- REASSIGN-AND-DELETE -----------
router.post('/:id/reassign-and-delete', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { reassignToUnitId } = req.body;
  if (!reassignToUnitId) {
    return res.status(400).json({ error: 'Missing reassignment unit.' });
  }
  try {
    // Products: defaultUnitTypeId
    await prisma.product.updateMany({
      where: { defaultUnitTypeId: id },
      data: { defaultUnitTypeId: reassignToUnitId }
    });
    // InventoryItems: unit string field, not a relation, so we skip here unless you use a relation in schema
    await prisma.unit.delete({ where: { id } });
    res.json({ message: 'Unit reassigned and deleted.' });
  } catch (err) {
    console.error('Error reassigning/deleting unit:', err);
    res.status(500).json({ error: 'Failed to reassign and delete unit.' });
  }
});

export default router;