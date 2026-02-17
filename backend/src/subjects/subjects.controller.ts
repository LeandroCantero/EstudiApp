import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { SubjectsService } from './subjects.service';

@ApiTags('subjects')
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva materia' })
  create(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectsService.create(createSubjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las materias de un usuario' })
  @ApiQuery({ name: 'userId', required: true })
  findAll(@Query('userId') userId: string) {
    return this.subjectsService.findAll(userId);
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Obtener métricas académicas (progreso, promedio)' })
  @ApiQuery({ name: 'userId', required: true })
  getMetrics(@Query('userId') userId: string) {
    return this.subjectsService.getMetrics(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una materia' })
  findOne(@Param('id') id: string) {
    return this.subjectsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una materia' })
  update(@Param('id') id: string, @Body() updateSubjectDto: UpdateSubjectDto) {
    return this.subjectsService.update(id, updateSubjectDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una materia' })
  remove(@Param('id') id: string) {
    return this.subjectsService.remove(id);
  }
}
