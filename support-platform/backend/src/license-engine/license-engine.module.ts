import { Global, Module } from '@nestjs/common';
import { LicenseEngineService } from './license-engine.service';

@Global()
@Module({
  providers: [LicenseEngineService],
  exports: [LicenseEngineService],
})
export class LicenseEngineModule {}
