import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SubjectStatus } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../types/express';
import { StudentSubjectsService } from './student-subjects.service';

class UpdateStatusDto {
  @IsEnum(SubjectStatus)
  status: SubjectStatus;

  @IsOptional()
  @IsNumber()
  courseGrade?: number;

  @IsOptional()
  @IsNumber()
  completionYear?: number;

  @IsOptional()
  @IsNumber()
  completionPeriod?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  attemptCount?: number;
}

class ResetSubjectDto {
  @IsOptional()
  resetAttempts?: boolean;
}

class RegisterGradeDto {
  @IsNumber()
  grade: number;

  @IsOptional()
  @IsNumber()
  completionYear?: number;

  @IsOptional()
  @IsNumber()
  completionPeriod?: number;
}

@ApiTags('My Subjects')
@Controller('my-subjects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StudentSubjectsController {
  constructor(private readonly service: StudentSubjectsService) {}

  @Get()
  @ApiOperation({ summary: 'US-02: Listar todas mis materias' })
  async findAll(@Req() req: RequestWithUser) {
    return this.service.findAll(req.user.userId);
  }

  @Get('eligible')
  @ApiOperation({ summary: 'RN2: Obtener materias habilitadas para cursar' })
  async getEligible(@Req() req: RequestWithUser) {
    return this.service.getEligibleSubjects(req.user.userId);
  }

  @Get('bottlenecks')
  @ApiOperation({ summary: 'Caso 2: Detectar cuellos de botella' })
  async getBottlenecks(@Req() req: RequestWithUser) {
    return this.service.getBottleneckSubjects(req.user.userId);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Obtener alertas críticas del usuario' })
  async getAlerts(@Req() req: RequestWithUser) {
    return this.service.getAlerts(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una materia' })
  async findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.service.findOne(req.user.userId, id);
  }

  @Post(':id/status/preview')
  @ApiOperation({ summary: 'Previsualizar advertencias antes de cambiar estado' })
  async previewStatusChange(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.service.previewStatusChange(req.user.userId, id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'US-02: Cambiar estado de materia' })
  async updateStatus(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.service.updateStatus(req.user.userId, id, dto);
  }

  @Post(':id/final')
  @ApiOperation({ summary: 'RN3: Registrar nota final' })
  async registerFinal(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: RegisterGradeDto,
  ) {
    return this.service.registerFinalGrade(
      req.user.userId,
      id,
      dto.grade,
      dto.completionYear,
      dto.completionPeriod,
    );
  }

  @Post(':id/retake')
  @ApiOperation({ summary: 'US-09: Marcar como recursando' })
  async retake(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.service.markAsRetaking(req.user.userId, id);
  }

  @Post(':id/reset')
  @ApiOperation({ summary: 'Reiniciar materia al estado inicial (PENDIENTE)' })
  async reset(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: ResetSubjectDto,
  ) {
    return this.service.resetSubject(req.user.userId, id, dto.resetAttempts);
  }
}
