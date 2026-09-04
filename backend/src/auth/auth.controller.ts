import { Controller, Post, Get, Body, Headers, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService, LoginDto, CreateStaffDto } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    if (result && result.token) {
      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('pos_jwt_token', result.token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
        maxAge: 12 * 60 * 60 * 1000, // 12 hours
      });
    }
    return result;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('pos_jwt_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
    });
    return { success: true, message: 'Logged out successfully' };
  }

  @Get('me')
  getProfile(
    @Req() req: Request,
    @Headers('authorization') authHeader?: string,
  ) {
    const token = (req.cookies && req.cookies['pos_jwt_token']) || authHeader;
    return this.authService.getProfile(token);
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
