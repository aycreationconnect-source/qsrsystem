import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.inventoryItem.create({
      data: {
        name: data.item || data.name,
        unit: data.unit || 'pcs',
        stock: parseFloat(data.stock) || 0,
        threshold: parseFloat(data.threshold) || 0,
        status: data.status || 'Good'
      }
    });
  }

  async findAll() {
    const items = await this.prisma.inventoryItem.findMany({
      include: { history: true },
      orderBy: { id: 'desc' }
    });
    
    // Map to frontend expected format
    return items.map(i => ({
      id: i.id,
      item: i.name,
      unit: i.unit,
      stock: i.stock,
      threshold: i.threshold,
      status: i.status,
      history: i.history
    }));
  }

  findOne(id: number) {
    return this.prisma.inventoryItem.findUnique({ where: { id } });
  }

  async update(id: number, data: any) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id } });
    if (!item) throw new Error('Not found');
    
    const stockChange = parseFloat(data.stock) - item.stock;
    
    const updated = await this.prisma.inventoryItem.update({
      where: { id },
      data: {
        stock: parseFloat(data.stock),
        threshold: parseFloat(data.threshold),
        status: parseFloat(data.stock) <= parseFloat(data.threshold) ? 'Low Stock' : 'Good'
      }
    });

    if (stockChange !== 0) {
      await this.prisma.inventoryHistory.create({
        data: {
          inventoryId: id,
          change: stockChange > 0 ? `+${stockChange}` : `${stockChange}`,
          type: 'Manual Adjustment'
        }
      });
    }

    return updated;
  }

  remove(id: number) {
    return this.prisma.inventoryItem.delete({ where: { id } });
  }
}
