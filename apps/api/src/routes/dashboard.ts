import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    // We only provide full dashboard for sellers, buyers get a simplified view
    if (userRole !== 'SELLER') {
       return res.json({ message: 'Dashboard only fully available for sellers. Buyers check orders directly.' });
    }

    const activeListingsCount = await prisma.listing.count({
      where: { sellerId: userId, availability: 'AVAILABLE' }
    });

    const offersReceivedCount = await prisma.offer.count({
      where: { listing: { sellerId: userId }, status: 'PENDING' }
    });

    const completedDealsCount = await prisma.order.count({
      where: { sellerId: userId, status: 'COMPLETED' }
    });
    
    const myActiveListings = await prisma.listing.findMany({
      where: { sellerId: userId, availability: 'AVAILABLE' },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      metrics: {
        activeListings: activeListingsCount,
        offersReceived: offersReceivedCount,
        completedDeals: completedDealsCount
      },
      listings: myActiveListings
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
});

export default router;
