import express from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const items = await prisma.inventoryItem.findMany({
      where: { userId: req.userId },
      include: {
        product: {
          include: {
            category: true,
          },
        },
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

router.post('/', authMiddleware, async (req, res) => {
  const { productId, locationId, quantity, unit, expiration, opened } = req.body;

  try {
    // Find if an item with the same product/location/unit/user exists
    const existing = await prisma.inventoryItem.findFirst({
      where: {
        userId: req.userId,
        productId,
        locationId,
        unit,
      },
    });

    if (existing) {
      // Merge: sum quantities, keep earliest expiration, leave "opened" as existing
      const newQuantity = Number(existing.quantity) + Number(quantity);

      let newExpiration = existing.expiration;
      if (expiration) {
        const newExpDate = new Date(expiration);
        if (!newExpiration || (newExpDate < newExpiration)) {
          newExpiration = newExpDate;
        }
      }

      const updated = await prisma.inventoryItem.update({
        where: { id: existing.id },
        data: {
          quantity: newQuantity,
          expiration: newExpiration,
        },
      });
      return res.status(200).json(updated);
    } else {
      // No match, create new row
      const item = await prisma.inventoryItem.create({
        data: {
          productId,
          locationId,
          quantity,
          unit,
          expiration: expiration ? new Date(expiration) : null,
          opened: opened || false,
          userId: req.userId,
        },
      });
      return res.status(201).json(item);
    }
  } catch (err) {
    console.error('Error creating inventory item:', err);
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { quantity, unit, expiration, opened, locationId } = req.body;

  try {
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

router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
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