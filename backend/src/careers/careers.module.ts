import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CareersImportService } from './careers-import.service';
import { CareersController } from './careers.controller';
import { CareersService } from './careers.service';

@Module({
  controllers: [CareersController],
  providers: [CareersService, CareersImportService, PrismaService],
  exports: [CareersService, CareersImportService],
})
export class CareersModule {}
