import { Module } from '@nestjs/common';
import { SettingController } from './setting.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SettingController],
  providers: [PrismaService],
})
export class SettingModule {}
