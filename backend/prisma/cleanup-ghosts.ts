
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🧹 Cleaning up "OLD_" ghost subjects...');
  
  const deleted = await prisma.careerSubject.deleteMany({
    where: {
      code: {
        startsWith: 'OLD_'
      }
    }
  });

  console.log(`✅ Deleted ${deleted.count} ghost career subjects.`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
