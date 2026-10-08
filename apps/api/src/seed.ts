import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');
  
  await prisma.priceHistory.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.message.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);
  
  const seller1 = await prisma.user.create({
    data: {
      email: 'arjun@pondiuni.ac.in',
      name: 'Arjun M.',
      passwordHash,
      role: 'SELLER',
      verified: true,
    }
  });

  const seller2 = await prisma.user.create({
    data: {
      email: 'sneha@pondiuni.ac.in',
      name: 'Sneha K.',
      passwordHash,
      role: 'SELLER',
      verified: true,
    }
  });

  const buyer1 = await prisma.user.create({
    data: {
      email: 'priya@pondiuni.ac.in',
      name: 'Priya',
      passwordHash,
      role: 'BUYER',
      verified: true,
    }
  });

  await prisma.listing.createMany({
    data: [
      {
        title: 'Casio FX-991ES Plus Calculator',
        description: 'Used for two semesters. Perfect working condition, no scratches on the screen. Must have for engineering students.',
        price: 650,
        category: 'Electronics',
        condition: 'Good',
        sellerId: seller1.id,
        imageUrl: 'https://images.unsplash.com/photo-1574607383077-47ddc2dc51c4?auto=format&fit=crop&q=80&w=800'
      },
      {
        title: 'Hero Sprint Bicycle',
        description: 'Single speed cycle, recently serviced. Tires are in great shape. Great for getting around campus from the hostels.',
        price: 3200,
        category: 'Vehicles',
        condition: 'Fair',
        sellerId: seller1.id,
        imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=800'
      },
      {
        title: 'Pigeon Electric Kettle (1.5L)',
        description: 'Lifesaver for hostel late nights! Works perfectly, boils water in minutes for Maggi or coffee.',
        price: 450,
        category: 'Appliances',
        condition: 'Like New',
        sellerId: seller2.id,
        imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&q=80&w=800'
      },
      {
        title: 'Engineering Drafter + Mini Drafter',
        description: 'Used for Engineering Graphics course in 1st year. Includes the protective cover.',
        price: 250,
        category: 'Stationery',
        condition: 'Good',
        sellerId: seller2.id,
        imageUrl: 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=800'
      },
      {
        title: 'Organic Chemistry by Morrison & Boyd',
        description: '7th Edition. No missing pages, highlighted some important formulas.',
        price: 300,
        category: 'Books',
        condition: 'Fair',
        sellerId: seller1.id,
        imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800'
      },
      {
        title: 'Table Fan (Usha)',
        description: 'Compact table fan, very useful during the summer months in non-AC hostel rooms.',
        price: 850,
        category: 'Appliances',
        condition: 'Good',
        sellerId: seller2.id,
        imageUrl: 'https://images.unsplash.com/photo-1520628282363-2287f3b890a5?auto=format&fit=crop&q=80&w=800'
      }
    ]
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
