import express from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

function parseBool(val) {
  if (typeof val === 'string') return val === 'true';
  return !!val;
}

/**
 * GET /inventory
 * Returns all inventory items for the current user.
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
 * Create or increment an inventory item (unopened only).
 */
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

/**
 * PUT /inventory/:id
 * Update an inventory item.
 */
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    defaultQuantity,
    defaultUnit,
    categoryId,
    defaultLocationId,
    defaultUnitTypeId,
    inventoryBehavior,
  } = req.body;

  try {
    const data = {
      name,
      description,
      defaultQuantity,
      defaultUnit,
      category: categoryId
        ? { connect: { id: categoryId } }
        : { disconnect: true },
      defaultLocation: defaultLocationId
        ? { connect: { id: defaultLocationId } }
        : { disconnect: true },
      defaultUnitType: defaultUnitTypeId
        ? { connect: { id: defaultUnitTypeId } }
        : { disconnect: true },
      ...(inventoryBehavior && { inventoryBehavior: Number(inventoryBehavior) }),
    };

    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        defaultLocation: true,
        defaultUnitType: true,
      },
    });
    res.json(product);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

/**
 * DELETE /inventory/:id
 * Remove an inventory item.
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
 * Category 1, 2, 3 (open/use an item, or for Cat2/3: remove opened)
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

    // CATEGORY 1 (Remove from Inventory Once Open)
    if (inventoryBehavior === 1) {
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

    // CATEGORY 2 & 3 (Keeps for a Long Time Once Open or Goes Bad Once Open)
    if (inventoryBehavior === 2 || inventoryBehavior === 3) {
      if (!existing.opened) {
        // Only one opened at a time
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

        // For Cat 3, expiration is always tracked
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
        // Remove/Finish the open unit
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

    // Fallback for unsupported types
    return res.status(400).json({ error: 'Unsupported inventory behavior' });

  } catch (err) {
    console.error('Error splitting/opening/removing inventory item:', err);
    res.status(500).json({ error: 'Failed to split/open/remove inventory item' });
  }
});

export default router;