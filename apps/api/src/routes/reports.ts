import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

const reportSchema = z.object({
  targetId: z.string(),
  reason: z.string().min(10).max(500)
});

// Submit a new report
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const validated = reportSchema.parse(req.body);

    // Review abuse protection: Prevent submitting duplicate identical reports within 24 hours
    const recentReport = await prisma.report.findFirst({
      where: {
        reporterId: userId,
        reportedUserId: validated.targetId,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });

    if (recentReport) {
      return res.status(429).json({ error: 'You have already reported this item recently.' });
    }

    const report = await prisma.report.create({
      data: {
        reporterId: userId,
        reportedUserId: validated.targetId,
        reason: validated.reason,
      }
    });

    res.status(201).json({ message: 'Report submitted successfully for moderation review.', reportId: report.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// Admin endpoint: List pending reports
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    
    // In a real implementation, verify that user has 'ADMIN' role
    const adminUser = await prisma.user.findUnique({ where: { id: userId } });
    if (adminUser?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized: Admins only' });
    }

    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

export default router;
