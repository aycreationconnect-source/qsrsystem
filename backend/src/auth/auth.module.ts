import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LicenseGuard } from './guards/license.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, LicenseGuard],
  exports: [AuthService, LicenseGuard],
})
export class AuthModule {}
