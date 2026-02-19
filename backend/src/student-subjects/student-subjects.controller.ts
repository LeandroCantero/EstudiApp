import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StudentSubjectsService } from './student-subjects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubjectStatus } from '../prisma-client.mock';
import { RequestWithUser } from '../types/express';

class UpdateStatusDto {
  status: SubjectStatus;
}

class RegisterGradeDto {
  grade: number;
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

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una materia' })
  async findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.service.findOne(req.user.userId, id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'US-02: Cambiar estado de materia' })
  async updateStatus(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.service.updateStatus(req.user.userId, id, dto.status);
  }

  @Post(':id/final')
  @ApiOperation({ summary: 'RN3: Registrar nota final' })
  async registerFinal(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: RegisterGradeDto,
  ) {
    return this.service.registerFinalGrade(req.user.userId, id, dto.grade);
  }

  @Post(':id/retake')
  @ApiOperation({ summary: 'US-09: Marcar como recursando' })
  async retake(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.service.markAsRetaking(req.user.userId, id);
  }
}
