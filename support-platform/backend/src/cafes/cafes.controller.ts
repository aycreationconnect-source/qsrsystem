import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { CafesService } from './cafes.service';
import { RegisterCafeDto } from './dto/register-cafe.dto';
import { RenewCafeDto } from './dto/renew-cafe.dto';

@Controller('cafes')
export class CafesController {
  constructor(private readonly cafesService: CafesService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('city') city?: string,
  ) {
    return this.cafesService.findAll({ search, status, city });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cafesService.findOne(id);
  }

  @Post('register')
  register(@Body() dto: RegisterCafeDto) {
    return this.cafesService.register(dto);
  }

  @Post(':id/renew')
  renew(@Param('id') id: string, @Body() dto: RenewCafeDto) {
    return this.cafesService.renew(id, dto);
  }

  @Post(':id/toggle-status')
  toggleStatus(
    @Param('id') id: string,
    @Body() body: { action: 'BLOCK' | 'UNBLOCK'; reason?: string },
  ) {
    return this.cafesService.toggleStatus(id, body.action, body.reason);
  }

  @Post(':id/regenerate-key')
  regenerateKey(@Param('id') id: string) {
    return this.cafesService.regenerateKey(id);
  }
}
