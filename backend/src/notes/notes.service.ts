import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async findBySubject(studentSubjectId: string) {
    return this.prisma.subjectNote.findMany({
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
    return this.prisma.subjectNote.create({
      data: {
        ...data,
        studentSubjectId,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.subjectNote.delete({
      where: { id },
    });
  }
}
