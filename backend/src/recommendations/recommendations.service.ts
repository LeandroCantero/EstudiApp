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

      // 1. Calcular impacto profundo (Transitive Unlocks)
      const transitiveImpact = await this.calculateTransitiveImpact(subject.careerSubjectId);
      
      // 2. Estacionalidad (Priorizar si el periodo coincide con el cuatrimestre actual)
      const currentMonth = new Date().getMonth(); // 0-11
      const currentSemester = currentMonth < 7 ? 1 : 2; // Mar-Jul = 1, Ago-Dic = 2
      const matchesSeason = subject.careerSubject.period === currentSemester;

      // 3. Balance de carga (Sugerimos las horas para que el usuario pueda elegir)
      const hours = subject.careerSubject.subject.hours;

      // Cálculo de puntaje final
      const priorityScore = (transitiveImpact * 2) + (matchesSeason ? 10 : 0);

      recommendations.push({
        ...subject,
        priorityScore,
        transitiveImpact,
        matchesSeason,
        hours,
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

      const validStatuses: SubjectStatus[] = [SubjectStatus.PROMOCIONADA];
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

  // RN5 Helper: Cuenta cuántas materias en TOTAL desbloquea esta materia en el árbol futuro
  private async calculateTransitiveImpact(careerSubjectId: string): Promise<number> {
    const visited = new Set<string>();
    
    const countUnlocks = async (id: string): Promise<number> => {
      const subject = await this.prisma.careerSubject.findUnique({
        where: { id },
        include: { requiredBy: true },
      });

      if (!subject || subject.requiredBy.length === 0) return 0;

      let count = 0;
      for (const next of subject.requiredBy) {
        if (!visited.has(next.id)) {
          visited.add(next.id);
          count += 1 + await countUnlocks(next.id);
        }
      }
      return count;
    };

    return countUnlocks(careerSubjectId);
  }
}
