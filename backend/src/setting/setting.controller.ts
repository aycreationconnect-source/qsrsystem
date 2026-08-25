import { Controller, Get, Post, Body } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('setting')
export class SettingController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getSettings() {
    const settings = await this.prisma.setting.findMany();
    return settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
  }

  @Post()
  async saveSettings(@Body() body: Record<string, string>) {
    for (const [key, value] of Object.entries(body)) {
      await this.prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
    return { success: true };
  }
}
