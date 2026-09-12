import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  private formatCategory(cat: any) {
    if (!cat) return cat;
    let subcategories: string[] = [];
    if (cat.subcategories) {
      try {
        const parsed = JSON.parse(cat.subcategories);
        subcategories = Array.isArray(parsed) ? parsed : [];
      } catch {
        subcategories = typeof cat.subcategories === 'string'
          ? cat.subcategories.split(',').map((s: string) => s.trim()).filter(Boolean)
          : [];
      }
    }
    const { displayOrder, ...rest } = cat;
    return {
      ...rest,
      subcategories,
    };
  }

  private serializeSubcategories(subcategories: any): string | null {
    if (!subcategories) return null;
    if (Array.isArray(subcategories)) {
      const filtered = subcategories.map((s) => String(s).trim()).filter(Boolean);
      return filtered.length > 0 ? JSON.stringify(filtered) : null;
    }
    if (typeof subcategories === 'string') {
      const parts = subcategories.split(',').map((s) => s.trim()).filter(Boolean);
      return parts.length > 0 ? JSON.stringify(parts) : null;
    }
    return null;
  }

  async create(data: any) {
    const { subcategories, parentId, parentName, displayOrder, ...categoryData } = data;
    const subcatsSerialized = this.serializeSubcategories(subcategories);

    const created = await this.prisma.category.create({
      data: {
        ...categoryData,
        subcategories: subcatsSerialized,
      },
    });

    return this.formatCategory(created);
  }

  async findAll() {
    const categories = await this.prisma.category.findMany({
      orderBy: { id: 'asc' },
    });
    return categories.map((c) => this.formatCategory(c));
  }

  async update(id: number, data: any) {
    const { subcategories, parentId, parentName, id: catId, displayOrder, ...categoryData } = data;
    const updateData: any = { ...categoryData };

    if (subcategories !== undefined) {
      updateData.subcategories = this.serializeSubcategories(subcategories);
    }

    const updated = await this.prisma.category.update({
      where: { id },
      data: updateData,
    });

    return this.formatCategory(updated);
  }

  async addSubcategory(id: number, subcategoryName: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new Error('Category not found');
    const formatted = this.formatCategory(category);
    const existing: string[] = formatted.subcategories || [];
    const trimmed = (subcategoryName || '').trim();
    if (!trimmed || existing.includes(trimmed)) return formatted;
    const updated = [...existing, trimmed];
    return this.update(id, { subcategories: updated });
  }

  async removeSubcategory(id: number, subcategoryName: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new Error('Category not found');
    const formatted = this.formatCategory(category);
    const existing: string[] = formatted.subcategories || [];
    const updated = existing.filter((s) => s !== (subcategoryName || '').trim());
    return this.update(id, { subcategories: updated });
  }
}
