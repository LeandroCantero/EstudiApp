import { Injectable } from '@nestjs/common';
import { SubjectStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ImportService {
  constructor(private prisma: PrismaService) {}

  /**
   * Importa un plan de estudios completo para un usuario específico.
   * Las materias se crean como PENDIENTE por defecto.
   */
  async importCareerPlan(userId: string, careerId: string, planData: any) {
    console.log(`🚀 Iniciando importación de carrera ${careerId} para usuario ${userId}`);

    // 1. Limpiar materias previas si existen (Evitamos duplicados en el dashboard)
    await this.prisma.subject.deleteMany({
      where: { userId }
    });

    // 2. Primera pasada: Crear todas las materias sin relaciones
    const subjectsMap = new Map<string, string>(); // Nombre -> ID

    for (const s of planData.subjects) {
      const created = await this.prisma.subject.create({
        data: {
          name: s.name,
          code: s.code,
          credits: s.credits || 0,
          status: SubjectStatus.PENDIENTE,
          userId: userId,
          careerId: careerId,
          year: s.year,
          period: s.period,
        },
      });
      subjectsMap.set(s.name, created.id);
    }

    // 3. Segunda pasada: Establecer relaciones de correlatividad
    let relationsCount = 0;
    for (const s of planData.subjects) {
      if (s.prerequisites && s.prerequisites.length > 0) {
        const currentId = subjectsMap.get(s.name);
        const prereqIds = s.prerequisites
          .map((pName: string) => subjectsMap.get(pName))
          .filter((id: string | undefined) => id !== undefined);

        if (prereqIds.length > 0) {
          await this.prisma.subject.update({
            where: { id: currentId },
            data: {
              prerequisites: {
                connect: prereqIds.map((id: string) => ({ id })),
              },
            } as any,
          });
          relationsCount += prereqIds.length;
        }
      }
    }

    console.log(`✅ Importación finalizada: ${planData.subjects.length} materias, ${relationsCount} correlatividades.`);
    
    // Actualizar la carrera del usuario
    await this.prisma.user.update({
      where: { id: userId },
      data: { careerId }
    });

    return {
      subjectsCount: planData.subjects.length,
      correlativitiesCount: relationsCount
    };
  }
}
