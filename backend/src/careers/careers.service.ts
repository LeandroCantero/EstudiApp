import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CareersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.career.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.career.findUnique({
      where: { id },
      include: {
        subjects: {
          include: {
            subject: true,
          },
          orderBy: [
            { year: 'asc' },
            { period: 'asc' },
          ]
        },
      },
    });
  }
}
