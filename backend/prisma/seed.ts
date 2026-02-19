/// <reference types="node" />
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

import { CareersImportService } from '../src/careers/careers-import.service';

async function main() {
  console.log('🌱 Starting seed...');

  // Limpiar base de datos
  await prisma.careerSubject.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.career.deleteMany();

  console.log('📚 Creating UNAHUR careers...');

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
    const c = await prisma.career.create({ data: career });
    createdCareers.push(c);
  }

  console.log(`✅ Created ${careers.length} careers`);

  // Importar Planes de Estudio (Templates)
  // Necesitamos instanciar el servicio con un PrismaService real
  // Como `prisma` aquí es un PrismaClient, podemos castearlo o wrappearlo si el servicio lo requiere.
  // Pero CareersImportService pide `PrismaService` en el constructor.
  // PrismaService extiende PrismaClient, por lo que `prisma` debería funcionar si coincide la firma.
  // El problema es que PrismaService tiene `onModuleInit` etc.
  // Para el seed, podemos hacer un mock o usar el prisma client directo si modificamos el servicio
  // O mejor, instanciamos PrismaService (que es un wrapper)

  // Hack: CareersImportService espera PrismaService. 
  // Vamos a asumir que podemos pasarle `prisma` si el tipo es compatible, o creamos un objeto compatible.
  const importService = new CareersImportService(prisma as any);
  await importService.importAllPlans();

  console.log('✅ Seed completed successfully!');
  console.log({ totalCareers: careers.length });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
