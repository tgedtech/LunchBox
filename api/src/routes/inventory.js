import express from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

// GET /inventory — Get all inventory items for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const items = await prisma.inventoryItem.findMany({
      where: { userId: req.userId },  // SCOPED query
      include: {
        product: true,
        location: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
    res.json(items);
  } catch (err) {
    console.error('Error fetching inventory:', err);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// POST /inventory — Create a new inventory item
router.post('/', authMiddleware, async (req, res) => {
  const { productId, locationId, quantity, unit, expiration, opened } = req.body;

  try {
    const item = await prisma.inventoryItem.create({
      data: {
        productId,
        locationId,
        quantity,
        unit,
        expiration: expiration ? new Date(expiration) : null,
        opened: opened || false,
        userId: req.userId,  // SCOPED creation
      },
    });
    res.status(201).json(item);
  } catch (err) {
    console.error('Error creating inventory item:', err);
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
});

// PUT /inventory/:id — Update an inventory item
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { quantity, unit, expiration, opened, locationId } = req.body;

  try {
    // Check that the item belongs to current user first
    const existing = await prisma.inventoryItem.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await prisma.inventoryItem.update({
      where: { id },
      data: {
        quantity,
        unit,
        expiration: expiration ? new Date(expiration) : null,
        opened,
        locationId,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error('Error updating inventory item:', err);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
});

// DELETE /inventory/:id — Delete an inventory item
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    // Check that the item belongs to current user first
    const existing = await prisma.inventoryItem.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.inventoryItem.delete({
      where: { id },
    });

    res.json({ message: 'Inventory item deleted' });
  } catch (err) {
    console.error('Error deleting inventory item:', err);
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
});

export default router;