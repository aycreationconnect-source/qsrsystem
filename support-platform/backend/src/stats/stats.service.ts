import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LicenseStatus, PlanType } from '../common/enums';
import { calculateDaysRemaining } from '../common/date-util';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const totalCafes = await this.prisma.cafeMaster.count();
    const allCafes = await this.prisma.cafeMaster.findMany({
      include: { plan: true },
    });

    const now = new Date();
    let activeTrials = 0;
    let paidActive = 0;
    let expiringSoon = 0; // <= 15 days
    let expired = 0;
    let suspended = 0;

    const cityDistribution: Record<string, number> = {};

    allCafes.forEach((cafe) => {
      const isSuspended = (cafe.licenseStatus as unknown as LicenseStatus) === LicenseStatus.SUSPENDED;
      const daysRemaining = calculateDaysRemaining(cafe.licenseExpiresAt, now);

      if (isSuspended) {
        suspended++;
      } else if (daysRemaining < 0 || (cafe.licenseStatus as unknown as LicenseStatus) === LicenseStatus.EXPIRED) {
        expired++;
      } else {
        if (cafe.plan.planType === PlanType.FREE_TRIAL) {
          activeTrials++;
        } else {
          paidActive++;
        }

        if (daysRemaining <= 15) {
          expiringSoon++;
        }
      }

      const city = cafe.city || 'Other';
      cityDistribution[city] = (cityDistribution[city] || 0) + 1;
    });

    const recentCafes = await this.prisma.cafeMaster.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { plan: true },
    });

    const recentLogs = await this.prisma.licenseHistory.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { cafe: true, plan: true },
    });

    return {
      totalCafes,
      activeTrials,
      paidActive,
      expiringSoon,
      expired,
      suspended,
      cityDistribution,
      recentCafes,
      recentLogs,
    };
  }
}
