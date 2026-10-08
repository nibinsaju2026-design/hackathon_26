import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const [listings, offersReceived, offersSent, orders, activeListings, completedDeals] = await Promise.all([
      prisma.listing.findMany({
        where: { sellerId: userId },
        include: { seller: { select: { id: true, name: true, verified: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.offer.findMany({
        where: { listing: { sellerId: userId } },
        include: {
          buyer: { select: { id: true, name: true, verified: true } },
          listing: { include: { seller: { select: { id: true, name: true, verified: true } } } }
        },
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.offer.findMany({
        where: { buyerId: userId },
        include: {
          buyer: { select: { id: true, name: true, verified: true } },
          listing: { include: { seller: { select: { id: true, name: true, verified: true } } } }
        },
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.order.findMany({
        where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
        include: {
          listing: true,
          buyer: { select: { id: true, name: true } },
          seller: { select: { id: true, name: true } },
          review: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.listing.count({ where: { sellerId: userId, availability: 'AVAILABLE' } }),
      prisma.order.count({ where: { OR: [{ buyerId: userId }, { sellerId: userId }], status: 'COMPLETED' } })
    ]);

    res.json({
      metrics: {
        activeListings,
        offersReceived: offersReceived.filter((offer) => offer.status === 'PENDING').length,
        completedDeals
      },
      listings,
      offersReceived,
      offersSent,
      orders
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;
