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
      (s: any) => s.status === SubjectStatus.PROMOCIONADA || s.status === SubjectStatus.APROBADA
    ).length;
    const regularizedSubjects = activeCareerSubjects.filter(
      (s: any) => s.status === SubjectStatus.REGULARIZADA
    ).length;

    // Materias pendientes (no aprobadas)
    const pendingSubjects = activeCareerSubjects.filter(
      (s: any) => s.status !== SubjectStatus.PROMOCIONADA && s.status !== SubjectStatus.APROBADA
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
    // RN: Materias anuales (period 0) cuentan doble para la velocidad
    const totalWeightApproved = activeCareerSubjects
      .filter((s: any) => s.status === SubjectStatus.PROMOCIONADA || s.status === SubjectStatus.APROBADA)
      .reduce((sum, s: any) => sum + (s.careerSubject.period === 0 ? 2 : 1), 0);

    // Minimo 2 para no ser excesivamente pesimista en planes nuevos. MAXIMO 4 (Límite académico)
    const averageProgress = Math.min(4, Math.max(2, Math.round((totalWeightApproved / semestersPassed) * 10) / 10));


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
  // Heurística: Si una materia es del último año y no tiene correlativas, se asume que es la materia final/tesina.
  private async calculateCriticalPathDepth(pendingSubjectIds: string[]): Promise<number> {
    if (pendingSubjectIds.length === 0) return 0;

    const subjects = await this.prisma.careerSubject.findMany({
      where: { id: { in: pendingSubjectIds } },
      include: { prerequisites: true },
    });

    // 1. Identificar el último año para la heurística de "Materia Final"
    const maxYear = Math.max(...subjects.map(s => s.year || 0));

    // Mapeo para búsqueda rápida
    const subjectMap = new Map(subjects.map(s => [s.id, s]));
    const cache = new Map<string, number>();

    const getDepth = (id: string): number => {
      if (cache.has(id)) return cache.get(id)!;
      
      const s = subjectMap.get(id) as any;
      if (!s) return 0;

      const subjectWeight = s.period === 0 ? 2 : 1;

      if (!s.prerequisites || s.prerequisites.length === 0) {
        return subjectWeight;
      }

      const pendingPrereqs = s.prerequisites.filter((p: any) => pendingSubjectIds.includes(p.id));
      if (pendingPrereqs.length === 0) return subjectWeight;

      const depth = subjectWeight + Math.max(...pendingPrereqs.map((p: any) => getDepth(p.id)));
      cache.set(id, depth);
      return depth;
    };

    // 2. Separar materias base de materias "potencialmente finales"
    let maxNormalDepth = 0;
    const finalSubjects: any[] = [];

    for (const s of subjects) {
      // Heurística: último año + sin correlativas = materia final (tesina/proyecto)
      if (s.year === maxYear && (!s.prerequisites || s.prerequisites.length === 0)) {
        finalSubjects.push(s);
      } else {
        const depth = getDepth(s.id);
        if (depth > maxNormalDepth) maxNormalDepth = depth;
      }
    }

    // 3. Ajuste: La materia final se suma al camino crítico más largo
    let finalAdjustment = 0;
    if (finalSubjects.length > 0) {
      // Tomamos el peso de la materia final (usualmente 1 cuatrimestre)
      finalAdjustment = Math.max(...finalSubjects.map(s => s.period === 0 ? 2 : 1));
    }

    return maxNormalDepth + finalAdjustment;
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
            careerSubject: {
              include: {
                subject: true,
              },
            },
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
    const approvedSubjects = user.userCareers[0].approvedCount; // Fuente de verdad sincronizada en DB
    const regularizedSubjects = activeCareerSubjects.filter(
      (s: any) => s.status === SubjectStatus.REGULARIZADA
    ).length;

    // % de avance (promocionadas = 100%, regularizadas = 50%)
    const progressPercentage =
      ((approvedSubjects + regularizedSubjects * 0.5) / totalSubjects) * 100;

    // Promedio académico (RN6) - incluye nota final o cursadas cerradas (aplazos importan)
    const subjectsWithGrade = activeCareerSubjects.filter((s: any) => 
      s.finalGrade !== null || 
      (s.courseGrade !== null && [SubjectStatus.PROMOCIONADA, SubjectStatus.APROBADA, SubjectStatus.REGULARIZADA, SubjectStatus.DESAPROBADA].includes(s.status))
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
      gradeBreakdown: subjectsWithGrade.map(s => ({
        id: s.id,
        name: s.careerSubject.subject.name,
        code: s.careerSubject.code,
        grade: s.finalGrade ?? s.courseGrade,
        status: s.status,
      })),
    };
  }
}
