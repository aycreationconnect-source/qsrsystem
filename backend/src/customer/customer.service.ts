import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomerService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      const count = await this.prisma.customer.count();
      if (count === 0) {
        const orders = await this.prisma.order.findMany({
          where: { description: { not: null } },
          select: { description: true },
        });

        for (const order of orders) {
          if (!order.description) continue;
          const nameMatch = order.description.match(/Customer:\s*([^|]+)/i);
          const phoneMatch = order.description.match(/Mobile:\s*([^|]+)/i);
          const name = nameMatch ? nameMatch[1].trim() : '';
          const phone = phoneMatch ? phoneMatch[1].trim() : null;

          if (name) {
            await this.createOrUpdate({ name, phone });
          }
        }
      }
    } catch (err) {
      console.warn('Customer auto-seed check skipped:', err);
    }
  }

  async search(query: string) {
    const q = (query || '').trim();
    if (!q) {
      return this.prisma.customer.findMany({
        take: 10,
        orderBy: { updatedAt: 'desc' },
      });
    }

    return this.prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { phone: { contains: q } },
        ],
      },
      take: 10,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findAll() {
    return this.prisma.customer.findMany({
      take: 50,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async createOrUpdate(data: { name: string; phone?: string | null }) {
    const name = (data.name || '').trim();
    const phone = data.phone ? String(data.phone).trim() : null;

    if (!name) return null;

    let existing: any = null;
    if (phone) {
      existing = await this.prisma.customer.findFirst({
        where: { phone },
      });
    }

    if (!existing) {
      existing = await this.prisma.customer.findFirst({
        where: { name },
      });
    }

    if (existing) {
      return this.prisma.customer.update({
        where: { id: existing.id },
        data: {
          name,
          phone: phone || existing.phone,
        },
      });
    }

    return this.prisma.customer.create({
      data: {
        name,
        phone,
      },
    });
  }
}
