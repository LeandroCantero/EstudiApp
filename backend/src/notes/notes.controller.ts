import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class CreateNoteDto {
  title?: string;
  content?: string;
  url?: string;
}

@ApiTags('Notes')
@Controller('notes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotesController {
  constructor(private readonly service: NotesService) {}

  @Get('subject/:studentSubjectId')
  @ApiOperation({ summary: 'US-04: Obtener notas de una materia' })
  async findBySubject(@Param('studentSubjectId') studentSubjectId: string) {
    return this.service.findBySubject(studentSubjectId);
  }

  @Post('subject/:studentSubjectId')
  @ApiOperation({ summary: 'US-04: Crear nota/link en materia' })
  async create(
    @Param('studentSubjectId') studentSubjectId: string,
    @Body() dto: CreateNoteDto,
  ) {
    return this.service.create(studentSubjectId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar nota' })
  async delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
