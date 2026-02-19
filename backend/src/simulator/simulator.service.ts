import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SubjectStatus } from '../prisma-client.mock';
import { UsersService } from '../users/users.service';

interface SimulateChange {
  subjectId: string;
  newStatus: SubjectStatus;
}

@Injectable()
export class SimulatorService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  // RN7: Simulador temporal sin persistir cambios
  async simulate(
    userId: string,
    changes: SimulateChange[],
  ) {
    // 1. Obtener estado actual
    const currentSubjects = await this.prisma.studentSubject.findMany({
      where: { userId },
      include: {
        careerSubject: true,
      },
    });

    // 2. Aplicar cambios temporalmente (en memoria)
    const simulatedSubjects = currentSubjects.map((subject: any) => {
      const change = changes.find((c) => c.subjectId === subject.id);
      if (change) {
        return {
          ...subject,
          status: change.newStatus,
        };
      }
      return subject;
    });

    // 3. Calcular métricas simuladas
    const totalSubjects = simulatedSubjects.length;
    const approvedSubjects = simulatedSubjects.filter(
      (s: any) => s.status === SubjectStatus.PROMOCIONADA,
    ).length;
    const regularizedSubjects = simulatedSubjects.filter(
      (s: any) => s.status === SubjectStatus.REGULARIZADA,
    ).length;

    // % de avance simulado
    const simulatedProgress =
      ((approvedSubjects + regularizedSubjects * 0.5) / totalSubjects) * 100;

    // 4. Contar materias desbloqueadas
    const newlyUnlocked = await this.calculateNewlyUnlocked(
      userId,
      currentSubjects,
      simulatedSubjects,
    );

    // 5. Proyección de graduación simulada
    const remainingQuarters = Math.ceil(
      (totalSubjects - approvedSubjects - regularizedSubjects) / 3,
    );
    const simulatedGraduationDate = new Date();
    simulatedGraduationDate.setMonth(
      simulatedGraduationDate.getMonth() + remainingQuarters * 4,
    );

    // Caso 3: Simular impacto en fecha de graduación
    return {
      currentProgress: await this.getCurrentProgress(userId),
      simulatedProgress: Math.round(simulatedProgress * 100) / 100,
      newlyUnlockedSubjects: newlyUnlocked.length,
      newlyUnlockedDetails: newlyUnlocked,
      simulatedGraduationDate,
      quartersSaved: this.calculateQuartersSaved(
        await this.getCurrentGraduationDate(userId),
        simulatedGraduationDate,
      ),
      changes: changes.length,
    };
  }

  private async getCurrentProgress(userId: string): Promise<number> {
    const subjects = await this.prisma.studentSubject.findMany({
      where: { userId },
    });

    const total = subjects.length;
    const approved = subjects.filter(
      (s: any) => s.status === SubjectStatus.PROMOCIONADA,
    ).length;
    const regularized = subjects.filter(
      (s: any) => s.status === SubjectStatus.REGULARIZADA,
    ).length;

    return Math.round(((approved + regularized * 0.5) / total) * 100 * 100) / 100;
  }

  private async getCurrentGraduationDate(userId: string): Promise<Date> {
    const result = await this.usersService.getEstimatedGraduation(userId);
    return result.estimatedDate;
  }

  private async calculateNewlyUnlocked(
    userId: string,
    currentSubjects: any[],
    simulatedSubjects: any[],
  ) {
    const newlyApproved = simulatedSubjects.filter(
      (s: any) =>
        s.status === SubjectStatus.PROMOCIONADA &&
        currentSubjects.find((c: any) => c.id === s.id)?.status !==
          SubjectStatus.PROMOCIONADA,
    );

    const unlocked = [];

    for (const approved of newlyApproved) {
      const careerSubject = await this.prisma.careerSubject.findUnique({
        where: { id: approved.careerSubjectId },
        include: {
          requiredBy: {
            include: {
              subject: true,
            },
          },
        },
      });

      if (careerSubject) {
        for (const dependent of careerSubject.requiredBy) {
          // Verificar si ahora está habilitada
          const dependentSubject = currentSubjects.find(
            (s) => s.careerSubjectId === dependent.id,
          );

          if (
            dependentSubject &&
            dependentSubject.status === SubjectStatus.PENDIENTE
          ) {
            unlocked.push({
              subjectId: dependent.id,
              subjectName: dependent.subject?.name,
              unlockedBy: approved.careerSubject.subject?.name,
            });
          }
        }
      }
    }

    return unlocked;
  }

  private calculateQuartersSaved(currentDate: Date, simulatedDate: Date): number {
    const diffTime = currentDate.getTime() - simulatedDate.getTime();
    const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30);
    return Math.round(diffMonths / 4);
  }
}
