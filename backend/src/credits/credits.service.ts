import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CreditsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.credit.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }

  async create(
    userId: string,
    data: {
      category: string;
      activity: string;
      credits: number;
    },
  ) {
    return this.prisma.credit.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async delete(userId: string, id: string) {
    return this.prisma.credit.deleteMany({
      where: {
        id,
        userId,
      },
    });
  }
}
