import { Controller, Post, Get, Body } from '@nestjs/common';
import { LicenseService, ActivateStoreDto } from './license.service';

@Controller('license')
export class LicenseController {
  constructor(private readonly licenseService: LicenseService) {}

  @Post('activate')
  activateStore(@Body() dto: ActivateStoreDto) {
    return this.licenseService.activateStore(dto);
  }

  @Get('status')
  getStatus() {
    return this.licenseService.getStatus();
  }

  @Post('renew')
  renewLicense(@Body('licenseKey') licenseKey: string) {
    return this.licenseService.renewLicense(licenseKey);
  }
}
