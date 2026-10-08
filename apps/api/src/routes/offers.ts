import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const offerSchema = z.object({
  price: z.number().positive(),
  pickupPoint: z.string().min(1),
  pickupDate: z.string().min(1),
  pickupTime: z.string().min(1),
  message: z.string().max(500).optional()
});

router.get('/offers', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const offers = await prisma.offer.findMany({
      where: { OR: [{ buyerId: userId }, { listing: { sellerId: userId } }] },
      include: {
        buyer: { select: { id: true, name: true, verified: true } },
        listing: { include: { seller: { select: { id: true, name: true, verified: true } } } }
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

router.post('/:id/offers', authenticate, async (req: AuthRequest, res) => {
  try {
    const { price, pickupPoint, pickupDate, pickupTime, message } = offerSchema.parse(req.body);
    const buyerId = req.user!.userId;
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });

    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.availability !== 'AVAILABLE') return res.status(400).json({ error: 'Listing is no longer available' });
    if (listing.sellerId === buyerId) return res.status(400).json({ error: 'Cannot make an offer on your own listing' });

    const offer = await prisma.offer.create({
      data: { price, pickupPoint, pickupDate, pickupTime, message, buyerId, listingId: listing.id }
    });
    res.status(201).json(offer);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(422).json({ error: error.errors });
    res.status(500).json({ error: 'Failed to create offer' });
  }
});

router.patch('/offers/:offerId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { action, price } = z.object({
      action: z.enum(['ACCEPT', 'REJECT', 'COUNTER']),
      price: z.number().positive().optional()
    }).parse(req.body);
    const userId = req.user!.userId;
    const offer = await prisma.offer.findUnique({
      where: { id: req.params.offerId },
      include: { listing: true }
    });

    if (!offer) return res.status(404).json({ error: 'Offer not found' });
    const isSeller = offer.listing.sellerId === userId;
    const isBuyer = offer.buyerId === userId;
    if (!isSeller && !isBuyer) return res.status(403).json({ error: 'Unauthorized' });

    if (action === 'ACCEPT') {
      const canAccept = (isSeller && offer.status === 'PENDING') || (isBuyer && offer.status === 'COUNTERED');
      if (!canAccept) return res.status(400).json({ error: 'This offer cannot be accepted in its current state' });
      if (offer.listing.availability !== 'AVAILABLE') return res.status(400).json({ error: 'Listing is no longer available' });

      const result = await prisma.$transaction(async (tx) => {
        const listingLock = await tx.listing.updateMany({
          where: { id: offer.listingId, availability: 'AVAILABLE' },
          data: { availability: 'RESERVED' }
        });
        if (listingLock.count !== 1) throw new Error('OFFER_CONFLICT');
        const offerLock = await tx.offer.updateMany({
          where: { id: offer.id, status: offer.status },
          data: { status: 'ACCEPTED' }
        });
        if (offerLock.count !== 1) throw new Error('OFFER_CONFLICT');
        const updatedOffer = await tx.offer.findUniqueOrThrow({ where: { id: offer.id } });
        await tx.offer.updateMany({
          where: { listingId: offer.listingId, id: { not: offer.id }, status: { in: ['PENDING', 'COUNTERED'] } },
          data: { status: 'REJECTED' }
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
      if (!price) return res.status(400).json({ error: 'A positive counter price is required' });
      const canCounter = (isSeller && offer.status === 'PENDING') || (isBuyer && offer.status === 'COUNTERED');
      if (!canCounter) return res.status(400).json({ error: 'This offer cannot be countered in its current state' });
      const updatedOffer = await prisma.offer.update({
        where: { id: offer.id },
        data: { status: isSeller ? 'COUNTERED' : 'PENDING', price }
      });
      return res.json(updatedOffer);
    }

    const canReject = (isSeller && ['PENDING', 'COUNTERED'].includes(offer.status)) || (isBuyer && ['PENDING', 'COUNTERED'].includes(offer.status));
    if (!canReject) return res.status(400).json({ error: 'This offer cannot be rejected in its current state' });
    const updatedOffer = await prisma.offer.update({ where: { id: offer.id }, data: { status: 'REJECTED' } });
    return res.json(updatedOffer);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(422).json({ error: error.errors });
    if (error instanceof Error && error.message === 'OFFER_CONFLICT') {
      return res.status(409).json({ error: 'This listing or offer has changed. Refresh and try again.' });
    }
    res.status(500).json({ error: 'Failed to process offer action' });
  }
});

export default router;
