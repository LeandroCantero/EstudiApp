import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CorrelativitiesService } from './correlativities.service';
import { SubjectsController } from './subjects.controller';
import { SubjectsService } from './subjects.service';

@Module({
  controllers: [SubjectsController],
  providers: [SubjectsService, CorrelativitiesService, PrismaService],
  exports: [SubjectsService, CorrelativitiesService],
})
export class SubjectsModule {}
