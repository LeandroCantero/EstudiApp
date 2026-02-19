import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreditsService } from './credits.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../types/express';

class CreateCreditDto {
  category: string;
  activity: string;
  credits: number;
}

@ApiTags('Credits')
@Controller('credits')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CreditsController {
  constructor(private readonly service: CreditsService) {}

  @Get()
  @ApiOperation({ summary: 'US-05: Listar créditos extracurriculares' })
  async findAll(@Req() req: RequestWithUser) {
    return this.service.findAll(req.user.userId);
  }

  @Post()
  @ApiOperation({ summary: 'US-05: Registrar crédito extracurricular' })
  async create(@Req() req: RequestWithUser, @Body() dto: CreateCreditDto) {
    return this.service.create(req.user.userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar crédito' })
  async delete(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.service.delete(req.user.userId, id);
  }
}
