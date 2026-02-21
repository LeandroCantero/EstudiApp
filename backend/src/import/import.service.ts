import { Injectable } from '@nestjs/common';
import { SubjectStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ImportService {
  constructor(private prisma: PrismaService) {}

  /**
   * US-07: Importa un plan de estudios completo para un usuario específico.
   * Crea StudentSubject para cada materia de la carrera con estado PENDIENTE.
   */
  async importCareerPlan(userId: string, careerId: string, planData: any) {
    console.log(`🚀 Iniciando importación de carrera ${careerId} para usuario ${userId}`);

    // 1. Limpiar materias previas del usuario si existen
    await this.prisma.studentSubject.deleteMany({
      where: { userId }
    });

    // 2. Obtener todas las CareerSubject de la carrera
    const careerSubjects = await this.prisma.careerSubject.findMany({
      where: { careerId },
    });

    // 3. Crear StudentSubject para cada materia
    const studentSubjects = [];
    for (const cs of careerSubjects) {
      const created = await this.prisma.studentSubject.create({
        data: {
          userId,
          careerSubjectId: cs.id,
          status: SubjectStatus.PENDIENTE,
        },
      });
      studentSubjects.push(created);
    }

    // 4. Actualizar la carrera del usuario
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        userCareers: {
          create: {
            careerId,
          },
        },
      }
    });

    console.log(`✅ Importación finalizada: ${studentSubjects.length} materias asignadas al usuario.`);

    return {
      subjectsCount: studentSubjects.length,
    };
  }
}
