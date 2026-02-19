import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SubjectStatus } from '../prisma-client.mock';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        career: {
          include: {
            subjects: {
              include: {
                subject: true,
                prerequisites: true,
              },
            },
          },
        },
        subjects: {
          include: {
            careerSubject: {
              include: {
                subject: true,
                prerequisites: true,
              },
            },
          },
        },
        credits: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async updateProfile(userId: string, data: { name?: string; careerId?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      include: {
        career: true,
      },
    });
  }

  async setupCareer(userId: string, careerId: string) {
    // Verificar que la carrera existe
    const career = await this.prisma.career.findUnique({
      where: { id: careerId },
      include: {
        subjects: true,
      },
    });

    if (!career) {
      throw new NotFoundException('Carrera no encontrada');
    }

    // Actualizar carrera del usuario
    await this.prisma.user.update({
      where: { id: userId },
      data: { careerId },
    });

    // Crear StudentSubject para cada materia de la carrera (US-07: carga inicial rápida)
    const studentSubjects = await Promise.all(
      career.subjects.map((cs) =>
        this.prisma.studentSubject.create({
          data: {
            userId,
            careerSubjectId: cs.id,
            status: SubjectStatus.PENDIENTE,
          },
        })
      )
    );

    return {
      user: await this.prisma.user.findUnique({
        where: { id: userId },
        include: { career: true },
      }),
      subjectsCount: studentSubjects.length,
    };
  }

  // US-06: Calcular fecha estimada de graduación (RN9)
  async getEstimatedGraduation(userId: string): Promise<{
    estimatedDate: Date;
    remainingSubjects: number;
    averageProgress: number;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        career: {
          include: {
            subjects: true,
          },
        },
        subjects: {
          include: {
            careerSubject: true,
          },
        },
      },
    });

    if (!user || !user.career) {
      throw new NotFoundException('Usuario o carrera no encontrados');
    }

    const totalSubjects = user.career.subjects.length;
    const approvedSubjects = user.subjects.filter(
      (s: any) => s.status === SubjectStatus.PROMOCIONADA
    ).length;
    const regularizedSubjects = user.subjects.filter(
      (s: any) => s.status === SubjectStatus.REGULARIZADA
    ).length;

    // Materias pendientes (no aprobadas ni regularizadas)
    const remainingSubjects = totalSubjects - approvedSubjects - regularizedSubjects;

    // Tasa histórica: promedio de materias aprobadas por cuatrimestre
    // Por defecto asumimos 3 materias por cuatrimestre si no hay historial
    const averageProgress = 3;

    // Cuatrimestres restantes
    const remainingQuarters = Math.ceil(remainingSubjects / averageProgress);

    // Fecha estimada (cada cuatrimestre ~4 meses)
    const estimatedDate = new Date();
    estimatedDate.setMonth(estimatedDate.getMonth() + remainingQuarters * 4);

    return {
      estimatedDate,
      remainingSubjects,
      averageProgress,
    };
  }

  // US-05: Obtener total de créditos
  async getTotalCredits(userId: string): Promise<{
    total: number;
    credits: any[];
  }> {
    const credits = await this.prisma.credit.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    const total = credits.reduce((sum: number, c: any) => sum + c.credits, 0);

    return { total, credits };
  }

  // US-01: Obtener métricas del dashboard
  async getDashboardMetrics(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        career: {
          include: {
            subjects: true,
          },
        },
        subjects: {
          include: {
            careerSubject: true,
          },
        },
        credits: true,
      },
    });

    if (!user || !user.career) {
      throw new NotFoundException('Usuario o carrera no encontrados');
    }

    const totalSubjects = user.career.subjects.length;
    const approvedSubjects = user.subjects.filter(
      (s: any) => s.status === SubjectStatus.PROMOCIONADA
    ).length;
    const regularizedSubjects = user.subjects.filter(
      (s: any) => s.status === SubjectStatus.REGULARIZADA
    ).length;

    // % de avance (promocionadas = 100%, regularizadas = 50%)
    const progressPercentage =
      ((approvedSubjects + regularizedSubjects * 0.5) / totalSubjects) * 100;

    // Promedio académico (RN6)
    const subjectsWithGrade = user.subjects.filter((s: any) => s.finalGrade !== null);
    const averageGrade =
      subjectsWithGrade.length > 0
        ? subjectsWithGrade.reduce((sum: number, s: any) => sum + (s.finalGrade || 0), 0) /
          subjectsWithGrade.length
        : 0;

    // Créditos totales
    const totalCredits = user.credits.reduce((sum: number, c: any) => sum + c.credits, 0);

    // Proyección de graduación
    const graduation = await this.getEstimatedGraduation(userId);

    return {
      careerName: user.career.name,
      totalSubjects,
      approvedSubjects,
      regularizedSubjects,
      progressPercentage: Math.round(progressPercentage * 100) / 100,
      averageGrade: Math.round(averageGrade * 100) / 100,
      totalCredits,
      estimatedGraduationDate: graduation.estimatedDate,
      remainingSubjects: graduation.remainingSubjects,
    };
  }
}
