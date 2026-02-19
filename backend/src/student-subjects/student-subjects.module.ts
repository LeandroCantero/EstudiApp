import { Module } from '@nestjs/common';
import { StudentSubjectsService } from './student-subjects.service';
import { StudentSubjectsController } from './student-subjects.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [StudentSubjectsController],
  providers: [StudentSubjectsService, PrismaService],
  exports: [StudentSubjectsService],
})
export class StudentSubjectsModule {}
