import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ExamsService {
  constructor(private prisma: PrismaService) {}

  async findBySubject(studentSubjectId: string) {
    return this.prisma.exam.findMany({
      where: { studentSubjectId },
      orderBy: { date: 'asc' },
    });
  }

  async create(
    userId: string,
    studentSubjectId: string,
    data: {
      type: string;
      date?: string | Date;
      grade?: number;
    },
  ) {
    const studentSubject = await this.prisma.studentSubject.findUnique({
      where: { id: studentSubjectId },
      include: {
        careerSubject: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (!studentSubject) {
      throw new NotFoundException('Materia del estudiante no encontrada');
    }

    if (studentSubject.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para esta materia');
    }

    // 1. Crear el examen en la DB
    const examDate = data.date ? new Date(data.date) : null;
    
    // 2. Si hay fecha, crear evento en el calendario
    let eventId = null;
    if (examDate) {
      const event = await this.prisma.event.create({
        data: {
          userId,
          studentSubjectId,
          title: `${data.type}: ${studentSubject.careerSubject.subject.name}`,
          type: 'parcial',
          date: examDate,
        },
      });
      eventId = event.id;
    }

    return this.prisma.exam.create({
      data: {
        studentSubjectId,
        type: data.type,
        date: examDate,
        grade: data.grade !== undefined ? Math.round(data.grade * 100) / 100 : null,
        eventId,
      },
    });
  }

  async update(
    userId: string,
    id: string,
    data: {
      type?: string;
      date?: string | Date;
      grade?: number;
    },
  ) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        studentSubject: {
          include: {
            careerSubject: {
              include: { subject: true },
            },
          },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException('Examen no encontrado');
    }

    if (exam.studentSubject.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para este examen');
    }

    const updateData: any = { ...data };
    if (data.date) updateData.date = new Date(data.date);
    if (data.grade !== undefined) updateData.grade = Math.round(data.grade * 100) / 100;

    // Sincronizar con calendario
    if (data.hasOwnProperty('date') || data.type) {
      const newDate = data.date ? new Date(data.date) : (data.date === '' ? null : exam.date);
      const newType = data.type || exam.type;

      if (newDate) {
        if (exam.eventId) {
          // Actualizar evento existente
          await this.prisma.event.update({
            where: { id: exam.eventId },
            data: {
              date: newDate,
              title: `${newType}: ${exam.studentSubject.careerSubject.subject.name}`,
            },
          });
        } else {
          // Crear evento nuevo si ahora tiene fecha
          const event = await this.prisma.event.create({
            data: {
              userId,
              studentSubjectId: exam.studentSubjectId,
              title: `${newType}: ${exam.studentSubject.careerSubject.subject.name}`,
              type: 'parcial',
              date: newDate,
            },
          });
          updateData.eventId = event.id;
        }
      } else if (exam.eventId && (data.date === '' || data.date === null)) {
        // Eliminar evento si se quitó la fecha
        await this.prisma.event.delete({ where: { id: exam.eventId } }).catch(() => {});
        updateData.eventId = null;
      }
    }

    return this.prisma.exam.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(userId: string, id: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: { studentSubject: true },
    });

    if (!exam) {
      throw new NotFoundException('Examen no encontrado');
    }

    if (exam.studentSubject.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para este examen');
    }

    // Eliminar evento vinculado si existe
    if (exam.eventId) {
      await this.prisma.event.delete({
        where: { id: exam.eventId },
      }).catch(() => console.log('El evento ya no existía'));
    }

    return this.prisma.exam.delete({
      where: { id },
    });
  }
}
