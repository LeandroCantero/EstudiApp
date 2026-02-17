import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createSubjectDto: CreateSubjectDto) {
    return this.prisma.subject.create({
      data: createSubjectDto,
    });
  }

  async findAll(userId: string) {
    return this.prisma.subject.findMany({
      where: { userId },
      orderBy: [
        { year: 'asc' },
        { period: 'asc' },
      ],
    });
  }

  async findOne(id: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
    });
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }
    return subject;
  }

  async update(id: string, updateSubjectDto: UpdateSubjectDto) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { userId, ...data } = updateSubjectDto;
      return await this.prisma.subject.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.subject.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }
  }

  async getMetrics(userId: string) {
    const subjects = await this.prisma.subject.findMany({
      where: { userId },
    });

    const total = subjects.length;
    const approved = subjects.filter(s => s.status === 'APROBADA').length;
    const progress = total > 0 ? (approved / total) * 100 : 0;

    const grades = subjects
      .filter(s => s.status === 'APROBADA' && s.grade)
      .map(s => s.grade as number);
    
    const average = grades.length > 0 
      ? grades.reduce((acc, curr) => acc + curr, 0) / grades.length 
      : 0;

    return {
      total,
      approved,
      progress: Math.round(progress),
      average: Number(average.toFixed(2)),
    };
  }
}
