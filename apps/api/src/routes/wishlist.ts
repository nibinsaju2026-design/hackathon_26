import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get wishlist
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    
    const wishlist = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        listing: {
          include: { seller: { select: { id: true, name: true, verified: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// Add to wishlist
router.post('/:listingId', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const listingId = req.params.listingId;

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId,
        listingId
      }
    });

    res.status(201).json(wishlistItem);
  } catch (error) {
    res.status(400).json({ error: 'Failed to add to wishlist, or already exists' });
  }
});

// Remove from wishlist
router.delete('/:listingId', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const listingId = req.params.listingId;

    await prisma.wishlist.deleteMany({
      where: {
        userId,
        listingId
      }
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

export default router;
