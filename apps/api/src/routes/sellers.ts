import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get public seller profile
router.get('/:id', async (req, res) => {
  try {
    const sellerId = req.params.id;

    const seller = await prisma.user.findUnique({
      where: { id: sellerId, role: 'SELLER' },
      select: {
        id: true,
        name: true,
        verified: true,
        createdAt: true,
        listings: {
          where: { availability: 'AVAILABLE' },
          orderBy: { createdAt: 'desc' }
        },
        ordersSold: {
          where: { status: 'COMPLETED' },
          select: {
            id: true,
            review: { select: { rating: true, comment: true } }
          }
        }
      }
    });

    if (!seller) return res.status(404).json({ error: 'Seller not found' });

    // Calculate rating
    const reviews = seller.ordersSold.map(o => o.review).filter(Boolean) as {rating: number, comment: string|null}[];
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : null;

    res.json({
      id: seller.id,
      name: seller.name,
      verified: seller.verified,
      joinedAt: seller.createdAt,
      listings: seller.listings,
      stats: {
        completedDeals: seller.ordersSold.length,
        averageRating,
        reviewCount: reviews.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch seller profile' });
  }
});

export default router;
