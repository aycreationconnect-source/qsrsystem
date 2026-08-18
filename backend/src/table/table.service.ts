import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TableService {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    // Convert areaId to integer if provided
    if (data.areaId) {
      data.areaId = parseInt(data.areaId);
    }
    return this.prisma.table.create({ data });
  }

  findAll() {
    return this.prisma.table.findMany({ include: { area: true } });
  }

  update(id: number, data: any) {
    if (data.areaId) {
      data.areaId = parseInt(data.areaId);
    }
    return this.prisma.table.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.table.delete({ where: { id } });
  }
}
