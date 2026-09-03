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

  @Get('profile')
  async getStoreProfile() {
    return this.prisma.storeProfile.findFirst();
  }

  @Post('profile')
  async updateStoreProfile(@Body() body: any) {
    const existing = await this.prisma.storeProfile.findFirst();
    if (!existing) {
      return { success: false, message: 'Store profile not found' };
    }
    const updated = await this.prisma.storeProfile.update({
      where: { id: existing.id },
      data: {
        businessName: body.businessName !== undefined ? body.businessName : existing.businessName,
        ownerName: body.ownerName !== undefined ? body.ownerName : existing.ownerName,
        phone: body.phone !== undefined ? body.phone : existing.phone,
        email: body.email !== undefined ? body.email : existing.email,
        city: body.city !== undefined ? body.city : existing.city,
        state: body.state !== undefined ? body.state : existing.state,
        address: body.address !== undefined ? body.address : existing.address,
        gstin: body.gstin !== undefined ? body.gstin : existing.gstin,
        receiptFooter: body.receiptFooter !== undefined ? body.receiptFooter : existing.receiptFooter,
        logoUrl: body.logoUrl !== undefined ? body.logoUrl : existing.logoUrl,
      },
    });
    return { success: true, store: updated };
  }
}
