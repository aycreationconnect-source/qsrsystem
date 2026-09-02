import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.validateAdmin(dto);
  }

  @Get('me')
  getProfile(@Query('username') username: string) {
    return this.authService.getAdminProfile(username);
  }
}
