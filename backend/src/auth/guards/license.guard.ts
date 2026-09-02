import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LicenseGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const license = await this.prisma.localLicense.findFirst();
    if (!license) {
      throw new ForbiddenException({
        code: 'NO_LICENSE',
        message: 'No active license found. Store must be activated.',
      });
    }

    const now = new Date();
    const expiresAt = new Date(license.expiresAt);

    if (now > expiresAt || license.status !== 'ACTIVE') {
      throw new ForbiddenException({
        code: 'LICENSE_EXPIRED',
        message: 'Store license has expired. Please renew.',
        expiresAt: license.expiresAt,
      });
    }

    return true;
  }
}
