import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Limpiar base de datos
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();

  // Crear usuario de prueba
  const user = await prisma.user.create({
    data: {
      email: 'admin@cursapp.com',
      name: 'Admin User',
      career: 'Licenciatura en Informática',
      subjects: {
        create: [
          {
            code: 'I101',
            name: 'Introducción a la Programación',
            credits: 8,
            status: 'APROBADA',
            grade: 9,
          },
          {
            code: 'M101',
            name: 'Matemática I',
            credits: 6,
            status: 'CURSANDO',
          },
        ],
      },
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log({ user });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
