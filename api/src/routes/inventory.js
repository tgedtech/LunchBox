import express from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

/**
 * Helper: parse a boolean from query params
 */
function parseBool(val) {
  if (typeof val === 'string') return val === 'true';
  return !!val;
}

/**
 * GET /inventory
 * Returns all inventory items for the current user.
 * Supports ?expired=true or ?expiringSoon=true for filtering.
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { expired, expiringSoon } = req.query;
    const now = new Date();
    let where = { userId: req.userId };

    if (parseBool(expired)) {
      where = { ...where, expiration: { lt: now } };
    } else if (parseBool(expiringSoon)) {
      const soon = new Date();
      soon.setDate(soon.getDate() + 7);
      where = { ...where, expiration: { gte: now, lte: soon } };
    }

    const items = await prisma.inventoryItem.findMany({
      where,
      include: {
        product: { include: { category: true, defaultLocation: true, defaultUnitType: true } },
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

/**
 * POST /inventory
 * Always creates a new inventory item record (no merging/aggregation).
 * Allows multiple lots/instances per product-location-unit-store.
 */
router.post('/', authMiddleware, async (req, res) => {
  const { productId, locationId, quantity, unit, expiration, opened, price, storeId } = req.body;

  try {
    // Create a new inventory instance (never merge!)
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
  } catch (err) {
    console.error('Error creating inventory item:', err);
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
});

/**
 * PUT /inventory/:id
 * Update an inventory item by ID. (Note: Not used for merging. Only for direct updates.)
 */
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const {
    quantity, unit, expiration, opened, price, storeId, locationId,
  } = req.body;

  try {
    // Only update allowed fields for the inventory item
    const updated = await prisma.inventoryItem.update({
      where: { id },
      data: {
        ...(quantity !== undefined ? { quantity: Number(quantity) } : {}),
        ...(unit !== undefined ? { unit } : {}),
        ...(expiration !== undefined ? { expiration: expiration ? new Date(expiration) : null } : {}),
        ...(opened !== undefined ? { opened: !!opened } : {}),
        ...(price !== undefined ? { price: price !== null ? parseFloat(price) : null } : {}),
        ...(storeId !== undefined ? { storeId: storeId || null } : {}),
        ...(locationId !== undefined ? { locationId } : {}),
      },
    });
    res.json(updated);
  } catch (err) {
    console.error('Error updating inventory item:', err);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
});

/**
 * DELETE /inventory/:id
 * Remove an inventory item by ID.
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await prisma.inventoryItem.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await prisma.inventoryItem.delete({ where: { id } });
    res.json({ message: 'Inventory item deleted' });
  } catch (err) {
    console.error('Error deleting inventory item:', err);
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
});

/**
 * PUT /inventory/:id/split
 * Category 1, 2, 3 (open/use or remove open instance for Cat2/3)
 * - For Cat 1: consumes quantity or deletes row if empty
 * - For Cat 2/3: opens a new instance, or removes open instance
 */
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
      // Category 1: decrement or delete
      const remaining = existing.quantity - openQuantity;
      if (remaining > 0) {
        const updated = await prisma.inventoryItem.update({
          where: { id },
          data: { quantity: remaining },
        });
        return res.json([updated]);
      } else {
        await prisma.inventoryItem.delete({ where: { id } });
        return res.json([]);
      }
    }

    if (inventoryBehavior === 2 || inventoryBehavior === 3) {
      // Only open if not already opened
      if (!existing.opened) {
        // Prevent double-open of same lot
        const alreadyOpened = await prisma.inventoryItem.findFirst({
          where: {
            userId: req.userId,
            productId: existing.productId,
            locationId: existing.locationId,
            unit: existing.unit,
            storeId: existing.storeId || null,
            opened: true,
          },
        });
        if (alreadyOpened) {
          return res.status(400).json({ error: 'An open unit already exists. Finish it before opening another.' });
        }

        // Open 1 unit (always 1), decrement unopened lot
        const expirationToUse = (inventoryBehavior === 3 && existing.expiration)
          ? existing.expiration
          : existing.expiration;

        const updated = await prisma.inventoryItem.update({
          where: { id },
          data: { quantity: existing.quantity - 1 },
        });
        const openedItem = await prisma.inventoryItem.create({
          data: {
            productId: existing.productId,
            locationId: existing.locationId,
            userId: existing.userId,
            unit: existing.unit,
            quantity: 1,
            expiration: expirationToUse,
            price: existing.price,
            storeId: existing.storeId,
            opened: true,
          },
        });
        if (updated.quantity <= 0) {
          await prisma.inventoryItem.delete({ where: { id } });
        }
        // Return latest state for this product/location/unit/store
        const items = await prisma.inventoryItem.findMany({
          where: {
            userId: req.userId,
            productId: existing.productId,
            locationId: existing.locationId,
            unit: existing.unit,
            storeId: existing.storeId || null,
          },
          include: {
            product: { include: { category: true, defaultLocation: true, defaultUnitType: true } },
            location: true,
            store: true,
          },
        });
        return res.json(items);
      } else {
        // Removing an open instance (i.e. consume/dispose open unit)
        await prisma.inventoryItem.delete({ where: { id } });
        const items = await prisma.inventoryItem.findMany({
          where: {
            userId: req.userId,
            productId: existing.productId,
            locationId: existing.locationId,
            unit: existing.unit,
            storeId: existing.storeId || null,
          },
          include: {
            product: { include: { category: true, defaultLocation: true, defaultUnitType: true } },
            location: true,
            store: true,
          },
        });
        return res.json(items);
      }
    }

    return res.status(400).json({ error: 'Unsupported inventory behavior' });

  } catch (err) {
    console.error('Error splitting/opening/removing inventory item:', err);
    res.status(500).json({ error: 'Failed to split/open/remove inventory item' });
  }
});

export default router;