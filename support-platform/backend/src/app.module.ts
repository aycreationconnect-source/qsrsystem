import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { LicenseEngineModule } from './license-engine/license-engine.module';
import { PlansModule } from './plans/plans.module';
import { CafesModule } from './cafes/cafes.module';
import { StatsModule } from './stats/stats.module';
import { AuthModule } from './auth/auth.module';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    SupabaseModule,
    LicenseEngineModule,
    PlansModule,
    CafesModule,
    StatsModule,
    AuthModule,
  ],
})
export class AppModule {}
