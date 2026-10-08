import { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const listingSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(2000),
  price: z.number().positive(),
  category: z.string().min(1).max(50),
  condition: z.string().min(1).max(30),
  imageUrl: z.string().max(900_000).optional(),
  hostel: z.string().max(80).optional()
});

router.get('/', async (req, res) => {
  try {
    const query = z.object({
      search: z.string().optional(),
      category: z.string().optional(),
      condition: z.string().optional(),
      availability: z.enum(['AVAILABLE', 'RESERVED', 'SOLD']).optional(),
      sort: z.enum(['price_asc', 'price_desc']).optional(),
      minPrice: z.coerce.number().min(0).optional(),
      maxPrice: z.coerce.number().min(0).optional(),
      hostel: z.string().optional(),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(12)
    }).safeParse(req.query);
    if (!query.success) return res.status(400).json({ error: query.error.errors });
    const { search, category, condition, availability, sort, minPrice, maxPrice, hostel, page, limit } = query.data;
    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      return res.status(400).json({ error: 'Minimum price cannot exceed maximum price' });
    }

    const where: Prisma.ListingWhereInput = {};
    if (search) where.OR = [{ title: { contains: search } }, { description: { contains: search } }];
    if (category) where.category = category;
    if (condition) where.condition = condition;
    if (availability) where.availability = availability;
    if (hostel) where.hostel = { contains: hostel };
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {
        ...(minPrice !== undefined ? { gte: minPrice } : {}),
        ...(maxPrice !== undefined ? { lte: maxPrice } : {})
      };
    }

    const orderBy = sort === 'price_asc' ? { price: 'asc' as const } : sort === 'price_desc' ? { price: 'desc' as const } : { createdAt: 'desc' as const };
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: { seller: { select: { id: true, name: true, verified: true } } },
        orderBy,
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.listing.count({ where })
    ]);

    res.json({ data: listings, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

router.get('/:id/offers', authenticate, async (req: AuthRequest, res) => {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id }, select: { id: true, sellerId: true } });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    const userId = req.user!.userId;
    const participant = listing.sellerId === userId || (await prisma.offer.count({ where: { listingId: listing.id, buyerId: userId } })) > 0;
    if (!participant) return res.status(403).json({ error: "Only this listing's seller or offer participants can view offers" });

    const offers = await prisma.offer.findMany({
      where: { listingId: listing.id },
      include: { buyer: { select: { id: true, name: true, verified: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch listing offers' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
      include: {
        seller: { select: { id: true, name: true, verified: true } },
        priceHistory: { orderBy: { createdAt: 'desc' } }
      }
    });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json(listing);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const data = listingSchema.parse(req.body);
    const sellerId = req.user!.userId;
    const listing = await prisma.$transaction(async (tx) => {
      const created = await tx.listing.create({ data: { ...data, sellerId } });
      await tx.priceHistory.create({ data: { price: data.price, listingId: created.id } });
      return created;
    });
    res.status(201).json(listing);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(422).json({ error: error.errors });
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

export default router;
