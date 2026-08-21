import { Module } from '@nestjs/common';
import { AddonService } from './addon.service';
import { AddonController } from './addon.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AddonController],
  providers: [AddonService, PrismaService],
})
export class AddonModule {}
