import express from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middleware/auth.js';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  res.json(user);
});

// PATCH /me/email -- change user email
router.patch('/email', authMiddleware, async (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Invalid email' });
  }
  // simple email regex (enough for most)
  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  // check for existing
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.id !== req.userId) {
    return res.status(409).json({ error: 'Email already in use' });
  }
  const user = await prisma.user.update({
    where: { id: req.userId },
    data: { email },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  res.json({ success: true, user });
});

// POST /me/password -- change password
router.post('/password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Missing passwords' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password too short (min 8 chars)' });
  }
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return res.status(403).json({ error: 'Incorrect current password' });

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: req.userId },
    data: { password: hashed },
  });
  res.json({ success: true });
});

export default router;