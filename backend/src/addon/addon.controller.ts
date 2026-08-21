import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AddonService } from './addon.service';

@Controller('addon')
export class AddonController {
  constructor(private readonly addonService: AddonService) {}

  @Post()
  create(@Body() body: any) {
    return this.addonService.create(body);
  }

  @Get()
  findAll() {
    return this.addonService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.addonService.update(+id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.addonService.remove(+id);
  }
}
