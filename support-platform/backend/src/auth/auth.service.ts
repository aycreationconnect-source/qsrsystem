import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to hash password with salt
   */
  hashPassword(password: string): string {
    const salt = 'qsr_master_admin_salt_2026';
    return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  }

  /**
   * Validates admin login credentials against golden_qsr_db.admin_users
   */
  async validateAdmin(dto: LoginDto) {
    const user = await this.prisma.adminUser.findUnique({
      where: { username: dto.username },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid admin username or password');
    }

    const hashedInput = this.hashPassword(dto.password);
    // Allow either hashed match or direct match for backward/seed compatibility
    const isValid = user.passwordHash === hashedInput || user.passwordHash === dto.password;

    if (!isValid) {
      throw new UnauthorizedException('Invalid admin username or password');
    }

    // Generate lightweight bearer token
    const tokenPayload = `${user.id}:${user.username}:${Date.now()}`;
    const token = Buffer.from(tokenPayload).toString('base64');

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      },
      token: `ADM-${token}`,
    };
  }

  async getAdminProfile(username: string) {
    const user = await this.prisma.adminUser.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) throw new UnauthorizedException('Admin user not found');
    return user;
  }
}
