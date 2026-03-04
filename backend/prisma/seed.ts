/// <reference types="node" />
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, SubjectStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

import { CareersImportService } from '../src/careers/careers-import.service';

async function main() {
  console.log('🌱 Starting seed...');
  console.log('📚 Syncing UNAHUR careers...');

  // Instituto de Biotecnología
  const careers = [
    { name: 'Ingeniería Agronómica', institute: 'Biotecnología', duration: 5 },
    { name: 'Licenciatura en Desarrollo Agrario', institute: 'Biotecnología', duration: 4 },
    { name: 'Tec. Univ. en Producción Agroecológica Periurbana', institute: 'Biotecnología', duration: 2.5 },
    { name: 'Tec. Univ. en Viverismo', institute: 'Biotecnología', duration: 2.5 },
    { name: 'Licenciatura en Biotecnología', institute: 'Biotecnología', duration: 4.5 },
    { name: 'Tec. Univ. en Laboratorios', institute: 'Biotecnología', duration: 2.5 },
    { name: 'Licenciatura en Tecnología de los Alimentos', institute: 'Biotecnología', duration: 5 },
    { name: 'Tec. Univ. en Tecnología de los Alimentos', institute: 'Biotecnología', duration: 2.5 },
    { name: 'Licenciatura en Gestión Ambiental', institute: 'Biotecnología', duration: 4 },
    { name: 'Tec. Univ. en Ciencias del Ambiente', institute: 'Biotecnología', duration: 2.5 },

    // Instituto de Tecnología e Ingeniería
    { name: 'Licenciatura en Informática', institute: 'Tecnología e Ingeniería', duration: 5 },
    { name: 'Tec. Univ. en Programación', institute: 'Tecnología e Ingeniería', duration: 2.5 },
    { name: 'Tec. Univ. en Redes y Operaciones Informáticas', institute: 'Tecnología e Ingeniería', duration: 2.5 },
    { name: 'Tec. Univ. en Inteligencia Artificial', institute: 'Tecnología e Ingeniería', duration: 2.5 },
    { name: 'Tec. Univ. en Programación de Videojuegos', institute: 'Tecnología e Ingeniería', duration: 2.5 },
    { name: 'Ingeniería en Energía Eléctrica', institute: 'Tecnología e Ingeniería', duration: 5 },
    { name: 'Tec. Univ. en Energía Eléctrica', institute: 'Tecnología e Ingeniería', duration: 2.5 },
    { name: 'Tec. Univ. en Electromovilidad', institute: 'Tecnología e Ingeniería', duration: 2.5 },
    { name: 'Ingeniería Metalúrgica', institute: 'Tecnología e Ingeniería', duration: 5 },
    { name: 'Tec. Univ. en Metalurgia', institute: 'Tecnología e Ingeniería', duration: 2.5 },
    { name: 'Licenciatura en Gestión del Mantenimiento', institute: 'Tecnología e Ingeniería', duration: 4 },
    { name: 'Tec. Univ. en Mantenimiento Industrial', institute: 'Tecnología e Ingeniería', duration: 2.5 },
    { name: 'Tec. Univ. en Mantenimiento Hospitalario', institute: 'Tecnología e Ingeniería', duration: 2.5 },
    { name: 'Licenciatura en Diseño Industrial', institute: 'Tecnología e Ingeniería', duration: 4 },
    { name: 'Tec. Univ. en Diseño Industrial', institute: 'Tecnología e Ingeniería', duration: 2.5 },

    // Instituto de Salud Comunitaria
    { name: 'Licenciatura en Kinesiología y Fisiatría', institute: 'Salud Comunitaria', duration: 4 },
    { name: 'Tec. Univ. en Salud Comunitaria (Kinesiología)', institute: 'Salud Comunitaria', duration: 2.5 },
    { name: 'Licenciatura en Obstetricia', institute: 'Salud Comunitaria', duration: 4 },
    { name: 'Tec. Univ. en Salud Comunitaria (Obstetricia)', institute: 'Salud Comunitaria', duration: 2.5 },
    { name: 'Licenciatura en Enfermería', institute: 'Salud Comunitaria', duration: 5 },
    { name: 'Enfermería Universitaria', institute: 'Salud Comunitaria', duration: 3 },
    { name: 'Licenciatura en Nutrición', institute: 'Salud Comunitaria', duration: 5 },
    { name: 'Tec. Univ. en Salud Comunitaria (Nutrición)', institute:'Salud Comunitaria', duration: 2.5 },

    // Instituto de Educación
    { name: 'Licenciatura en Educación', institute: 'Educación', duration: 2 },
    { name: 'Profesorado Universitario de Biología', institute: 'Educación', duration: 4 },
    { name: 'Tec. Univ. en prácticas socioeducativas de Biología', institute: 'Educación', duration: 2 },
    { name: 'Profesorado Universitario en Educación Física', institute: 'Educación', duration: 4 },
    { name: 'Tec. Univ. en prácticas socioeducativas en Educación Física', institute: 'Educación', duration: 2 },
    { name: 'Profesorado Universitario de Geografía', institute: 'Educación', duration: 4 },
    { name: 'Tec. Univ. en prácticas socioeducativas de Geografía', institute: 'Educación', duration: 2 },
    { name: 'Profesorado Universitario de Inglés', institute: 'Educación', duration: 4 },
    { name: 'Tec. Univ. en prácticas socioeducativas del idioma Inglés', institute: 'Educación', duration: 2 },
    { name: 'Profesorado Universitario de Letras', institute: 'Educación', duration: 4 },
    { name: 'Tec. Univ. en prácticas socioeducativas de Escritura y Lectura', institute: 'Educación', duration: 2 },
    { name: 'Profesorado Universitario de Matemática', institute: 'Educación', duration: 4 },
    { name: 'Tec. Univ. en prácticas socioeducativas en Matemática', institute: 'Educación', duration: 2 },
  ];

  const createdCareers = [];
  for (const career of careers) {
    const c = await prisma.career.upsert({
      where: { name: career.name },
      update: { institute: career.institute, duration: career.duration },
      create: career,
    });
    createdCareers.push(c);
  }

  console.log(`✅ Created ${careers.length} careers`);

  // Importar Planes de Estudio (Templates)
  const importService = new CareersImportService(prisma as any);
  await importService.importAllPlans();

  console.log('✅ Seed completed successfully!');
  console.log({ totalCareers: careers.length });

  // --- REALISTIC STUDENT SEED ---
  console.log('👤 Creating realistic student profile...');
  
  const testEmail = 'test@test.com';
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: testEmail },
    update: {},
    create: {
      email: testEmail,
      password: hashedPassword,
      name: 'Estudiante de Prueba',
    },
  });

  const programmingCareer = await prisma.career.findFirst({
    where: { name: 'Tec. Univ. en Programación' },
  });

  if (programmingCareer) {
    await prisma.userCareer.upsert({
      where: { userId_careerId: { userId: user.id, careerId: programmingCareer.id } },
      update: {},
      create: {
        userId: user.id,
        careerId: programmingCareer.id,
      },
    });

    const careerSubjects = await prisma.careerSubject.findMany({
      where: { careerId: programmingCareer.id },
      include: { subject: true },
    });

    // Realistic state:
    // 3 Promocionadas (1st Year, 1st Cuat)
    // 1 Regularizada con Final (1st Year, 1st Cuat)
    // 3 En Curso (1st Year, 2nd Cuat)

    const statusMap: Record<string, { status: SubjectStatus, grade?: number, finalGrade?: number, year: number, period: number }> = {
      '1': { status: SubjectStatus.PROMOCIONADA, grade: 9, year: 2025, period: 1 }, // Matemática I
      '2': { status: SubjectStatus.PROMOCIONADA, grade: 8, year: 2025, period: 1 }, // Introducción a lógica...
      '3': { status: SubjectStatus.PROMOCIONADA, grade: 10, year: 2025, period: 1 }, // Organización de compu I
      '4': { status: SubjectStatus.PROMOCIONADA, finalGrade: 7, year: 2025, period: 1 }, // Nuevos entornos (User said 1 reg + final approved)
      '6': { status: SubjectStatus.EN_CURSO, year: 2025, period: 2 }, // Programación estructurada
      '7': { status: SubjectStatus.EN_CURSO, year: 2025, period: 2 }, // Matemática II
      '8': { status: SubjectStatus.EN_CURSO, year: 2025, period: 2 }, // Inglés I
    };

    // Note: The user said "1 regularizada con final aprobado". 
    // In our system, regularized + final approved = PROMOCIONADA but with finalGrade.
    // I'll adjust the mapping: 1, 2, 3 as PROMOCIONADA (direct), 4 as PROMOCIONADA (via final).

    for (const cs of careerSubjects) {
      const config = statusMap[cs.code];
      if (config) {
        await prisma.studentSubject.upsert({
          where: { userId_careerSubjectId: { userId: user.id, careerSubjectId: cs.id } },
          update: {
            status: config.status,
            courseGrade: config.grade,
            finalGrade: config.finalGrade,
            completionYear: config.year,
            completionPeriod: config.period,
          },
          create: {
            userId: user.id,
            careerSubjectId: cs.id,
            status: config.status,
            courseGrade: config.grade,
            finalGrade: config.finalGrade,
            completionYear: config.year,
            completionPeriod: config.period,
          },
        });
      } else {
        // Ensure others are PENDIENTE
        await prisma.studentSubject.upsert({
          where: { userId_careerSubjectId: { userId: user.id, careerSubjectId: cs.id } },
          update: { status: SubjectStatus.PENDIENTE },
          create: {
            userId: user.id,
            careerSubjectId: cs.id,
            status: SubjectStatus.PENDIENTE,
          },
        });
      }
    }
  }

  console.log('✅ Realistic student seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
