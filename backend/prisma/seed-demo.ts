import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, SubjectStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Creando usuario demo...');

  const career = await prisma.career.findFirst({
    where: { name: { contains: 'Informática', mode: 'insensitive' } },
    include: { subjects: { include: { subject: true } } },
  });

  if (!career) {
    console.error('❌ No se encontró carrera de Informática');
    return;
  }

  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@unahur.edu.ar',
      name: 'Usuario Demo',
      password: hashedPassword,
    },
  });

  console.log(`✅ Usuario creado: ${demoUser.email}`);

  await prisma.userCareer.create({
    data: {
      userId: demoUser.id,
      careerId: career.id,
      approvedCount: 8,
      isActive: true,
    },
  });

  const subjects = career.subjects;
  
  for (let i = 0; i < subjects.length; i++) {
    const cs = subjects[i];
    let status: SubjectStatus = SubjectStatus.PENDIENTE;
    let courseGrade: number | null = null;
    let finalGrade: number | null = null;
    let attemptCount = 1;

    if (i < 8) {
      status = SubjectStatus.PROMOCIONADA;
      courseGrade = 7 + Math.random() * 3;
      finalGrade = i < 4 ? 4 + Math.random() * 4 : null;
    } else if (i < 12) {
      status = SubjectStatus.REGULARIZADA;
      courseGrade = 4 + Math.random() * 3;
    } else if (i < 16) {
      status = SubjectStatus.EN_CURSO;
    } else if (i === 16) {
      status = SubjectStatus.DESAPROBADA;
      courseGrade = 3;
    } else if (i === 17) {
      status = SubjectStatus.RECURSANDO;
      attemptCount = 2;
    }

    const studentSubject = await prisma.studentSubject.create({
      data: {
        userId: demoUser.id,
        careerSubjectId: cs.id,
        status,
        courseGrade,
        finalGrade,
        attemptCount,
      },
    });

    if (status === SubjectStatus.EN_CURSO) {
      await prisma.subjectNote.create({
        data: {
          studentSubjectId: studentSubject.id,
          title: 'Apunte importante',
          content: 'Recordar estudiar los temas del parcial',
          url: 'https://drive.google.com/demo',
        },
      });
    }

    if (status === SubjectStatus.PROMOCIONADA || status === SubjectStatus.REGULARIZADA) {
      await prisma.exam.create({
        data: {
          studentSubjectId: studentSubject.id,
          type: 'parcial1',
          date: new Date('2024-03-15'),
          grade: 6 + Math.random() * 4,
        },
      });
    }
  }

  console.log(`✅ Creadas ${subjects.length} materias para el demo`);

  await prisma.credit.createMany({
    data: [
      {
        userId: demoUser.id,
        category: 'Cursos',
        activity: 'Curso de Python Avanzado',
        credits: 4,
        date: new Date('2024-02-10'),
      },
      {
        userId: demoUser.id,
        category: 'Seminarios',
        activity: 'Seminario de IA Generativa',
        credits: 2,
        date: new Date('2024-03-20'),
      },
    ],
  });

  console.log('✅ Créditos agregados');

  await prisma.event.createMany({
    data: [
      {
        userId: demoUser.id,
        title: 'Parcial de Matemática',
        type: 'parcial',
        date: new Date('2024-06-15'),
        description: 'Primera evaluación parcial',
      },
      {
        userId: demoUser.id,
        title: 'Entrega TP Programación',
        type: 'entrega',
        date: new Date('2024-06-20'),
        description: 'Trabajo práctico grupal',
      },
    ],
  });

  console.log('✅ Eventos agregados');

  await prisma.userResource.create({
    data: {
      userId: demoUser.id,
      category: 'Apuntes',
      title: 'Apuntes Matemática I',
      url: 'https://notion.so/demo',
      description: 'Apuntes del primer cuatrimestre',
    },
  });

  console.log('\n🎉 Seed completado!');
  console.log(`👤 demo@unahur.edu.ar / demo123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
