import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ImportService } from './import.service';

@Module({
  providers: [ImportService, PrismaService],
  exports: [ImportService],
})
export class ImportModule {}
