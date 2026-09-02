import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LicenseVerifierService } from './license-verifier.service';
import { generateNumericId } from '../common/id-generator';
import * as crypto from 'crypto';

export class ActivateStoreDto {
  cafeCode: string;
  licenseKey: string;
  ownerPin: string; // e.g. "1234"
  ownerPassword?: string;
  ownerName?: string;
  phone?: string;
  email?: string;
  city?: string;
  state?: string;
  address?: string;
}

@Injectable()
export class LicenseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly verifier: LicenseVerifierService,
  ) {}

  private hashPin(pin: string): string {
    const salt = 'local_qsr_pin_salt_2026';
    return crypto.pbkdf2Sync(pin, salt, 1000, 32, 'sha256').toString('hex');
  }

  private hashPassword(password: string): string {
    const salt = 'local_qsr_admin_salt_2026';
    return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  }

  /**
   * First-Time Activation of Store via Offline Cryptographic License
   */
  async activateStore(dto: ActivateStoreDto) {
    if (!dto.cafeCode || !dto.licenseKey) {
      throw new BadRequestException('Cafe Code and License Key are required for activation.');
    }

    const pin = (dto.ownerPin || '1234').trim();
    if (pin.length < 4) {
      throw new BadRequestException('Owner PIN must be at least 4 digits.');
    }

    // 1. Verify license key offline
    const verification = this.verifier.verifyLicenseKey(dto.licenseKey, dto.cafeCode);
    const { payload, expiresAt, durationDays } = verification;

    const now = new Date();

    // 2. Check if store profile already exists
    const existingStore = await this.prisma.storeProfile.findFirst();
    const storeId = existingStore ? existingStore.id : generateNumericId();

    const store = await this.prisma.storeProfile.upsert({
      where: { id: storeId },
      update: {
        cafeCode: payload.cafeCode,
        businessName: payload.businessName,
        ownerName: dto.ownerName || 'Store Owner',
        phone: dto.phone || '9876543210',
        email: dto.email || null,
        city: dto.city || 'Mumbai',
        state: dto.state || 'Maharashtra',
        address: dto.address || null,
        isActivated: true,
        activatedAt: now,
      },
      create: {
        id: storeId,
        cafeCode: payload.cafeCode,
        businessName: payload.businessName,
        ownerName: dto.ownerName || 'Store Owner',
        phone: dto.phone || '9876543210',
        email: dto.email || null,
        city: dto.city || 'Mumbai',
        state: dto.state || 'Maharashtra',
        address: dto.address || null,
        isActivated: true,
        activatedAt: now,
      },
    });

    // 3. Upsert Local License Record with Pure Numeric ID
    const existingLicense = await this.prisma.localLicense.findFirst();
    const licenseId = existingLicense ? existingLicense.id : generateNumericId();

    const license = await this.prisma.localLicense.upsert({
      where: { id: licenseId },
      update: {
        licenseKey: dto.licenseKey.trim(),
        planCode: payload.planCode,
        durationDays: durationDays,
        issuedAt: new Date(payload.issuedAt),
        expiresAt: expiresAt,
        maxTerminals: payload.maxTerminals || 10,
        allowedModules: payload.modules || [
          'COUNTER_POS',
          'TABLE_POS',
          'KDS',
          'INVENTORY',
          'GDRIVE_BACKUP',
        ],
        status: 'ACTIVE',
        lastKnownClock: now,
      },
      create: {
        id: licenseId,
        licenseKey: dto.licenseKey.trim(),
        planCode: payload.planCode,
        durationDays: durationDays,
        issuedAt: new Date(payload.issuedAt),
        expiresAt: expiresAt,
        maxTerminals: payload.maxTerminals || 10,
        allowedModules: payload.modules || [
          'COUNTER_POS',
          'TABLE_POS',
          'KDS',
          'INVENTORY',
          'GDRIVE_BACKUP',
        ],
        status: 'ACTIVE',
        lastKnownClock: now,
      },
    });

    // 4. Create Master Store Owner Account with Pure Numeric ID
    const pinHash = this.hashPin(pin);
    const passHash = this.hashPassword(dto.ownerPassword || 'admin123');

    const ownerUser = await this.prisma.localUser.upsert({
      where: { username: 'owner' },
      update: {
        fullName: store.ownerName,
        pinCodeHash: pinHash,
        passwordHash: passHash,
        role: 'OWNER',
        isActive: true,
      },
      create: {
        id: generateNumericId(),
        username: 'owner',
        fullName: store.ownerName,
        pinCodeHash: pinHash,
        passwordHash: passHash,
        role: 'OWNER',
        isActive: true,
      },
    });

    // 5. Create Default Cashier & Waiter Accounts with Pure Numeric IDs
    await this.prisma.localUser.upsert({
      where: { username: 'cashier1' },
      update: { pinCodeHash: this.hashPin('1111') },
      create: {
        id: generateNumericId(),
        username: 'cashier1',
        fullName: 'Counter Cashier',
        pinCodeHash: this.hashPin('1111'),
        role: 'CASHIER',
        isActive: true,
      },
    });

    await this.prisma.localUser.upsert({
      where: { username: 'waiter1' },
      update: { pinCodeHash: this.hashPin('2222') },
      create: {
        id: generateNumericId(),
        username: 'waiter1',
        fullName: 'Floor Waiter',
        pinCodeHash: this.hashPin('2222'),
        role: 'WAITER',
        isActive: true,
      },
    });

    const daysRemaining = Math.max(
      0,
      Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    );

    return {
      success: true,
      message: `Store '${store.businessName}' (${store.cafeCode}) activated successfully!`,
      store,
      license: {
        id: license.id,
        planCode: license.planCode,
        durationDays: license.durationDays,
        expiresAt: license.expiresAt,
        daysRemaining,
        allowedModules: license.allowedModules,
        status: license.status,
      },
      owner: {
        id: ownerUser.id,
        username: ownerUser.username,
        role: ownerUser.role,
        defaultPin: pin,
      },
    };
  }

  /**
   * Retrieves Current Local Store Status & License Health
   */
  async getStatus() {
    const store = await this.prisma.storeProfile.findFirst();
    const license = await this.prisma.localLicense.findFirst();

    if (!store || !store.isActivated || !license) {
      return {
        isActivated: false,
        store: null,
        license: null,
      };
    }

    const now = new Date();
    const expiresAt = new Date(license.expiresAt);
    const isExpired = now > expiresAt;
    const daysRemaining = Math.max(
      0,
      Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    );

    return {
      isActivated: true,
      store,
      license: {
        id: license.id,
        planCode: license.planCode,
        durationDays: license.durationDays,
        expiresAt: license.expiresAt,
        daysRemaining,
        isExpired,
        isExpiringSoon: !isExpired && daysRemaining <= 15,
        allowedModules: license.allowedModules,
        status: isExpired ? 'EXPIRED' : license.status,
      },
    };
  }

  /**
   * Renews Store License with a newly issued renewal key
   */
  async renewLicense(licenseKey: string) {
    const store = await this.prisma.storeProfile.findFirst();
    if (!store || !store.isActivated) {
      throw new NotFoundException('Store is not yet activated. Please activate first.');
    }

    const verification = this.verifier.verifyLicenseKey(licenseKey, store.cafeCode);
    const { payload, expiresAt, durationDays } = verification;

    const existingLicense = await this.prisma.localLicense.findFirst();
    const licenseId = existingLicense ? existingLicense.id : generateNumericId();

    const updatedLicense = await this.prisma.localLicense.upsert({
      where: { id: licenseId },
      update: {
        licenseKey: licenseKey.trim(),
        planCode: payload.planCode,
        durationDays: durationDays,
        expiresAt: expiresAt,
        maxTerminals: payload.maxTerminals || 10,
        allowedModules: payload.modules,
        status: 'ACTIVE',
        lastKnownClock: new Date(),
      },
      create: {
        id: licenseId,
        licenseKey: licenseKey.trim(),
        planCode: payload.planCode,
        durationDays: durationDays,
        issuedAt: new Date(payload.issuedAt),
        expiresAt: expiresAt,
        maxTerminals: payload.maxTerminals || 10,
        allowedModules: payload.modules,
        status: 'ACTIVE',
        lastKnownClock: new Date(),
      },
    });

    const now = new Date();
    const daysRemaining = Math.max(
      0,
      Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    );

    return {
      success: true,
      message: `License renewed successfully for ${store.businessName}! Valid until ${expiresAt.toLocaleDateString()}.`,
      license: {
        id: updatedLicense.id,
        planCode: updatedLicense.planCode,
        durationDays: updatedLicense.durationDays,
        expiresAt: updatedLicense.expiresAt,
        daysRemaining,
        allowedModules: updatedLicense.allowedModules,
        status: updatedLicense.status,
      },
    };
  }
}
