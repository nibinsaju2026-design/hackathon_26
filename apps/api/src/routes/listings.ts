import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const listingSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  category: z.string(),
  condition: z.string(),
  imageUrl: z.string().optional()
});

router.get('/', async (req, res) => {
  try {
    const { search, category, condition, availability, sort, page = '1', limit = '12' } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    let whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { title: { contains: search as string } },
        { description: { contains: search as string } }
      ];
    }
    if (category) whereClause.category = category as string;
    if (condition) whereClause.condition = condition as string;
    if (availability) whereClause.availability = availability as string;

    let orderByClause: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderByClause = { price: 'asc' };
    if (sort === 'price_desc') orderByClause = { price: 'desc' };

    const listings = await prisma.listing.findMany({
      where: whereClause,
      include: {
        seller: { select: { id: true, name: true, verified: true } }
      },
      orderBy: orderByClause,
      skip,
      take: limitNum
    });

    const totalCount = await prisma.listing.count({ where: whereClause });

    res.json({
      data: listings,
      meta: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch listings' });
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

// Create a new listing
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const data = listingSchema.parse(req.body);
    const sellerId = req.user!.userId;

    const listing = await prisma.listing.create({
      data: {
        ...data,
        sellerId
      }
    });

    await prisma.priceHistory.create({
      data: {
        price: data.price,
        listingId: listing.id
      }
    });

    res.status(201).json(listing);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

export default router;
