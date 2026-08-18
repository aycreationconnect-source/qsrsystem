import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.category.create({ data });
  }

  findAll() {
    return this.prisma.category.findMany({ orderBy: { displayOrder: 'asc' } });
  }

  update(id: number, data: any) {
    return this.prisma.category.update({ where: { id }, data });
  }
}
