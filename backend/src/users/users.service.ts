import { Injectable, NotFoundException } from '@nestjs/common';
import { SubjectStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userCareers: {
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
        userCareers: {
          include: { career: true },
        },
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
      data: {
        userCareers: {
          create: {
            careerId,
          },
        },
      },
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
        include: { userCareers: { include: { career: true } } },
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
        userCareers: {
          include: {
            career: {
              include: {
                subjects: true,
              },
            },
          },
        },
        subjects: {
          include: {
            careerSubject: true,
          },
        },
      },
    });

    if (!user || !user.userCareers || user.userCareers.length === 0) {
      throw new NotFoundException('Usuario o carrera no encontrados');
    }

    const primaryCareerId = user.userCareers[0].careerId;
    const activeCareerSubjects = user.subjects.filter(
      (s: any) => s.careerSubject.careerId === primaryCareerId
    );

    const totalSubjects = user.userCareers[0].career.subjects.length;
    const approvedSubjects = activeCareerSubjects.filter(
      (s: any) => s.status === SubjectStatus.PROMOCIONADA
    ).length;
    const regularizedSubjects = activeCareerSubjects.filter(
      (s: any) => s.status === SubjectStatus.REGULARIZADA
    ).length;

    // Materias pendientes (no aprobadas)
    const pendingSubjects = activeCareerSubjects.filter(
      (s: any) => s.status !== SubjectStatus.PROMOCIONADA
    );
    const remainingSubjectsCount = pendingSubjects.length;

    if (remainingSubjectsCount === 0) {
      return {
        estimatedDate: new Date(),
        remainingSubjects: 0,
        averageProgress: 0,
      };
    }

    // 1. Calcular Velocidad Real (Materias aprobadas por cuatrimestre)
    const enrollmentDate = user.userCareers[0].createdAt;
    const now = new Date();
    const monthsPassed = (now.getFullYear() - enrollmentDate.getFullYear()) * 12 + (now.getMonth() - enrollmentDate.getMonth());
    const semestersPassed = Math.max(1, Math.ceil(monthsPassed / 6));
    
    // Tasa histórica: materias aprobadas / cuatrimestres cursados
    // Minimo 2 para no ser excesivamente pesimista en planes nuevos
    const averageProgress = Math.max(2, Math.round((approvedSubjects / semestersPassed) * 10) / 10);

    // 2. Calcular Camino Crítico (Longitud de la cadena de correlatividades más larga)
    const pendingSubjectIds = pendingSubjects.map(s => s.careerSubjectId);
    const criticalPathDepth = await this.calculateCriticalPathDepth(pendingSubjectIds);

    // 3. Estimación final
    // Es el máximo entre (materias restantes / velocidad) y (profundidad del camino crítico)
    const remainingSemestersByVelocity = Math.ceil(remainingSubjectsCount / averageProgress);
    const totalRemainingSemesters = Math.max(remainingSemestersByVelocity, criticalPathDepth);

    // Fecha estimada (cada cuatrimestre ~6 meses reales de calendario académico + vacaciones)
    const estimatedDate = new Date();
    estimatedDate.setMonth(estimatedDate.getMonth() + totalRemainingSemesters * 6);

    return {
      estimatedDate,
      remainingSubjects: remainingSubjectsCount,
      averageProgress,
    };
  }

  // RN9 Helper: Encuentra la cadena más larga de correlatividades en las materias pendientes
  private async calculateCriticalPathDepth(pendingSubjectIds: string[]): Promise<number> {
    if (pendingSubjectIds.length === 0) return 0;

    const subjects = await this.prisma.careerSubject.findMany({
      where: { id: { in: pendingSubjectIds } },
      include: { prerequisites: true },
    });

    // Mapeo para búsqueda rápida
    const subjectMap = new Map(subjects.map(s => [s.id, s]));
    const cache = new Map<string, number>();

    const getDepth = (id: string): number => {
      if (cache.has(id)) return cache.get(id)!;
      
      const s = subjectMap.get(id) as any;
      if (!s || !s.prerequisites || s.prerequisites.length === 0) {
        return 1;
      }

      // Solo nos interesan los prerequisitos que TAMBIÉN están pendientes
      const pendingPrereqs = s.prerequisites.filter((p: any) => pendingSubjectIds.includes(p.id));
      if (pendingPrereqs.length === 0) return 1;

      const depth = 1 + Math.max(...pendingPrereqs.map((p: any) => getDepth(p.id)));
      cache.set(id, depth);
      return depth;
    };

    let maxDepth = 0;
    for (const id of pendingSubjectIds) {
      maxDepth = Math.max(maxDepth, getDepth(id));
    }

    return maxDepth;
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
        userCareers: {
          include: {
            career: {
              include: {
                subjects: true,
              },
            },
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

    if (!user || !user.userCareers || user.userCareers.length === 0) {
      throw new NotFoundException('Usuario o carrera no encontrados');
    }

    const primaryCareerId = user.userCareers[0].careerId;
    const activeCareerSubjects = user.subjects.filter(
      (s: any) => s.careerSubject.careerId === primaryCareerId
    );

    const totalSubjects = user.userCareers[0].career.subjects.length;
    const approvedSubjects = activeCareerSubjects.filter(
      (s: any) => s.status === SubjectStatus.PROMOCIONADA
    ).length;
    const regularizedSubjects = activeCareerSubjects.filter(
      (s: any) => s.status === SubjectStatus.REGULARIZADA
    ).length;

    // % de avance (promocionadas = 100%, regularizadas = 50%)
    const progressPercentage =
      ((approvedSubjects + regularizedSubjects * 0.5) / totalSubjects) * 100;

    // Promedio académico (RN6) - incluye nota final o cursadas cerradas (aplazos importan)
    const subjectsWithGrade = activeCareerSubjects.filter((s: any) => 
      s.finalGrade !== null || 
      (s.courseGrade !== null && [SubjectStatus.PROMOCIONADA, SubjectStatus.REGULARIZADA, SubjectStatus.DESAPROBADA].includes(s.status))
    );
    const averageGrade =
      subjectsWithGrade.length > 0
        ? subjectsWithGrade.reduce((sum: number, s: any) => sum + (s.finalGrade ?? s.courseGrade ?? 0), 0) /
          subjectsWithGrade.length
        : 0;

    // Créditos totales
    const totalCredits = user.credits.reduce((sum: number, c: any) => sum + c.credits, 0);

    // Proyección de graduación
    const graduation = await this.getEstimatedGraduation(userId);

    return {
      userName: user.name,
      careerName: user.userCareers[0].career.name,
      totalSubjects,
      approvedSubjects,
      regularizedSubjects,
      progressPercentage: Math.round(progressPercentage * 100) / 100,
      averageGrade: Math.round(averageGrade * 100) / 100,
      totalCredits,
      estimatedGraduationDate: graduation.estimatedDate,
      remainingSubjects: graduation.remainingSubjects,
      averageVelocity: graduation.averageProgress,
    };
  }
}
