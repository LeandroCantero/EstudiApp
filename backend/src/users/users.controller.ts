import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../types/express';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Obtener el perfil del usuario autenticado' })
  async getProfile(@Req() req: RequestWithUser) {
    return this.usersService.getProfile(req.user.userId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Actualizar nombre o carrera del usuario' })
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body() data: { name?: string; careerId?: string }
  ) {
    return this.usersService.updateProfile(req.user.userId, data);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Obtener métricas principales del dashboard del usuario' })
  async getDashboard(@Req() req: RequestWithUser) {
    return this.usersService.getDashboardMetrics(req.user.userId);
  }

  @Get('credits')
  @ApiOperation({ summary: 'Obtener créditos extracurriculares del usuario' })
  async getCredits(@Req() req: RequestWithUser) {
    return this.usersService.getTotalCredits(req.user.userId);
  }
}
