import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');
  
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const seller1 = await prisma.user.create({
    data: {
      email: 'arjun@pondiuni.edu.in',
      name: 'Arjun',
      passwordHash,
      role: 'SELLER',
      verified: true,
    }
  });

  const buyer1 = await prisma.user.create({
    data: {
      email: 'priya@pondiuni.edu.in',
      name: 'Priya',
      passwordHash,
      role: 'BUYER',
      verified: true,
    }
  });

  const listing1 = await prisma.listing.create({
    data: {
      title: 'Casio FX-991ES Plus',
      description: 'Used for one semester. Good condition.',
      price: 650,
      category: 'Calculators',
      condition: 'Good',
      sellerId: seller1.id,
      imageUrl: 'https://via.placeholder.com/300?text=Calculator'
    }
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
