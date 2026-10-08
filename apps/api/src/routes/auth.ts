import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

const signupSchema = z.object({
  email: z.string().email().regex(/@pondiuni\.ac\.in$/i, 'Must use a Pondicherry University email ending in @pondiuni.ac.in'),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.enum(['BUYER', 'SELLER']).default('BUYER')
});

const loginSchema = z.object({
  email: z.string().email().regex(/@pondiuni\.ac\.in$/i, 'Must use a Pondicherry University email ending in @pondiuni.ac.in'),
  password: z.string()
});

router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, role } = signupSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role,
        verified: true // Auto-verify for this implementation, in prod would use email link
      }
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'local_dev_secret', { expiresIn: '7d' });

    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, verified: user.verified } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'local_dev_secret', { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, verified: user.verified } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
