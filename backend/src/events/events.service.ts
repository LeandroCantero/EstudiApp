import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, startDate?: Date, endDate?: Date) {
    const where: any = { userId };
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    return this.prisma.event.findMany({
      where,
      include: {
        studentSubject: {
          include: {
            careerSubject: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  async create(
    userId: string,
    data: {
      title: string;
      type: string;
      date: Date;
      description?: string;
      studentSubjectId?: string;
    },
  ) {
    return this.prisma.event.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async delete(userId: string, id: string) {
    return this.prisma.event.deleteMany({
      where: {
        id,
        userId,
      },
    });
  }
}
