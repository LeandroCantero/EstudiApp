import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../types/express';
import { ExamsService } from './exams.service';

class CreateExamDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsOptional()
  date?: string;

  @IsOptional()
  @IsNumber()
  grade?: number;
}

class UpdateExamDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  date?: string;

  @IsOptional()
  @IsNumber()
  grade?: number;
}

@ApiTags('Exams')
@Controller('exams')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExamsController {
  constructor(private readonly service: ExamsService) {}

  @Get('subject/:studentSubjectId')
  @ApiOperation({ summary: 'Obtener exámenes de una materia' })
  async findBySubject(@Param('studentSubjectId') studentSubjectId: string) {
    return this.service.findBySubject(studentSubjectId);
  }

  @Post('subject/:studentSubjectId')
  @ApiOperation({ summary: 'Registrar un nuevo examen/nota' })
  async create(
    @Req() req: RequestWithUser,
    @Param('studentSubjectId') studentSubjectId: string,
    @Body() dto: CreateExamDto,
  ) {
    return this.service.create(req.user.userId, studentSubjectId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un examen' })
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateExamDto,
  ) {
    return this.service.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un examen' })
  async delete(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.service.delete(req.user.userId, id);
  }
}
