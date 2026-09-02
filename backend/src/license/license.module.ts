import { Module } from '@nestjs/common';
import { LicenseService } from './license.service';
import { LicenseController } from './license.controller';
import { LicenseVerifierService } from './license-verifier.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LicenseController],
  providers: [LicenseService, LicenseVerifierService],
  exports: [LicenseService, LicenseVerifierService],
})
export class LicenseModule {}
