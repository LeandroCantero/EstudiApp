import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

class RegisterDto {
  email: string;
  password: string;
  name: string;
  careerId: string;
}

class LoginDto {
  email: string;
  password: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar nuevo usuario con carrera' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password, dto.name, dto.careerId);
  }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario actual' })
  async getMe(@Req() req: any) {
    return this.authService.getMe(req.user.userId);
  }
}
