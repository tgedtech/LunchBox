// /api/src/routes/auth.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });
    res.json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({ error: 'Email already in use' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({
    where: { email: String(email).trim().toLowerCase() }
  });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
  res.json({ token });
});

// DEV-ONLY password reset with a fixed code
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    // Basic validation
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'email, code, and newPassword are required' });
    }

    // Use env var if set; fallback to hardcoded "123456" for local dev
    const expectedCode = process.env.LOCAL_RESET_CODE || '123456';
    if (String(code).trim() !== expectedCode) {
      // Do NOT leak which field is wrong
      return res.status(400).json({ error: 'Invalid reset code' });
    }

    // Find user (don’t reveal existence in prod; ok for local)
    const user = await prisma.user.findUnique({ where: { email: String(email).trim().toLowerCase() } });
    if (!user) {
      // For local you can reveal this, or return 200 to keep it generic:
      return res.status(404).json({ error: 'User not found' });
      // return res.json({ message: 'If the account exists, the password was reset.' });
    }

    // Minimal password policy (adjust as needed)
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    return res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('reset-password error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;