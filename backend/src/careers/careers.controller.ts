import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CareersService } from './careers.service';

@ApiTags('Careers')
@Controller('careers')
export class CareersController {
  constructor(private readonly careersService: CareersService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las carreras disponibles' })
  @ApiResponse({ status: 200, description: 'Lista de carreras recuperada con éxito.' })
  async findAll() {
    return this.careersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalles de una carrera específica' })
  async findOne(@Param('id') id: string) {
    return this.careersService.findOne(id);
  }
}
