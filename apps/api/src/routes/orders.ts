import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Get all orders for the current user
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { sellerId: userId }
        ]
      },
      include: {
        listing: true,
        buyer: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true } },
        review: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Mark order as completed
router.post('/:id/complete', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const orderId = req.params.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.buyerId !== userId && order.sellerId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'COMPLETED' }
    });

    // Update listing to sold
    await prisma.listing.update({
      where: { id: order.listingId },
      data: { availability: 'SOLD' }
    });

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete order' });
  }
});

// Create a review
const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional()
});

router.post('/:id/review', authenticate, async (req: AuthRequest, res) => {
  try {
    const { rating, comment } = reviewSchema.parse(req.body);
    const userId = req.user!.userId;
    const orderId = req.params.id;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'COMPLETED') return res.status(400).json({ error: 'Order must be completed to leave a review' });
    if (order.buyerId !== userId) return res.status(403).json({ error: 'Only the buyer can leave a review' });

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        authorId: userId,
        orderId: order.id
      }
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ error: 'Failed to submit review' });
  }
});

export default router;
