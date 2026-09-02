import { Controller, Post, Get, Body, Headers } from '@nestjs/common';
import { AuthService, LoginDto, CreateStaffDto } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  getProfile(@Headers('authorization') authHeader: string) {
    return this.authService.getProfile(authHeader);
  }

  @Get('staff')
  getStaff() {
    return this.authService.getStaff();
  }

  @Post('staff')
  createStaff(@Body() dto: CreateStaffDto) {
    return this.authService.createStaff(dto);
  }
}
