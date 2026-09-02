import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { generateNumericId } from '../common/id-generator';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.planTemplate.findMany({
      orderBy: [
        { isDefault: 'desc' },
        { durationDays: 'asc' },
      ],
      include: {
        _count: {
          select: { cafes: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const plan = await this.prisma.planTemplate.findUnique({
      where: { id },
      include: {
        _count: {
          select: { cafes: true },
        },
      },
    });
    if (!plan) throw new NotFoundException(`Plan with ID ${id} not found`);
    return plan;
  }

  async create(dto: CreatePlanDto) {
    const existing = await this.prisma.planTemplate.findUnique({
      where: { planCode: dto.planCode.toUpperCase() },
    });
    if (existing) {
      throw new BadRequestException(`Plan code ${dto.planCode} already exists`);
    }

    if (dto.isDefault) {
      // Unset any previous default
      await this.prisma.planTemplate.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.planTemplate.create({
      data: {
        id: generateNumericId(),
        planCode: dto.planCode.toUpperCase(),
        name: dto.name,
        planType: dto.planType,
        durationDays: dto.durationDays,
        price: dto.price || 0,
        isDefault: dto.isDefault || false,
        maxTerminals: dto.maxTerminals || 10,
        allowedModules: dto.allowedModules || ['COUNTER_POS', 'TABLE_POS', 'KDS', 'INVENTORY', 'GDRIVE_BACKUP'],
        description: dto.description,
      },
    });
  }

  async update(id: string, dto: UpdatePlanDto) {
    await this.findOne(id);

    if (dto.isDefault) {
      await this.prisma.planTemplate.updateMany({
        where: { isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return this.prisma.planTemplate.update({
      where: { id },
      data: {
        ...dto,
      },
    });
  }

  async remove(id: string) {
    const plan = await this.findOne(id);
    if (plan._count.cafes > 0) {
      // Soft-deactivate if cafes are currently assigned
      return this.prisma.planTemplate.update({
        where: { id },
        data: { isActive: false },
      });
    }
    return this.prisma.planTemplate.delete({
      where: { id },
    });
  }

  async getDefaultPlan() {
    let defaultPlan = await this.prisma.planTemplate.findFirst({
      where: { isDefault: true, isActive: true },
    });
    if (!defaultPlan) {
      defaultPlan = await this.prisma.planTemplate.findFirst({
        where: { isActive: true },
        orderBy: { durationDays: 'desc' },
      });
    }
    return defaultPlan;
  }
}
