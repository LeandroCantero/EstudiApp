import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const careers = await prisma.career.findMany({
    include: {
      subjects: {
        include: {
          prerequisites: true,
          subject: true
        },
      },
    },
  });

  console.log('--- AUDITORÍA DE CORRELATIVAS ---');
  for (const career of careers) {
    const activeSubjects = career.subjects.filter(s => s.year !== null && !s.code.startsWith('OLD_'));
    const withoutCorrelatives = activeSubjects.filter(
      (s) => s.prerequisites.length === 0
    );
    console.log(`${career.name}: Sin correlativas: ${withoutCorrelatives.length} (Total materias: ${activeSubjects.length})`);
    
    if (withoutCorrelatives.length > 8) {
      console.log('   -> Materias sin correlativas:');
      withoutCorrelatives.forEach(s => {
        console.log(`      [Año ${s.year}] ${s.subject.name} (${s.code})`);
      });
    }
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
