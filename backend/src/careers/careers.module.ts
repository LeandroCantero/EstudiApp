import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CareersController } from './careers.controller';
import { CareersService } from './careers.service';

@Module({
  controllers: [CareersController],
  providers: [CareersService, PrismaService],
  exports: [CareersService],
})
export class CareersModule {}
