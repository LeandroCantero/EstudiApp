import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async findBySubject(studentSubjectId: string) {
    return this.prisma.note.findMany({
      where: { studentSubjectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(
    studentSubjectId: string,
    data: {
      title?: string;
      content?: string;
      url?: string;
    },
  ) {
    return this.prisma.note.create({
      data: {
        ...data,
        studentSubjectId,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.note.delete({
      where: { id },
    });
  }
}
