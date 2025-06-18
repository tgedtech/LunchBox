import express from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

function parseBool(val) {
  if (typeof val === 'string') return val === 'true';
  return !!val;
}

// Get all inventory items for user, with filtering for expiration status
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { expired, expiringSoon } = req.query;
    const now = new Date();
    let where = { userId: req.userId };

    if (parseBool(expired)) {
      where = {
        ...where,
        expiration: { lt: now },
      };
    } else if (parseBool(expiringSoon)) {
      const soon = new Date();
      soon.setDate(soon.getDate() + 7);
      where = {
        ...where,
        expiration: { gte: now, lte: soon },
      };
    }

    const items = await prisma.inventoryItem.findMany({
      where,
      include: {
        product: {
          include: {
            category: true,
            defaultLocation: true,
            defaultUnitType: true,
          },
        },
        location: true,
        store: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json(items);
  } catch (err) {
    console.error('Error fetching inventory:', err);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// Add a new inventory item or increment quantity if match found
router.post('/', authMiddleware, async (req, res) => {
  const { productId, locationId, quantity, unit, expiration, opened, price, storeId } = req.body;

  try {
    const existing = await prisma.inventoryItem.findFirst({
      where: {
        userId: req.userId,
        productId,
        locationId,
        unit,
        storeId: storeId || null,
        opened: false,
      },
    });

    if (existing) {
      const newQuantity = Number(existing.quantity) + Number(quantity);
      let newExpiration = existing.expiration;
      if (expiration) {
        const newExpDate = new Date(expiration);
        if (!newExpiration || newExpDate < newExpiration) {
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
      const item = await prisma.inventoryItem.create({
        data: {
          productId,
          locationId,
          quantity,
          unit,
          expiration: expiration ? new Date(expiration) : null,
          opened: opened || false,
          price: price !== undefined ? parseFloat(price) : null,
          storeId: storeId || null,
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

// Update an inventory item (qty, open status, etc.)
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { quantity, unit, expiration, opened, locationId, price, storeId } = req.body;

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
        price: price !== undefined ? parseFloat(price) : existing.price,
        storeId: storeId || existing.storeId,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error('Error updating inventory item:', err);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
});

// Delete an inventory item
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

// OPEN/SPLIT route: handles category-based logic for opening/using items
router.put('/:id/split', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { openQuantity } = req.body;

  if (!openQuantity || openQuantity <= 0) {
    return res.status(400).json({ error: 'Invalid quantity to open' });
  }

  try {
    const existing = await prisma.inventoryItem.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!existing || existing.userId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (openQuantity > existing.quantity) {
      return res.status(400).json({ error: 'Not enough quantity' });
    }

    const inventoryBehavior = existing.product?.inventoryBehavior || 1;

    if (inventoryBehavior === 1) {
      // CATEGORY 1: Remove-on-open (consumed immediately)
      const remaining = existing.quantity - openQuantity;
      if (remaining > 0) {
        const updated = await prisma.inventoryItem.update({
          where: { id },
          data: { quantity: remaining },
        });
        return res.json([updated]);
      } else {
        await prisma.inventoryItem.delete({ where: { id } });
        return res.json([]); // nothing remains
      }
    }

    // CATEGORY 2 or 3: Split as before (create an 'opened' item)
    const updated = await prisma.inventoryItem.update({
      where: { id },
      data: { quantity: existing.quantity - openQuantity },
    });

    const openedItem = await prisma.inventoryItem.create({
      data: {
        productId: existing.productId,
        locationId: existing.locationId,
        userId: existing.userId,
        unit: existing.unit,
        quantity: openQuantity,
        expiration: existing.expiration,
        price: existing.price,
        storeId: existing.storeId,
        opened: true,
      },
    });

    if (updated.quantity <= 0) {
      await prisma.inventoryItem.delete({ where: { id } });
    }

    // Return both records for UI refresh (opened and remaining if any)
    const remainingItems = await prisma.inventoryItem.findMany({
      where: {
        OR: [{ id: openedItem.id }, { id }],
      },
      include: {
        product: {
          include: {
            category: true,
            defaultLocation: true,
            defaultUnitType: true,
          },
        },
        location: true,
        store: true,
      },
    });

    res.json(remainingItems);
  } catch (err) {
    console.error('Error splitting inventory item:', err);
    res.status(500).json({ error: 'Failed to split/open inventory item' });
  }
});

export default router;