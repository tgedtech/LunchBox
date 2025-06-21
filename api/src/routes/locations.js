import express from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(locations);
  } catch (err) {
    console.error('Error fetching locations:', err);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const { name } = req.body;
  try {
    // Uniqueness check
    const exists = await prisma.location.findUnique({ where: { name } });
    if (exists) {
      return res.status(400).json({ error: 'Location name must be unique.' });
    }
    const location = await prisma.location.create({ data: { name } });
    res.status(201).json(location);
  } catch (err) {
    console.error('Error creating location:', err);
    res.status(500).json({ error: 'Failed to create location' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    // Uniqueness check
    if (name) {
      const exists = await prisma.location.findFirst({
        where: { name, NOT: { id } },
      });
      if (exists) {
        return res.status(400).json({ error: 'Location name must be unique.' });
      }
    }
    const location = await prisma.location.update({
      where: { id },
      data: { name },
    });
    res.json(location);
  } catch (err) {
    console.error('Error updating location:', err);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.location.delete({ where: { id } });
    res.json({ message: 'Location deleted' });
  } catch (err) {
    console.error('Error deleting location:', err);
    res.status(500).json({ error: 'Failed to delete location' });
  }
});

// ----------- REASSIGN-AND-DELETE -----------
router.post('/:id/reassign-and-delete', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { reassignToLocationId } = req.body;
  if (!reassignToLocationId) {
    return res.status(400).json({ error: 'Missing reassignment location.' });
  }
  try {
    await prisma.inventoryItem.updateMany({
      where: { locationId: id },
      data: { locationId: reassignToLocationId }
    });
    await prisma.location.delete({ where: { id } });
    res.json({ message: 'Location reassigned and deleted.' });
  } catch (err) {
    console.error('Error reassigning/deleting location:', err);
    res.status(500).json({ error: 'Failed to reassign and delete location.' });
  }
});

export default router;