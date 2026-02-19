import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SimulatorService } from './simulator.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../types/express';
import { SubjectStatus } from '../prisma-client.mock';

class SimulateChangeDto {
  subjectId: string;
  newStatus: SubjectStatus;
}

class SimulateDto {
  changes: SimulateChangeDto[];
}

@ApiTags('Simulator')
@Controller('simulate')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SimulatorController {
  constructor(private readonly service: SimulatorService) {}

  @Post()
  @ApiOperation({ summary: 'US-08: Simular escenarios futuros (RN7)' })
  async simulate(@Req() req: RequestWithUser, @Body() dto: SimulateDto) {
    return this.service.simulate(req.user.userId, dto.changes);
  }
}
