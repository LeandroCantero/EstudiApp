import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../types/express';
import { CreditsService } from './credits.service';

import { CreateCreditDto } from './dto/create-credit.dto';

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
