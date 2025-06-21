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
  const { name, favorite } = req.body;
  try {
    // Uniqueness check
    const exists = await prisma.store.findUnique({ where: { name } });
    if (exists) {
      return res.status(400).json({ error: 'Store name must be unique.' });
    }
    const store = await prisma.store.create({
      data: { name, favorite: !!favorite },
    });
    res.status(201).json(store);
  } catch (err) {
    console.error('Error creating store:', err);
    res.status(500).json({ error: 'Failed to create store' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, favorite } = req.body;
  try {
    // Uniqueness check
    if (name) {
      const exists = await prisma.store.findFirst({
        where: { name, NOT: { id } },
      });
      if (exists) {
        return res.status(400).json({ error: 'Store name must be unique.' });
      }
    }
    const store = await prisma.store.update({
      where: { id },
      data: { ...(name && { name }), ...(favorite !== undefined && { favorite }) },
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
    await prisma.store.delete({ where: { id } });
    res.json({ message: 'Store deleted' });
  } catch (err) {
    console.error('Error deleting store:', err);
    res.status(500).json({ error: 'Failed to delete store' });
  }
});

// ----------- REASSIGN-AND-DELETE -----------
router.post('/:id/reassign-and-delete', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { reassignToStoreId } = req.body;
  if (!reassignToStoreId) {
    return res.status(400).json({ error: 'Missing reassignment store.' });
  }
  try {
    // Reassign in InventoryItems
    await prisma.inventoryItem.updateMany({
      where: { storeId: id },
      data: { storeId: reassignToStoreId }
    });
    // Reassign in ShoppingListItems
    await prisma.shoppingListItem.updateMany({
      where: { storeId: id },
      data: { storeId: reassignToStoreId }
    });
    await prisma.store.delete({ where: { id } });
    res.json({ message: 'Store reassigned and deleted.' });
  } catch (err) {
    console.error('Error reassigning/deleting store:', err);
    res.status(500).json({ error: 'Failed to reassign and delete store.' });
  }
});

export default router;