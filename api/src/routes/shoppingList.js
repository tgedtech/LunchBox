import express from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

/**
 * GET /shopping-list
 * Returns all shopping list items for the current user, including joined product, category, and store info.
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const items = await prisma.shoppingListItem.findMany({
      where: { userId: req.userId },
      include: {
        product: {
          include: { category: true }
        },
        store: true,
      },
      orderBy: { name: 'asc' }
    });
    res.json(items);
  } catch (err) {
    console.error('Error fetching shopping list:', err);
    res.status(500).json({ error: 'Failed to fetch shopping list' });
  }
});

/**
 * POST /shopping-list
 * Add a new item to the shopping list.
 * If a productId is provided and an item with that product already exists, increment quantity.
 * If ad-hoc (no productId), merge by name/user if present.
 * categoryId is always the field to set for category linkage.
 */
router.post('/', authMiddleware, async (req, res) => {
  const { productId, name, quantity = 1, categoryId, notes, storeId, unit } = req.body;
  try {
    let item;
    if (productId) {
      // Merge/Increment if existing product entry
      const existing = await prisma.shoppingListItem.findFirst({
        where: { userId: req.userId, productId },
      });
      if (existing) {
        item = await prisma.shoppingListItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + Number(quantity) },
          include: { product: { include: { category: true } }, store: true }
        });
        return res.status(200).json(item);
      }
    } else {
      // Merge by name for ad hoc item
      const where = {
        userId: req.userId,
        name: name.trim(),
        productId: null,
      };
      const existing = await prisma.shoppingListItem.findFirst({ where });
      if (existing) {
        item = await prisma.shoppingListItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + Number(quantity) },
          include: { product: { include: { category: true } }, store: true }
        });
        return res.status(200).json(item);
      }
    }
    // Create new
    item = await prisma.shoppingListItem.create({
      data: {
        userId: req.userId,
        productId: productId || null,
        name: name ? name.trim() : null,
        quantity: Number(quantity),
        categoryId: categoryId || null,
        notes: notes || null,
        storeId: storeId || null,
        unit: unit || null,
      },
      include: {
        product: { include: { category: true } },
        store: true,
      },
    });
    res.status(201).json(item);
  } catch (err) {
    console.error('Error adding shopping list item:', err);
    res.status(500).json({ error: 'Failed to add shopping list item' });
  }
});

/**
 * PUT /shopping-list/:id
 * Update a shopping list item. Only allows updatable fields.
 */
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { quantity, name, categoryId, notes, storeId, unit } = req.body;
  try {
    const item = await prisma.shoppingListItem.update({
      where: { id },
      data: {
        ...(quantity !== undefined && { quantity: Number(quantity) }),
        ...(name && { name: name.trim() }),
        ...(categoryId && { categoryId }),
        ...(notes && { notes }),
        ...(storeId && { storeId }),
        ...(unit && { unit }),
      },
      include: {
        product: { include: { category: true } },
        store: true,
      },
    });
    res.json(item);
  } catch (err) {
    console.error('Error updating shopping list item:', err);
    res.status(500).json({ error: 'Failed to update shopping list item' });
  }
});

/**
 * DELETE /shopping-list/:id
 * Remove a shopping list item.
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.shoppingListItem.delete({ where: { id } });
    res.json({ message: 'Shopping list item deleted' });
  } catch (err) {
    console.error('Error deleting shopping list item:', err);
    res.status(500).json({ error: 'Failed to delete shopping list item' });
  }
});

/**
 * POST /shopping-list/bulk-delete
 * Remove multiple items by IDs.
 */
router.post('/bulk-delete', authMiddleware, async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || !ids.length) {
    return res.status(400).json({ error: 'No IDs provided' });
  }
  try {
    await prisma.shoppingListItem.deleteMany({
      where: { id: { in: ids }, userId: req.userId },
    });
    res.json({ message: 'Shopping list items deleted' });
  } catch (err) {
    console.error('Error bulk deleting shopping list items:', err);
    res.status(500).json({ error: 'Failed to bulk delete' });
  }
});

export default router;