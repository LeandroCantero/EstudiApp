import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SubjectStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class StudentSubjectsService {
  constructor(private prisma: PrismaService) {}

  private formatSubject(subject: any) {
    if (!subject) return subject;
    return {
      ...subject,
      courseGrade: subject.courseGrade !== null && subject.courseGrade !== undefined 
        ? Math.round(subject.courseGrade * 100) / 100 
        : subject.courseGrade,
      finalGrade: subject.finalGrade !== null && subject.finalGrade !== undefined 
        ? Math.round(subject.finalGrade * 100) / 100 
        : subject.finalGrade,
    };
  }

  async findAll(userId: string) {
    const subjects = await this.prisma.studentSubject.findMany({
      where: { userId },
      include: {
        careerSubject: {
          include: {
            subject: true,
            prerequisites: {
              include: {
                subject: true,
              },
            },
          },
        },
        notes: true,
        events: true,
      },
      orderBy: {
        careerSubject: {
          year: 'asc',
        },
      },
    });

    return subjects.map(s => this.formatSubject(s));
  }

  async findOne(userId: string, id: string) {
    const studentSubject = await this.prisma.studentSubject.findFirst({
      where: { id, userId },
      include: {
        careerSubject: {
          include: {
            subject: true,
            prerequisites: {
              include: {
                subject: true,
              },
            },
            requiredBy: {
              include: {
                subject: true,
              },
            },
          },
        },
        notes: true,
        events: true,
      },
    });

    if (!studentSubject) {
      throw new NotFoundException('Materia no encontrada');
    }

    return this.formatSubject(studentSubject);
  }

  // US-02: Cambiar estado de materia
  async updateStatus(
    userId: string,
    id: string,
    newStatus: SubjectStatus,
    courseGrade?: number,
  ) {
    const studentSubject = await this.findOne(userId, id);
    const currentStatus = studentSubject.status;

    // RN1: Validar transición de estado válida
    this.validateStateTransition(currentStatus, newStatus);

    // RN2: Si está intentando cursar (EN_CURSO), validar correlativas
    if (newStatus === SubjectStatus.EN_CURSO) {
      await this.validatePrerequisites(userId, studentSubject.careerSubjectId);
    }

    // RN8: Si está intentando cerrar como PROMOCIONADA, validar correlativas aprobadas
    if (newStatus === SubjectStatus.PROMOCIONADA) {
      await this.validatePrerequisitesForClosing(userId, studentSubject.careerSubjectId);
    }

    const dataToUpdate: any = { status: newStatus };
    if (courseGrade !== undefined) {
      dataToUpdate.courseGrade = Math.round(courseGrade * 100) / 100;
    }

    return this.prisma.studentSubject.update({
      where: { id },
      data: dataToUpdate,
      include: {
        careerSubject: {
          include: {
            subject: true,
          },
        },
      },
    });
  }

  // RN3: Registrar nota final
  async registerFinalGrade(
    userId: string,
    id: string,
    grade: number,
  ) {
    if (grade < 0 || grade > 10) {
      throw new BadRequestException('La nota debe estar entre 0 y 10');
    }

    const roundedGrade = Math.round(grade * 100) / 100;

    const studentSubject = await this.findOne(userId, id);

    // Solo se puede registrar final si está REGULARIZADA
    if (studentSubject.status !== SubjectStatus.REGULARIZADA) {
      throw new BadRequestException(
        'Solo se puede registrar nota final si la materia está regularizada',
      );
    }

    // Si aprueba (>=4), cambia a aprobada
    let newStatus = grade >= 4 ? SubjectStatus.PROMOCIONADA : studentSubject.status;

    // RN8: Validar correlativas si se intenta promocionar vía nota final
    if (newStatus === SubjectStatus.PROMOCIONADA) {
      await this.validatePrerequisitesForClosing(userId, studentSubject.careerSubjectId);
    }


    return this.prisma.studentSubject.update({
      where: { id },
      data: {
        finalGrade: roundedGrade,
        status: newStatus,
      },
      include: {
        careerSubject: {
          include: {
            subject: true,
          },
        },
      },
    });
  }

  // US-09: Registrar materia recursada
  async markAsRetaking(userId: string, id: string) {
    const studentSubject = await this.findOne(userId, id);

    if (studentSubject.status !== SubjectStatus.DESAPROBADA) {
      throw new BadRequestException(
        'Solo se pueden recursar materias desaprobadas',
      );
    }

    return this.prisma.studentSubject.update({
      where: { id },
      data: {
        status: SubjectStatus.RECURSANDO,
        attemptCount: {
          increment: 1,
        },
      },
      include: {
        careerSubject: {
          include: {
            subject: true,
          },
        },
      },
    });
  }

  // RN2: Validar que todas las correlativas estén al menos regularizadas
  private async validatePrerequisites(userId: string, careerSubjectId: string) {
    const careerSubject = await this.prisma.careerSubject.findUnique({
      where: { id: careerSubjectId },
      include: {
        prerequisites: true,
      },
    });

    if (!careerSubject) {
      throw new NotFoundException('Materia del plan no encontrada');
    }

    for (const prereq of careerSubject.prerequisites) {
      const studentPrereq = await this.prisma.studentSubject.findFirst({
        where: {
          userId,
          careerSubjectId: prereq.id,
        },
      });

      if (!studentPrereq) {
        throw new BadRequestException(
          `No puedes cursar esta materia. Falta cursar: ${prereq.subjectId}`,
        );
      }

      const validStatuses: SubjectStatus[] = [
        SubjectStatus.REGULARIZADA,
        SubjectStatus.PROMOCIONADA,
      ];

      if (!validStatuses.includes(studentPrereq.status)) {
        throw new BadRequestException(
          `No puedes cursar esta materia. La correlativa debe estar al menos regularizada`,
        );
      }
    }
  }

  // RN8: Validar que correlativas estén aprobadas (promocionadas) para cerrar materia
  private async validatePrerequisitesForClosing(
    userId: string,
    careerSubjectId: string,
  ) {
    const careerSubject = await this.prisma.careerSubject.findUnique({
      where: { id: careerSubjectId },
      include: {
        prerequisites: {
          include: {
            subject: true,
          }
        },
      },
    });


    if (!careerSubject) return;

    for (const prereq of careerSubject.prerequisites) {
      const studentPrereq = await this.prisma.studentSubject.findFirst({
        where: {
          userId,
          careerSubjectId: prereq.id,
        },
      });

      if (!studentPrereq || studentPrereq.status !== SubjectStatus.PROMOCIONADA) {
        throw new BadRequestException(
          `No puedes promocionar esta materia. Debes aprobar primero: ${prereq.subject.name} (${prereq.code})`,
        );
      }

    }
  }

  // RN1: Validar transiciones de estado permitidas
  private validateStateTransition(
    current: SubjectStatus,
    next: SubjectStatus,
  ) {
    const validTransitions: Record<SubjectStatus, SubjectStatus[]> = {
      [SubjectStatus.PENDIENTE]: [
        SubjectStatus.EN_CURSO,
        SubjectStatus.RECURSANDO,
      ],
      [SubjectStatus.EN_CURSO]: [
        SubjectStatus.REGULARIZADA,
        SubjectStatus.PROMOCIONADA,
        SubjectStatus.DESAPROBADA,
      ],
      [SubjectStatus.REGULARIZADA]: [
        SubjectStatus.PROMOCIONADA, // RN3: después de aprobar final
      ],
      [SubjectStatus.PROMOCIONADA]: [], // Estado final
      [SubjectStatus.DESAPROBADA]: [
        SubjectStatus.RECURSANDO,
        SubjectStatus.EN_CURSO,
      ],
      [SubjectStatus.RECURSANDO]: [
        SubjectStatus.EN_CURSO,
        SubjectStatus.REGULARIZADA,
        SubjectStatus.PROMOCIONADA,
        SubjectStatus.DESAPROBADA,
      ],
    };

    const allowed = validTransitions[current];
    if (!allowed.includes(next)) {
      throw new BadRequestException(
        `Transición de estado no válida: ${current} -> ${next}`,
      );
    }
  }

  // Obtener materias habilitadas para cursar (que cumplen RN2)
  async getEligibleSubjects(userId: string) {
    const allSubjects = await this.findAll(userId);

    const eligible = [];
    for (const subject of allSubjects) {
      if (subject.status !== SubjectStatus.PENDIENTE) continue;

      try {
        await this.validatePrerequisites(userId, subject.careerSubjectId);
        eligible.push(subject);
      } catch {
        // No cumple prerequisitos, no es elegible
      }
    }

    return eligible;
  }

  // Caso 2: Detectar cuellos de botella (materias que bloquean muchas otras)
  async getBottleneckSubjects(userId: string) {
    const subjects = await this.findAll(userId);

    const bottlenecks = [];
    for (const subject of subjects) {
      // Solo materias pendientes o desaprobadas que son correlativas de otras
      if (
        subject.status !== SubjectStatus.PENDIENTE &&
        subject.status !== SubjectStatus.DESAPROBADA
      ) {
        continue;
      }

      const careerSubject = await this.prisma.careerSubject.findUnique({
        where: { id: subject.careerSubjectId },
        include: {
          requiredBy: true,
          subject: true,
        },
      });

      if (careerSubject && careerSubject.requiredBy.length > 2) {
        bottlenecks.push({
          ...subject,
          blocksCount: careerSubject.requiredBy.length,
        });
      }
    }

    return bottlenecks.sort((a, b) => b.blocksCount - a.blocksCount);
  }

  async getAlerts(userId: string) {
    const subjects = await this.prisma.studentSubject.findMany({
      where: { userId },
      include: {
        careerSubject: {
          include: {
            subject: true,
            prerequisites: {
              include: {
                subject: true,
              }
            },
          },
        },
      },
    });

    const alerts = [];

    for (const subject of subjects) {
      // 1. Alerta de Correlatividad de Cierre (RN8)
      if (
        subject.status === SubjectStatus.REGULARIZADA ||
        subject.status === SubjectStatus.EN_CURSO
      ) {
        for (const prereq of subject.careerSubject.prerequisites) {
          const studentPrereq = subjects.find(
            (s) => s.careerSubjectId === prereq.id,
          );

          if (!studentPrereq || studentPrereq.status !== SubjectStatus.PROMOCIONADA) {
            alerts.push({
              id: `block-${subject.id}-${prereq.id}`,
              type: 'CORRELATIVE_BLOCK',
              priority: 'HIGH',
              subjectId: subject.id,
              subjectName: subject.careerSubject.subject.name,
              message: `No puedes cerrar ${subject.careerSubject.subject.name} hasta aprobar el final de ${prereq.subject.name}.`,
              metadata: {
                prereqId: prereq.id,
                prereqName: prereq.subject.name,
              },
            });
          }
        }
      }

      // 2. Alerta de Vencimiento de Regularidad (RN3)
      if (subject.status === SubjectStatus.REGULARIZADA) {
        // Asumimos 2 años de regularidad (validez)
        const expiryDate = new Date(subject.updatedAt);
        expiryDate.setFullYear(expiryDate.getFullYear() + 2);
        
        const now = new Date();
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(now.getMonth() + 6);

        if (expiryDate <= sixMonthsFromNow) {
          alerts.push({
            id: `expiry-${subject.id}`,
            type: 'REGULARITY_EXPIRY',
            priority: expiryDate <= now ? 'CRITICAL' : 'MEDIUM',
            subjectId: subject.id,
            subjectName: subject.careerSubject.subject.name,
            message: expiryDate <= now 
              ? `La regularidad de ${subject.careerSubject.subject.name} ha vencido.`
              : `La regularidad de ${subject.careerSubject.subject.name} vence pronto (${expiryDate.toLocaleDateString()}).`,
            metadata: {
              expiryDate,
            },
          });
        }
      }
    }

    return alerts;
  }
}

