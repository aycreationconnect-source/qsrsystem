import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LicenseEngineService } from '../license-engine/license-engine.service';
import { PlansService } from '../plans/plans.service';
import { RegisterCafeDto } from './dto/register-cafe.dto';
import { RenewCafeDto } from './dto/renew-cafe.dto';
import { LicenseStatus, PlanType } from '../common/enums';
import { generateNumericId } from '../common/id-generator';

@Injectable()
export class CafesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly licenseEngine: LicenseEngineService,
    private readonly plansService: PlansService,
  ) {}

  private async generateNextCafeCode(city: string): Promise<string> {
    const totalCount = await this.prisma.cafeMaster.count();
    const cityPrefix = city ? city.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'IND') : 'IND';
    const seq = String(totalCount + 1).padStart(3, '0');
    return `CF-${cityPrefix}-${seq}`;
  }

  private generateWhatsAppMessage(cafe: any, plan: any, licenseKey: string): string {
    const expiryFormatted = new Date(cafe.licenseExpiresAt).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    return `🎉 *Welcome to QSR POS System!*

☕ *Cafe Details:*
• *Business Name:* ${cafe.businessName}
• *Cafe ID:* ${cafe.cafeCode}
• *Plan:* ${plan.name} (${plan.durationDays} Days)
• *Valid Until:* ${expiryFormatted}

🔑 *Your Activation License Key:*
\`${licenseKey}\`

🚀 *Quick Setup Instructions:*
1. Open QSR POS on your main billing computer.
2. Enter Cafe ID: *${cafe.cafeCode}* and paste your License Key above.
3. Once activated, scan the QR code from any Mobile/Tab to connect waiter devices!

📞 *Support Helpline:* +91 9876543210 (AyCreationConnect Support)`;
  }

  async register(dto: RegisterCafeDto) {
    // Check if phone already registered
    const existingPhone = await this.prisma.cafeMaster.findUnique({
      where: { ownerPhone: dto.ownerPhone },
    });
    if (existingPhone) {
      throw new BadRequestException(`Cafe with owner phone number ${dto.ownerPhone} is already registered (${existingPhone.businessName})`);
    }

    // Determine Plan
    let plan = dto.planId ? await this.plansService.findOne(dto.planId) : await this.plansService.getDefaultPlan();
    if (!plan) {
      throw new BadRequestException('No active plan found. Please create a plan template first.');
    }

    // Clean numeric unique ID (e.g. 202609021788342526604)
    const customId = generateNumericId();
    const cafeCode = dto.customCafeCode?.trim().toUpperCase() || (await this.generateNextCafeCode(dto.city));

    const now = new Date();
    const expiresAt = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    // Generate cryptographic license key
    const licenseKey = this.licenseEngine.generateLicenseKey({
      cafeCode,
      businessName: dto.businessName,
      planCode: plan.planCode,
      durationDays: plan.durationDays,
      issuedAt: now,
      expiresAt,
      maxTerminals: plan.maxTerminals,
      modules: plan.allowedModules as string[],
    });

    const licenseStatus: LicenseStatus = plan.planType === PlanType.FREE_TRIAL ? LicenseStatus.TRIAL : LicenseStatus.ACTIVE;

    // Save to Golden DB with clean numeric ID
    const cafe = await this.prisma.cafeMaster.create({
      data: {
        id: customId,
        cafeCode,
        businessName: dto.businessName,
        ownerName: dto.ownerName,
        ownerPhone: dto.ownerPhone,
        ownerEmail: dto.ownerEmail,
        city: dto.city,
        state: dto.state,
        address: dto.address,
        planId: plan.id,
        licenseStatus,
        currentLicenseKey: licenseKey,
        trialStartedAt: now,
        licenseExpiresAt: expiresAt,
        notes: dto.notes,
        licenseHistories: {
          create: {
            id: generateNumericId(),
            planId: plan.id,
            action: plan.planType === PlanType.FREE_TRIAL ? 'TRIAL_ISSUED' : 'INITIAL_LICENSE_ISSUED',
            issuedLicenseKey: licenseKey,
            newExpiry: expiresAt,
            issuedByAdmin: 'Developer Admin',
            notes: `Initial onboarding on plan: ${plan.name}`,
          },
        },
      },
      include: {
        plan: true,
      },
    });

    const whatsappMessage = this.generateWhatsAppMessage(cafe, plan, licenseKey);

    return {
      cafe,
      licenseKey,
      whatsappMessage,
      setupCredentials: {
        id: cafe.id,
        cafeCode,
        businessName: cafe.businessName,
        ownerPhone: cafe.ownerPhone,
        expiresAt: cafe.licenseExpiresAt,
        planName: plan.name,
      },
    };
  }

  async findAll(query: { search?: string; status?: string; city?: string }) {
    const where: any = {};

    if (query.search) {
      where.OR = [
        { id: { contains: query.search } },
        { businessName: { contains: query.search } },
        { ownerName: { contains: query.search } },
        { ownerPhone: { contains: query.search } },
        { cafeCode: { contains: query.search } },
      ];
    }

    if (query.city && query.city !== 'ALL') {
      where.city = { contains: query.city };
    }

    const cafes = await this.prisma.cafeMaster.findMany({
      where,
      include: {
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();

    // Map and enrich with live expiry countdown & suspension status
    return cafes.map((cafe) => {
      const isSuspended = (cafe.licenseStatus as unknown as LicenseStatus) === LicenseStatus.SUSPENDED;
      const diffMs = new Date(cafe.licenseExpiresAt).getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const isExpired = daysRemaining <= 0;
      const isExpiringSoon = !isExpired && !isSuspended && daysRemaining <= 15;

      let computedStatus: LicenseStatus = cafe.licenseStatus as unknown as LicenseStatus;
      if (isSuspended) {
        computedStatus = LicenseStatus.SUSPENDED;
      } else if (isExpired) {
        computedStatus = LicenseStatus.EXPIRED;
      }

      return {
        ...cafe,
        daysRemaining: Math.max(0, daysRemaining),
        isExpired,
        isExpiringSoon,
        isSuspended,
        computedStatus,
      };
    });
  }

  async findOne(id: string) {
    const cafe = await this.prisma.cafeMaster.findUnique({
      where: { id },
      include: {
        plan: true,
        licenseHistories: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!cafe) throw new NotFoundException(`Cafe with ID ${id} not found`);

    const now = new Date();
    const diffMs = new Date(cafe.licenseExpiresAt).getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const isSuspended = (cafe.licenseStatus as unknown as LicenseStatus) === LicenseStatus.SUSPENDED;

    return {
      ...cafe,
      daysRemaining: Math.max(0, daysRemaining),
      isExpired: daysRemaining <= 0,
      isExpiringSoon: !isSuspended && daysRemaining > 0 && daysRemaining <= 15,
      isSuspended,
      whatsappMessage: this.generateWhatsAppMessage(cafe, cafe.plan, cafe.currentLicenseKey),
    };
  }

  async toggleStatus(id: string, action: 'BLOCK' | 'UNBLOCK', reason?: string) {
    const cafe = await this.prisma.cafeMaster.findUnique({
      where: { id },
      include: { plan: true },
    });

    if (!cafe) throw new NotFoundException(`Cafe with ID ${id} not found`);

    const now = new Date();
    let newStatus: LicenseStatus;

    if (action === 'BLOCK') {
      newStatus = LicenseStatus.SUSPENDED;
    } else {
      // Unblock -> calculate if valid trial/active or expired
      const diffMs = new Date(cafe.licenseExpiresAt).getTime() - now.getTime();
      if (diffMs <= 0) {
        newStatus = LicenseStatus.EXPIRED;
      } else {
        newStatus = cafe.plan.planType === PlanType.FREE_TRIAL ? LicenseStatus.TRIAL : LicenseStatus.ACTIVE;
      }
    }

    const updated = await this.prisma.cafeMaster.update({
      where: { id },
      data: {
        licenseStatus: newStatus,
        licenseHistories: {
          create: {
            id: generateNumericId(),
            planId: cafe.planId,
            action: action === 'BLOCK' ? 'CAFE_BLOCKED' : 'CAFE_UNBLOCKED',
            issuedLicenseKey: cafe.currentLicenseKey,
            previousExpiry: cafe.licenseExpiresAt,
            newExpiry: cafe.licenseExpiresAt,
            issuedByAdmin: 'Developer Admin',
            notes: reason || (action === 'BLOCK' ? 'Store access blocked / suspended by Admin' : 'Store access unblocked / restored by Admin'),
          },
        },
      },
      include: { plan: true },
    });

    return {
      cafe: updated,
      action,
      licenseStatus: newStatus,
      message: action === 'BLOCK' ? 'Cafe has been successfully BLOCKED.' : 'Cafe has been successfully UNBLOCKED.',
    };
  }

  async renew(id: string, dto: RenewCafeDto) {
    const cafe = await this.prisma.cafeMaster.findUnique({
      where: { id },
      include: { plan: true },
    });

    if (!cafe) throw new NotFoundException(`Cafe with ID ${id} not found`);

    const plan = await this.plansService.findOne(dto.planId);
    const durationDays = dto.customDays || plan.durationDays;

    const now = new Date();
    // If cafe is still active, extend from current expiry date; if already expired, start from today
    const baseDate = new Date(cafe.licenseExpiresAt) > now ? new Date(cafe.licenseExpiresAt) : now;
    const newExpiry = new Date(baseDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    // Generate new signed key
    const newLicenseKey = this.licenseEngine.generateLicenseKey({
      cafeCode: cafe.cafeCode,
      businessName: cafe.businessName,
      planCode: plan.planCode,
      durationDays,
      issuedAt: now,
      expiresAt: newExpiry,
      maxTerminals: plan.maxTerminals,
      modules: plan.allowedModules as string[],
    });

    const newStatus: LicenseStatus = plan.planType === PlanType.FREE_TRIAL ? LicenseStatus.TRIAL : LicenseStatus.ACTIVE;

    const updated = await this.prisma.cafeMaster.update({
      where: { id },
      data: {
        planId: plan.id,
        licenseStatus: newStatus,
        currentLicenseKey: newLicenseKey,
        licenseExpiresAt: newExpiry,
        licenseHistories: {
          create: {
            id: generateNumericId(),
            planId: plan.id,
            action: plan.planType === PlanType.EXTENSION ? 'EXTENDED' : 'RENEWED',
            issuedLicenseKey: newLicenseKey,
            previousExpiry: cafe.licenseExpiresAt,
            newExpiry,
            issuedByAdmin: dto.adminName || 'Developer Admin',
            notes: dto.notes || `Renewed with plan: ${plan.name} (+${durationDays} days)`,
          },
        },
      },
      include: {
        plan: true,
      },
    });

    const whatsappMessage = this.generateWhatsAppMessage(updated, plan, newLicenseKey);

    return {
      cafe: updated,
      newLicenseKey,
      newExpiry,
      whatsappMessage,
    };
  }

  async regenerateKey(id: string) {
    const cafe = await this.prisma.cafeMaster.findUnique({
      where: { id },
      include: { plan: true },
    });

    if (!cafe) throw new NotFoundException(`Cafe with ID ${id} not found`);

    const now = new Date();
    const diffMs = new Date(cafe.licenseExpiresAt).getTime() - now.getTime();
    const durationDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    const newKey = this.licenseEngine.generateLicenseKey({
      cafeCode: cafe.cafeCode,
      businessName: cafe.businessName,
      planCode: cafe.plan.planCode,
      durationDays,
      issuedAt: now,
      expiresAt: new Date(cafe.licenseExpiresAt),
      maxTerminals: cafe.plan.maxTerminals,
      modules: cafe.plan.allowedModules as string[],
    });

    const updated = await this.prisma.cafeMaster.update({
      where: { id },
      data: {
        currentLicenseKey: newKey,
        licenseHistories: {
          create: {
            id: generateNumericId(),
            planId: cafe.planId,
            action: 'KEY_REGENERATED',
            issuedLicenseKey: newKey,
            previousExpiry: cafe.licenseExpiresAt,
            newExpiry: cafe.licenseExpiresAt,
            issuedByAdmin: 'Developer Admin',
            notes: 'Regenerated license key upon request',
          },
        },
      },
      include: { plan: true },
    });

    return {
      cafe: updated,
      licenseKey: newKey,
      whatsappMessage: this.generateWhatsAppMessage(updated, cafe.plan, newKey),
    };
  }
}
