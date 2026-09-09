import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const categoryName = data.category || data.categoryName || 'General';
    let categoryId = data.categoryId;

    if (!categoryId && categoryName) {
      let cat = await this.prisma.inventoryCategory.findUnique({ where: { name: categoryName } });
      if (!cat) {
        cat = await this.prisma.inventoryCategory.create({ data: { name: categoryName } });
      }
      categoryId = cat.id;
    }

    return this.prisma.inventoryItem.create({
      data: {
        name: data.item || data.name,
        unit: data.unit || 'pcs',
        stock: parseFloat(data.stock) || 0,
        threshold: parseFloat(data.threshold) || 0,
        status: data.status || 'Good',
        categoryName: categoryName,
        categoryId: categoryId || null,
      },
    });
  }

  async findAll() {
    const items = await this.prisma.inventoryItem.findMany({
      include: { history: true, category: true },
      orderBy: { id: 'desc' },
    });

    // Map to frontend expected format
    return items.map((i) => ({
      id: i.id,
      item: i.name,
      unit: i.unit,
      stock: i.stock,
      threshold: i.threshold,
      status: i.status,
      category: i.category?.name || i.categoryName || 'General',
      categoryId: i.categoryId,
      history: i.history,
    }));
  }

  findOne(id: number) {
    return this.prisma.inventoryItem.findUnique({ where: { id }, include: { category: true, history: true } });
  }

  async update(id: number, data: any) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id } });
    if (!item) throw new Error('Not found');

    const stockVal = data.stock !== undefined ? parseFloat(data.stock) : item.stock;
    const threshVal = data.threshold !== undefined ? parseFloat(data.threshold) : item.threshold;
    const stockChange = stockVal - item.stock;

    const categoryName = data.category || data.categoryName;
    let categoryId = data.categoryId;
    if (categoryName && !categoryId) {
      let cat = await this.prisma.inventoryCategory.findUnique({ where: { name: categoryName } });
      if (!cat) {
        cat = await this.prisma.inventoryCategory.create({ data: { name: categoryName } });
      }
      categoryId = cat.id;
    }

    const updated = await this.prisma.inventoryItem.update({
      where: { id },
      data: {
        stock: stockVal,
        threshold: threshVal,
        status: stockVal <= threshVal ? (stockVal <= 0 ? 'Out of Stock' : 'Low Stock') : 'Good',
        ...(categoryName !== undefined && { categoryName, categoryId: categoryId || null }),
        ...(data.name || data.item ? { name: data.name || data.item } : {}),
        ...(data.unit ? { unit: data.unit } : {}),
      },
    });

    if (stockChange !== 0) {
      await this.prisma.inventoryHistory.create({
        data: {
          inventoryId: id,
          change: stockChange > 0 ? `+${stockChange}` : `${stockChange}`,
          type: 'Manual Adjustment',
        },
      });
    }

    return updated;
  }

  remove(id: number) {
    return this.prisma.inventoryItem.delete({ where: { id } });
  }

  // Inventory Category Management
  async getCategories() {
    const count = await this.prisma.inventoryCategory.count();
    if (count === 0) {
      const defaults = ['General', 'Dairy', 'Bakery', 'Beverages', 'Produce', 'Packaging', 'Spices & Dry Goods'];
      for (const name of defaults) {
        await this.prisma.inventoryCategory.create({ data: { name } });
      }
    }

    const categories = await this.prisma.inventoryCategory.findMany({
      include: {
        items: {
          select: { id: true, stock: true, threshold: true },
        },
      },
      orderBy: { id: 'asc' },
    });

    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      itemCount: c.items.length,
      lowStockCount: c.items.filter((i) => i.stock <= i.threshold).length,
    }));
  }

  async createCategory(data: { name: string; description?: string }) {
    const trimmed = data.name.trim();
    const existing = await this.prisma.inventoryCategory.findUnique({ where: { name: trimmed } });
    if (existing) return existing;
    return this.prisma.inventoryCategory.create({
      data: {
        name: trimmed,
        description: data.description || null,
      },
    });
  }

  async deleteCategory(id: number) {
    const cat = await this.prisma.inventoryCategory.findUnique({ where: { id } });
    if (cat) {
      await this.prisma.inventoryItem.updateMany({
        where: { categoryId: id },
        data: { categoryId: null, categoryName: 'General' },
      });
      return this.prisma.inventoryCategory.delete({ where: { id } });
    }
    return { success: true };
  }
}
