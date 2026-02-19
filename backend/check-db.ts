import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const careers = await prisma.career.count();
  const globalSubjects = await prisma.subject.count();
  const careerLinks = await prisma.careerSubject.count();
  
  const topSubjects = await prisma.subject.findMany({
    include: { _count: { select: { careers: true } } },
    orderBy: { careers: { _count: 'desc' } },
    take: 5
  });

  console.log({ 
    careers, 
    globalSubjects, 
    careerLinks,
    topShared: topSubjects.map(s => `${s.name} (${s._count.careers} carreras)`)
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
