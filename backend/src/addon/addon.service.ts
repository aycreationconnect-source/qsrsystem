import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AddonService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.addon.create({
      data: {
        name: data.name,
        description: data.description || null,
        price: parseFloat(String(data.price).replace('₹', '') || '0'),
      },
    });
  }

  async findAll() {
    return this.prisma.addon.findMany({ orderBy: { id: 'asc' } });
  }

  async update(id: number, data: any) {
    return this.prisma.addon.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && { price: parseFloat(String(data.price).replace('₹', '') || '0') }),
      },
    });
  }

  async remove(id: number) {
    return this.prisma.addon.delete({ where: { id } });
  }
}
