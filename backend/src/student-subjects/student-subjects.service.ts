import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SubjectStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';

type WarningSeverity = 'info' | 'warn' | 'block';

export interface TransitionWarning {
  code: string;
  severity: WarningSeverity;
  message: string;
}

export interface UpdateStatusPayload {
  status: SubjectStatus;
  courseGrade?: number;
  completionYear?: number;
  completionPeriod?: number;
  attemptCount?: number;
}

@Injectable()
export class StudentSubjectsService {
  constructor(private prisma: PrismaService) {}

  private readonly approvedStatuses = new Set<SubjectStatus>([
    SubjectStatus.PROMOCIONADA,
    SubjectStatus.APROBADA,
  ]);

  private readonly transitionMap: Record<SubjectStatus, ReadonlySet<SubjectStatus>> = {
    [SubjectStatus.PENDIENTE]: new Set([SubjectStatus.EN_CURSO, SubjectStatus.RECURSANDO]),
    [SubjectStatus.EN_CURSO]: new Set([
      SubjectStatus.REGULARIZADA,
      SubjectStatus.PROMOCIONADA,
      SubjectStatus.DESAPROBADA,
    ]),
    [SubjectStatus.REGULARIZADA]: new Set([SubjectStatus.APROBADA]),
    [SubjectStatus.PROMOCIONADA]: new Set([
      SubjectStatus.EN_CURSO,
      SubjectStatus.RECURSANDO,
      SubjectStatus.PENDIENTE,
    ]),
    [SubjectStatus.APROBADA]: new Set([
      SubjectStatus.REGULARIZADA,
      SubjectStatus.EN_CURSO,
      SubjectStatus.RECURSANDO,
      SubjectStatus.PENDIENTE,
    ]),
    [SubjectStatus.DESAPROBADA]: new Set([SubjectStatus.PENDIENTE]),
    [SubjectStatus.RECURSANDO]: new Set([
      SubjectStatus.REGULARIZADA,
      SubjectStatus.PROMOCIONADA,
      SubjectStatus.DESAPROBADA,
    ]),
  };

