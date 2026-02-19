import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../types/express';

class CreateEventDto {
  title: string;
  type: string;
  date: Date;
  description?: string;
  studentSubjectId?: string;
}

@ApiTags('Calendar')
@Controller('calendar')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EventsController {
  constructor(private readonly service: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener eventos del calendario' })
  async findAll(
    @Req() req: RequestWithUser,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.findAll(
      req.user.userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Post('events')
  @ApiOperation({ summary: 'Crear evento' })
  async create(@Req() req: RequestWithUser, @Body() dto: CreateEventDto) {
    return this.service.create(req.user.userId, dto);
  }

  @Delete('events/:id')
  @ApiOperation({ summary: 'Eliminar evento' })
  async delete(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.service.delete(req.user.userId, id);
  }
}
