import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { generateNumericId } from '../common/id-generator';
import { calculateDaysRemaining } from '../common/date-util';
import * as crypto from 'crypto';

export class LoginDto {
  pin?: string;
  username?: string;
  password?: string;
}

export class CreateStaffDto {
  username: string;
  fullName: string;
  pin: string;
  role?: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  private hashPin(pin: string): string {
    const salt = 'local_qsr_pin_salt_2026';
    return crypto.pbkdf2Sync(pin, salt, 1000, 32, 'sha256').toString('hex');
  }

  private hashPassword(password: string): string {
    const salt = 'local_qsr_admin_salt_2026';
    return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  }

  /**
   * Generates a signed local JWT token
   */
  private generateLocalToken(user: any, store: any, license: any): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 12 * 60 * 60; // 12 hours

    let allowedModules: string[] = [];
    if (Array.isArray(license.allowedModules)) {
      allowedModules = license.allowedModules;
    } else if (typeof license.allowedModules === 'string') {
      try {
        allowedModules = JSON.parse(license.allowedModules);
      } catch {
        allowedModules = [];
      }
    }

    const payloadObj = {
      sub: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      cafeCode: store.cafeCode,
      businessName: store.businessName,
      allowedModules,
      iat: now,
      exp: exp,
    };

    const payload = Buffer.from(JSON.stringify(payloadObj)).toString('base64url');
    const secret = 'LOCAL_JWT_POS_SECRET_2026_AY_CONNECT';
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${payload}`)
      .digest('base64url');

    return `${header}.${payload}.${signature}`;
  }

  /**
   * Staff & Owner Login via PIN or Username/Password
   */
  async login(dto: LoginDto) {
    // 1. License & Activation Check
    const store = await this.prisma.storeProfile.findFirst();
    const license = await this.prisma.localLicense.findFirst();

    if (!store || !store.isActivated || !license) {
      throw new ForbiddenException({
        code: 'STORE_NOT_ACTIVATED',
        message: 'Store is not yet activated. Please activate with your Master License Key.',
      });
    }

    const now = new Date();
    const expiresAt = new Date(license.expiresAt);

    // 2. Anti-Clock-Tampering Guard (with 5-minute network sync grace period)
    const clockDiffMs = license.lastKnownClock
      ? new Date(license.lastKnownClock).getTime() - now.getTime()
      : 0;
    if (clockDiffMs > 5 * 60 * 1000) {
      throw new ForbiddenException({
        code: 'CLOCK_TAMPERING_DETECTED',
        message: 'System clock error detected! The system clock is behind the last known transaction time.',
      });
    }

    // Update last known clock
    await this.prisma.localLicense.update({
      where: { id: license.id },
      data: { lastKnownClock: now },
    });

    // 3. Expiration Check
    const daysRemaining = calculateDaysRemaining(expiresAt, now);
    const isExpired = daysRemaining < 0;

    if (isExpired) {
      throw new ForbiddenException({
        code: 'LICENSE_EXPIRED',
        message: `Your trial/license expired on ${expiresAt.toLocaleDateString()}. Please renew to continue billing.`,
        expiresAt: license.expiresAt,
        daysRemaining: 0,
      });
    }

    // 4. Authenticate User (safely coerce pin/username/password to strings)
    let user: any = null;

    if (dto.pin !== undefined && dto.pin !== null && String(dto.pin).trim() !== '') {
      const pinStr = String(dto.pin).trim();
      const pinHash = this.hashPin(pinStr);
      user = await this.prisma.localUser.findFirst({
        where: { pinCodeHash: pinHash, isActive: true },
      });
    } else if (dto.username && dto.password) {
      const usernameStr = String(dto.username).trim();
      const passHash = this.hashPassword(String(dto.password));
      user = await this.prisma.localUser.findFirst({
        where: { username: usernameStr, passwordHash: passHash, isActive: true },
      });
    }

    if (!user) {
      throw new UnauthorizedException('Invalid PIN or credentials.');
    }

    // 5. Generate Local JWT Token
    const token = this.generateLocalToken(user, store, license);

    return {
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      },
      store: {
        cafeCode: store.cafeCode,
        businessName: store.businessName,
        currencySymbol: store.currencySymbol,
        receiptFooter: store.receiptFooter,
      },
      license: {
        planCode: license.planCode,
        expiresAt: license.expiresAt,
        daysRemaining,
        allowedModules: license.allowedModules,
        status: license.status,
      },
    };
  }

  /**
   * Retrieves active session details
   */
  async getProfile(token: string) {
    if (!token) throw new UnauthorizedException('No token provided.');
    try {
      const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
      const parts = cleanToken.split('.');
      if (parts.length !== 3) throw new Error('Invalid token structure');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token.');
    }
  }

  /**
   * Retrieves staff list for quick switch
   */
  async getStaff() {
    return this.prisma.localUser.findMany({
      where: { isActive: true },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
      orderBy: { role: 'asc' },
    });
  }

  /**
   * Create new staff member
   */
  async createStaff(dto: CreateStaffDto) {
    if (!dto.username || !dto.pin) {
      throw new BadRequestException('Username and PIN are required.');
    }

    const pinHash = this.hashPin(dto.pin.trim());

    return this.prisma.localUser.create({
      data: {
        id: generateNumericId(),
        username: dto.username.trim().toLowerCase(),
        fullName: dto.fullName || dto.username,
        pinCodeHash: pinHash,
        role: dto.role || 'WAITER',
        isActive: true,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
      },
    });
  }
}
