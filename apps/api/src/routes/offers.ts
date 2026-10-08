import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const offerSchema = z.object({
  price: z.number().min(0),
  pickupPoint: z.string().min(1),
  pickupDate: z.string().min(1),
  pickupTime: z.string().min(1),
});

// Create an offer on a listing
router.post('/:id/offers', authenticate, async (req: AuthRequest, res) => {
  try {
    const { price, pickupPoint, pickupDate, pickupTime } = offerSchema.parse(req.body);
    const buyerId = req.user!.userId;
    const listingId = req.params.id;

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.availability !== 'AVAILABLE') return res.status(400).json({ error: 'Listing is no longer available' });
    if (listing.sellerId === buyerId) return res.status(400).json({ error: 'Cannot make an offer on your own listing' });

    const offer = await prisma.offer.create({
      data: {
        price,
        pickupPoint,
        pickupDate,
        pickupTime,
        buyerId,
        listingId
      }
    });

    res.status(201).json(offer);
  } catch (error) {
    res.status(400).json({ error: 'Invalid offer data' });
  }
});

// Accept or Counter an offer
router.patch('/offers/:offerId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { action, price } = z.object({
      action: z.enum(['ACCEPT', 'REJECT', 'COUNTER']),
      price: z.number().optional()
    }).parse(req.body);
    
    const userId = req.user!.userId;
    const offerId = req.params.offerId;

    const offer = await prisma.offer.findUnique({ 
      where: { id: offerId },
      include: { listing: true }
    });

    if (!offer) return res.status(404).json({ error: 'Offer not found' });

    // State machine logic
    if (action === 'ACCEPT') {
      if (offer.listing.sellerId !== userId && offer.buyerId !== userId) {
         return res.status(403).json({ error: 'Unauthorized' });
      }

      // Start transaction to lock price and create order
      const result = await prisma.$transaction(async (tx) => {
        const updatedOffer = await tx.offer.update({
          where: { id: offer.id },
          data: { status: 'ACCEPTED' }
        });

        await tx.listing.update({
          where: { id: offer.listingId },
          data: { availability: 'RESERVED' }
        });

        const order = await tx.order.create({
          data: {
            price: offer.price,
            pickupPoint: offer.pickupPoint,
            pickupDate: offer.pickupDate,
            pickupTime: offer.pickupTime,
            buyerId: offer.buyerId,
            sellerId: offer.listing.sellerId,
            listingId: offer.listingId,
            status: 'PENDING'
          }
        });

        return { order, offer: updatedOffer };
      });

      return res.json(result);
    }

    if (action === 'COUNTER') {
      if (!price) return res.status(400).json({ error: 'Price required for counter' });
      
      const updatedOffer = await prisma.offer.update({
        where: { id: offer.id },
        data: { status: 'COUNTERED', price }
      });
      return res.json(updatedOffer);
    }

    if (action === 'REJECT') {
      const updatedOffer = await prisma.offer.update({
        where: { id: offer.id },
        data: { status: 'REJECTED' }
      });
      return res.json(updatedOffer);
    }

  } catch (error) {
    res.status(400).json({ error: 'Failed to process offer action' });
  }
});

export default router;
