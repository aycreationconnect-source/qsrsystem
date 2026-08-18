import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async resetDatabase() {
    // Delete in order to respect foreign key constraints
    await this.prisma.orderItem.deleteMany({});
    await this.prisma.order.deleteMany({});
    await this.prisma.recipeIngredient.deleteMany({});
    await this.prisma.inventoryHistory.deleteMany({});
    await this.prisma.menuItem.deleteMany({});
    await this.prisma.category.deleteMany({});
    await this.prisma.inventoryItem.deleteMany({});
    await this.prisma.table.deleteMany({});
    await this.prisma.area.deleteMany({});
    return { success: true, message: 'Database reset successfully' };
  }
}
