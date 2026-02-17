import { Injectable } from '@nestjs/common';
import { SubjectStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';

/**
 * Servicio para validar correlatividades académicas (RN2, RN8)
 * 
 * RN2: Para cursar una materia, todas sus correlativas deben estar aprobadas
 * RN8: Para rendir final, la materia debe estar regularizada y sus correlativas finales aprobadas
 */
@Injectable()
export class CorrelativitiesService {
  constructor(private prisma: PrismaService) {}

  /**
   * RN2: Verifica si un usuario puede cursar una materia
   * Requisito: Todas las correlativas para cursar deben estar APROBADAS
   */
  async canEnroll(userId: string, subjectId: string): Promise<{
    canEnroll: boolean;
    missingPrerequisites: string[];
  }> {
    // Obtener la materia con sus correlativas
    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        prerequisites: true,
      },
    });

    if (!subject) {
      throw new Error(`Subject not found: ${subjectId}`);
    }

    // Si no tiene correlativas, puede cursar
    if (subject.prerequisites.length === 0) {
      return { canEnroll: true, missingPrerequisites: [] };
    }

    //Obtener todas las materias del usuario
    const userSubjects = await this.prisma.subject.findMany({
      where: {
        userId,
        code: {
          in: subject.prerequisites.map((p) => p.code),
        },
      },
    });

    // Verificar cuáles están aprobadas
    const approvedCodes = new Set(
      userSubjects
        .filter((s) => s.status === SubjectStatus.APROBADA)
        .map((s) => s.code)
    );

    const missingPrerequisites = subject.prerequisites
      .filter((p) => !approvedCodes.has(p.code))
      .map((p) => p.name);

    return {
      canEnroll: missingPrerequisites.length === 0,
      missingPrerequisites,
    };
  }

  /**
   * RN8: Verifica si un usuario puede rendir el final de una materia
   * Requisitos:
   * 1. La materia debe estar REGULARIZADA
   * 2. Todas las correlativas para final deben estar APROBADAS
   */
  async canTakeFinal(userId: string, subjectId: string): Promise<{
    canTakeFinal: boolean;
    reason?: string;
    missingPrerequisites?: string[];
  }> {
    // Obtener la materia del usuario
    const userSubject = await this.prisma.subject.findFirst({
      where: {
        id: subjectId,
        userId,
      },
      include: {
        prerequisites: true,
      },
    });

    if (!userSubject) {
      return {
        canTakeFinal: false,
        reason: 'No estás cursando esta materia',
      };
    }

    // Verificar que esté regularizada
    if (userSubject.status !== SubjectStatus.REGULARIZADA) {
      return {
        canTakeFinal: false,
        reason: `La materia debe estar regularizada (estado actual: ${userSubject.status})`,
      };
    }

    // Verificar correlativas para final (mismo criterio que RN2)
    const { canEnroll, missingPrerequisites } = await this.canEnroll(
      userId,
      subjectId
    );

    if (!canEnroll) {
      return {
        canTakeFinal: false,
        reason: 'Faltan correlativas para rendir el final',
        missingPrerequisites,
      };
    }

    return { canTakeFinal: true };
  }

  /**
   * Obtiene el estado de habilitación de una materia para un usuario
   */
  async getSubjectStatus(userId: string, subjectId: string) {
    const enrollmentStatus = await this.canEnroll(userId, subjectId);
    const finalStatus = await this.canTakeFinal(userId, subjectId);

    return {
      canEnroll: enrollmentStatus.canEnroll,
      canTakeFinal: finalStatus.canTakeFinal,
      enrollmentReason: enrollmentStatus.missingPrerequisites,
      finalReason: finalStatus.reason || finalStatus.missingPrerequisites,
    };
  }
}