  private formatSubject(subject: any) {
    if (!subject) return subject;
    return {
      ...subject,
      courseGrade:
        subject.courseGrade !== null && subject.courseGrade !== undefined
          ? Math.round(subject.courseGrade * 100) / 100
          : subject.courseGrade,
      finalGrade:
        subject.finalGrade !== null && subject.finalGrade !== undefined
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

    return subjects.map((s) => this.formatSubject(s));
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

  async updateStatus(userId: string, id: string, dto: UpdateStatusPayload) {
    const { status: requestedStatus, courseGrade, completionYear, completionPeriod, attemptCount } = dto;
    const studentSubject = await this.findOne(userId, id);
    const currentStatus = studentSubject.status;
    const currentAttemptCount = studentSubject.attemptCount;
    const nextStatus = this.resolveStatusFromCourseGrade(requestedStatus, courseGrade);
    this.validateAttemptCount(attemptCount);

    const transitionWarnings = await this.getTransitionWarnings(userId, studentSubject, nextStatus, courseGrade);

    const dataToUpdate: any = { status: nextStatus };

    if (courseGrade !== undefined) {
      const roundedGrade = Math.round(courseGrade * 100) / 100;
      dataToUpdate.courseGrade = roundedGrade;
      if (nextStatus === SubjectStatus.PROMOCIONADA) {
        dataToUpdate.finalGrade = roundedGrade;
      }
    }

    if (
      currentStatus === SubjectStatus.DESAPROBADA &&
      (nextStatus === SubjectStatus.EN_CURSO || nextStatus === SubjectStatus.RECURSANDO)
    ) {
      dataToUpdate.attemptCount = currentAttemptCount + 1;
    }

    if (currentStatus === SubjectStatus.PENDIENTE && nextStatus === SubjectStatus.RECURSANDO) {
      dataToUpdate.attemptCount = Math.max(currentAttemptCount, 2);
    }

    if (attemptCount !== undefined) {
      dataToUpdate.attemptCount = attemptCount;
    }

    if (completionYear !== undefined) dataToUpdate.completionYear = completionYear;
    if (completionPeriod !== undefined) dataToUpdate.completionPeriod = completionPeriod;

    const updated = await this.prisma.studentSubject.update({
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

    const isNowApproved = this.approvedStatuses.has(updated.status);
    const wasApproved = this.approvedStatuses.has(currentStatus);

    if (isNowApproved !== wasApproved) {
      await this.updateUserCareerApprovedCount(userId, updated.careerSubject.careerId);
    }

    return {
      ...updated,
      transitionWarnings,
    };
  }

  async previewStatusChange(userId: string, id: string, dto: UpdateStatusPayload) {
    const { status, courseGrade } = dto;
    const studentSubject = await this.findOne(userId, id);
    const nextStatus = this.resolveStatusFromCourseGrade(status, courseGrade);
    const warnings = await this.getTransitionWarnings(userId, studentSubject, nextStatus, courseGrade);

    try {
      this.validateStateTransition(studentSubject.status, nextStatus);
    } catch (error) {
      if (error instanceof BadRequestException) {
        warnings.push({
          code: 'INVALID_TRANSITION',
          severity: 'warn',
          message: error.message,
        });
      }
    }

    try {
    } catch (error) {
      if (error instanceof BadRequestException) {
        warnings.push({
          code: 'INCONSISTENT_GRADE',
          severity: 'warn',
          message: error.message,
        });
      }
    }

    return {
      allowed: true,
      nextStatus,
      warnings,
    };
  }

  async registerFinalGrade(
    userId: string,
    id: string,
    grade: number,
    completionYear?: number,
    completionPeriod?: number,
  ) {
    if (grade < 0 || grade > 10) {
      throw new BadRequestException('La nota debe estar entre 0 y 10');
    }

    const roundedGrade = Math.round(grade * 100) / 100;
    const studentSubject = await this.findOne(userId, id);

    const validForFinal = [SubjectStatus.REGULARIZADA, SubjectStatus.EN_CURSO];
    if (!validForFinal.includes(studentSubject.status)) {
      throw new BadRequestException(
        'Solo se puede registrar nota final si la materia está regularizada o en curso',
      );
    }

    let newStatus: SubjectStatus;
    if (roundedGrade >= 4) {
      newStatus = SubjectStatus.APROBADA;
      await this.validatePrerequisitesForClosing(userId, studentSubject.careerSubjectId);
    } else {
      newStatus = SubjectStatus.REGULARIZADA;
    }

    const updated = await this.prisma.studentSubject.update({
      where: { id },
      data: {
        finalGrade: roundedGrade,
        status: newStatus,
        completionYear: completionYear ?? undefined,
        completionPeriod: completionPeriod ?? undefined,
      },
      include: {
        careerSubject: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (newStatus === SubjectStatus.APROBADA) {
      await this.updateUserCareerApprovedCount(userId, updated.careerSubject.careerId);
    }

    return updated;
  }

  async markAsRetaking(userId: string, id: string) {
    const studentSubject = await this.findOne(userId, id);

    if (studentSubject.status !== SubjectStatus.DESAPROBADA) {
      throw new BadRequestException('Solo se pueden recursar materias desaprobadas');
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

  private async validatePrerequisites(userId: string, careerSubjectId: string) {
    const careerSubject = await this.prisma.careerSubject.findUnique({
      where: { id: careerSubjectId },
      include: {
        prerequisites: {
          include: { subject: true },
        },
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
        throw new BadRequestException(`No puedes cursar esta materia. Falta cursar: ${prereq.subject.name}`);
      }

      const isEligible =
        studentPrereq.status === SubjectStatus.REGULARIZADA ||
        studentPrereq.status === SubjectStatus.PROMOCIONADA ||
        studentPrereq.status === SubjectStatus.APROBADA;

      if (!isEligible) {
        throw new BadRequestException(
          `No puedes cursar esta materia. La correlativa ${prereq.subject.name} debe estar al menos regularizada`,
        );
      }
    }
  }

  private async validatePrerequisitesForClosing(userId: string, careerSubjectId: string) {
    const careerSubject = await this.prisma.careerSubject.findUnique({
      where: { id: careerSubjectId },
      include: {
        prerequisites: {
          include: {
            subject: true,
          },
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

      if (
        !studentPrereq ||
        (studentPrereq.status !== SubjectStatus.PROMOCIONADA && studentPrereq.status !== SubjectStatus.APROBADA)
      ) {
        throw new BadRequestException(
          `No puedes promocionar esta materia. Debes aprobar primero: ${prereq.subject.name} (${prereq.code})`,
        );
      }
    }
  }

  private validateStateTransition(current: SubjectStatus, next: SubjectStatus) {
    if (current === next) return;
    if (this.transitionMap[current]?.has(next)) return;

    throw new BadRequestException(`Transición de estado no válida: de ${current} a ${next}`);
  }

  async resetSubject(userId: string, id: string, resetAttempts = false) {
    const studentSubject = await this.findOne(userId, id);
    const wasApproved = this.approvedStatuses.has(studentSubject.status);

    const updated = await this.prisma.studentSubject.update({
      where: { id },
      data: {
        status: SubjectStatus.PENDIENTE,
        courseGrade: null,
        finalGrade: null,
        completionYear: null,
        completionPeriod: null,
        attemptCount: resetAttempts ? 1 : studentSubject.attemptCount,
      },
      include: {
        careerSubject: { include: { career: true, subject: true } },
      },
    });

    if (wasApproved) {
      await this.updateUserCareerApprovedCount(userId, updated.careerSubject.careerId);
    }

    return updated;
  }

  private async updateUserCareerApprovedCount(userId: string, careerId: string) {
    const approvedCount = await this.prisma.studentSubject.count({
      where: {
        userId,
        careerSubject: { careerId },
        status: { in: [SubjectStatus.PROMOCIONADA, SubjectStatus.APROBADA] },
      },
    });

    await this.prisma.userCareer.update({
      where: { userId_careerId: { userId, careerId } },
      data: { approvedCount },
    });

    return approvedCount;
  }

  async getEligibleSubjects(userId: string) {
    const allSubjects = await this.findAll(userId);
    const eligible = [];
    for (const subject of allSubjects) {
      if (subject.status !== SubjectStatus.PENDIENTE) continue;
      try {
        await this.validatePrerequisites(userId, subject.careerSubjectId);
        eligible.push(subject);
      } catch {
        // Ignorar
      }
    }
    return eligible;
  }

  async getBottleneckSubjects(userId: string) {
    const subjects = await this.findAll(userId);
    const bottlenecks = [];
    for (const subject of subjects) {
      if (subject.status !== SubjectStatus.PENDIENTE && subject.status !== SubjectStatus.DESAPROBADA) continue;
      const careerSubject = await this.prisma.careerSubject.findUnique({
        where: { id: subject.careerSubjectId },
        include: { requiredBy: true, subject: true },
      });
      if (careerSubject && careerSubject.requiredBy.length > 2) {
        bottlenecks.push({ ...subject, blocksCount: careerSubject.requiredBy.length });
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
            prerequisites: { include: { subject: true } },
          },
        },
      },
    });

    const alerts = [];
    for (const subject of subjects) {
      if (subject.status === SubjectStatus.REGULARIZADA || subject.status === SubjectStatus.EN_CURSO) {
        for (const prereq of subject.careerSubject.prerequisites) {
          const studentPrereq = subjects.find((s) => s.careerSubjectId === prereq.id);
          if (
            !studentPrereq ||
            (studentPrereq.status !== SubjectStatus.PROMOCIONADA && studentPrereq.status !== SubjectStatus.APROBADA)
          ) {
            alerts.push({
              id: `block-${subject.id}-${prereq.id}`,
              type: 'CORRELATIVE_BLOCK',
              priority: 'HIGH',
              subjectId: subject.id,
              subjectName: subject.careerSubject.subject.name,
              message: `No podés promocionar ${subject.careerSubject.subject.name} hasta aprobar ${prereq.subject.name}.`,
              metadata: { prereqId: prereq.id, prereqName: prereq.subject.name },
            });
          }
        }
      }

      if (subject.status === SubjectStatus.REGULARIZADA) {
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
            message:
              expiryDate <= now
                ? `La regularidad de ${subject.careerSubject.subject.name} ha vencido.`
                : `La regularidad de ${subject.careerSubject.subject.name} vence pronto (${expiryDate.toLocaleDateString()}).`,
            metadata: { expiryDate },
          });
        }
      }
    }
    return alerts;
  }

  private resolveStatusFromCourseGrade(requestedStatus: SubjectStatus, courseGrade?: number): SubjectStatus {
    if (courseGrade === undefined) return requestedStatus;
    const roundedGrade = Math.round(courseGrade * 100) / 100;
    if (roundedGrade < 4) return SubjectStatus.DESAPROBADA;
    if (roundedGrade < 7) return SubjectStatus.REGULARIZADA;
    return SubjectStatus.PROMOCIONADA;
  }

  private validateAttemptCount(attemptCount?: number) {
    if (attemptCount === undefined) return;
    if (!Number.isInteger(attemptCount) || attemptCount < 0) {
      throw new BadRequestException('La cantidad de recursadas debe ser un entero mayor o igual a 0');
    }
  }

  private validateGradeConsistency(nextStatus: SubjectStatus, courseGrade?: number) {
    if (courseGrade === undefined) return;
    if (courseGrade < 0 || courseGrade > 10) {
      throw new BadRequestException('La nota de cursada debe estar entre 0 y 10');
    }
    if (nextStatus === SubjectStatus.PROMOCIONADA && courseGrade < 7) {
      throw new BadRequestException('Para promocionar la nota de cursada debe ser 7 o más');
    }
    if (nextStatus === SubjectStatus.REGULARIZADA && (courseGrade < 4 || courseGrade >= 7)) {
      throw new BadRequestException('Para regularizar la nota debe estar entre 4 y 6.99');
    }
    if (nextStatus === SubjectStatus.DESAPROBADA && courseGrade >= 4) {
      throw new BadRequestException('Para quedar desaprobada la nota de cursada debe ser menor a 4');
    }
  }

  private async getTransitionWarnings(
    userId: string,
    currentSubject: any,
    nextStatus: SubjectStatus,
    courseGrade?: number,
  ): Promise<TransitionWarning[]> {
    const warnings: TransitionWarning[] = [];
    const currentStatus = currentSubject.status as SubjectStatus;

    if (currentStatus === nextStatus) return warnings;

    if (this.approvedStatuses.has(currentStatus) && !this.approvedStatuses.has(nextStatus)) {
      warnings.push({
        code: 'REOPEN_APPROVED_SUBJECT',
        severity: 'warn',
        message: 'Esta materia dejará de computar como aprobada y puede bloquear correlativas.',
      });
    }

    if (
      (currentStatus === SubjectStatus.APROBADA || currentStatus === SubjectStatus.PROMOCIONADA) &&
      nextStatus === SubjectStatus.REGULARIZADA
    ) {
      warnings.push({
        code: 'REQUIRES_FINAL_AGAIN',
        severity: 'warn',
        message: 'La materia volverá a requerir instancia final para quedar aprobada.',
      });
    }

    if (nextStatus === SubjectStatus.PENDIENTE && currentStatus !== SubjectStatus.PENDIENTE) {
      warnings.push({
        code: 'RESET_ACADEMIC_PROGRESS',
        severity: 'warn',
        message: 'Volver a pendiente elimina el avance académico actual de la materia.',
      });
    }

    if (courseGrade !== undefined && (courseGrade < 0 || courseGrade > 10)) {
      warnings.push({
        code: 'INVALID_GRADE_RANGE',
        severity: 'warn',
        message: 'La nota de cursada debe estar entre 0 y 10.',
      });
    }
    if (courseGrade !== undefined) {
      if (nextStatus === SubjectStatus.PROMOCIONADA && courseGrade < 7) {
        warnings.push({
          code: 'PROMOTION_GRADE_MISMATCH',
          severity: 'warn',
          message: 'Promocionada normalmente requiere nota de cursada 7 o más.',
        });
      }
      if (nextStatus === SubjectStatus.REGULARIZADA && (courseGrade < 4 || courseGrade >= 7)) {
        warnings.push({
          code: 'REGULAR_GRADE_MISMATCH',
          severity: 'warn',
          message: 'Regularizada normalmente requiere nota entre 4 y 6.99.',
        });
      }
      if (nextStatus === SubjectStatus.DESAPROBADA && courseGrade >= 4) {
        warnings.push({
          code: 'FAILED_GRADE_MISMATCH',
          severity: 'warn',
          message: 'Desaprobada normalmente requiere nota menor a 4.',
        });
      }
    }

    if (nextStatus === SubjectStatus.EN_CURSO || nextStatus === SubjectStatus.RECURSANDO) {
      const enrollmentWarnings = await this.getEnrollmentPrerequisiteWarnings(userId, currentSubject.careerSubjectId);
      warnings.push(...enrollmentWarnings);
    }

    if (nextStatus === SubjectStatus.PROMOCIONADA || nextStatus === SubjectStatus.APROBADA) {
      const closingWarnings = await this.getClosingPrerequisiteWarnings(userId, currentSubject.careerSubjectId);
      warnings.push(...closingWarnings);
    }
    const breaksCorrelative = this.approvedStatuses.has(currentStatus) && !this.approvedStatuses.has(nextStatus);
    if (breaksCorrelative) {
      const affectedClosedSubjects = await this.prisma.studentSubject.count({
        where: {
          userId,
          status: { in: [SubjectStatus.PROMOCIONADA, SubjectStatus.APROBADA] },
          careerSubject: {
            prerequisites: {
              some: { id: currentSubject.careerSubjectId },
            },
          },
        },
      });

      if (affectedClosedSubjects > 0) {
        warnings.push({
          code: 'CORRELATIVE_BREAK_RISK',
          severity: 'warn',
          message: `El cambio puede afectar ${affectedClosedSubjects} materia(s) posterior(es) ya cerrada(s).`,
        });
      }
    }

    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    if (new Date(currentSubject.updatedAt).getTime() >= fiveMinutesAgo) {
      warnings.push({
        code: 'RECENT_CORRECTION',
        severity: 'info',
        message: 'Se detectaron cambios recientes. Revisá la transición antes de confirmar.',
      });
    }

    return warnings;
  }
  private async getEnrollmentPrerequisiteWarnings(
    userId: string,
    careerSubjectId: string,
  ): Promise<TransitionWarning[]> {
    const careerSubject = await this.prisma.careerSubject.findUnique({
      where: { id: careerSubjectId },
      include: {
        prerequisites: { include: { subject: true } },
      },
    });
    if (!careerSubject) return [];

    const warnings: TransitionWarning[] = [];
    for (const prereq of careerSubject.prerequisites) {
      const studentPrereq = await this.prisma.studentSubject.findFirst({
        where: { userId, careerSubjectId: prereq.id },
      });

      const isEligible =
        studentPrereq &&
        (studentPrereq.status === SubjectStatus.REGULARIZADA ||
          studentPrereq.status === SubjectStatus.PROMOCIONADA ||
          studentPrereq.status === SubjectStatus.APROBADA);

      if (!isEligible) {
        warnings.push({
          code: 'ENROLLMENT_PREREQ_RISK',
          severity: 'warn',
          message: `Advertencia: ${prereq.subject.name} no cumple correlativa de cursada.`,
        });
      }
    }

    return warnings;
  }

  private async getClosingPrerequisiteWarnings(
    userId: string,
    careerSubjectId: string,
  ): Promise<TransitionWarning[]> {
    const careerSubject = await this.prisma.careerSubject.findUnique({
      where: { id: careerSubjectId },
      include: {
        prerequisites: { include: { subject: true } },
      },
    });
    if (!careerSubject) return [];

    const warnings: TransitionWarning[] = [];
    for (const prereq of careerSubject.prerequisites) {
      const studentPrereq = await this.prisma.studentSubject.findFirst({
        where: { userId, careerSubjectId: prereq.id },
      });

      const isEligible =
        studentPrereq &&
        (studentPrereq.status === SubjectStatus.PROMOCIONADA || studentPrereq.status === SubjectStatus.APROBADA);

      if (!isEligible) {
        warnings.push({
          code: 'CLOSING_PREREQ_RISK',
          severity: 'warn',
          message: `Advertencia: ${prereq.subject.name} no está aprobada/promocionada para cierre.`,
        });
      }
    }

    return warnings;
  }
}
