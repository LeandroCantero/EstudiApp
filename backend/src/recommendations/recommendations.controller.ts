import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestWithUser } from '../types/express';

@ApiTags('Recommendations')
@Controller('recommendations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RecommendationsController {
  constructor(private readonly service: RecommendationsService) {}

  @Get()
  @ApiOperation({ summary: 'US-03: Obtener recomendaciones de cursada (RN5)' })
  async getRecommendations(@Req() req: RequestWithUser) {
    return this.service.getRecommendations(req.user.userId);
  }
}
