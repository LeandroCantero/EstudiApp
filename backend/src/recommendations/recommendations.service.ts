import { Injectable } from '@nestjs/common';
import { SubjectStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RecommendationsService {
  constructor(private prisma: PrismaService) {}

  // RN5: Algoritmo de priorización "Camino Lógico"
  async getRecommendations(userId: string) {
    // 1. Obtener materias habilitadas (cumplen RN2)
    const eligibleSubjects = await this.prisma.studentSubject.findMany({
      where: {
        userId,
        status: SubjectStatus.PENDIENTE,
      },
      include: {
        careerSubject: {
          include: {
            subject: true,
            requiredBy: true,
            prerequisites: true,
          },
        },
      },
    });

    const recommendations = [];

    for (const subject of eligibleSubjects) {
      // Verificar si cumple prerequisitos (RN2)
      const canTake = await this.canTakeSubject(userId, subject.careerSubjectId);
      if (!canTake) continue;

      // Calcular puntaje de prioridad
      // Más alta = más materias desbloquea
      const unlocksCount = subject.careerSubject.requiredBy.length;
      
      // Bonus si desbloquea materias de años superiores
      const unlocksHigherYear = await this.checkUnlocksHigherYear(
        subject.careerSubjectId,
        subject.careerSubject.year || 0,
      );

      const priorityScore = unlocksCount + (unlocksHigherYear ? 5 : 0);

      recommendations.push({
        ...subject,
        priorityScore,
        unlocksCount,
        unlocksHigherYear,
      });
    }

    // Ordenar por puntaje (mayor primero)
    return recommendations.sort((a, b) => b.priorityScore - a.priorityScore);
  }

  private async canTakeSubject(userId: string, careerSubjectId: string): Promise<boolean> {
    const careerSubject = await this.prisma.careerSubject.findUnique({
      where: { id: careerSubjectId },
      include: { prerequisites: true },
    });

    if (!careerSubject || careerSubject.prerequisites.length === 0) {
      return true;
    }

    for (const prereq of careerSubject.prerequisites) {
      const studentPrereq = await this.prisma.studentSubject.findFirst({
        where: {
          userId,
          careerSubjectId: prereq.id,
        },
      });

      if (!studentPrereq) return false;

      const validStatuses: SubjectStatus[] = [SubjectStatus.REGULARIZADA, SubjectStatus.PROMOCIONADA];
      if (!validStatuses.includes(studentPrereq.status)) {
        return false;
      }
    }

    return true;
  }

  private async checkUnlocksHigherYear(
    careerSubjectId: string,
    currentYear: number,
  ): Promise<boolean> {
    const careerSubject = await this.prisma.careerSubject.findUnique({
      where: { id: careerSubjectId },
      include: {
        requiredBy: true,
      },
    });

    if (!careerSubject) return false;

    for (const requiredBy of careerSubject.requiredBy) {
      if (requiredBy.year && requiredBy.year > currentYear) {
        return true;
      }
    }

    return false;
  }
}
