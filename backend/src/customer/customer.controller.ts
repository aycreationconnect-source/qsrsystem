import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { CustomerService } from './customer.service';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get('search')
  search(@Query('q') q: string) {
    return this.customerService.search(q);
  }

  @Get()
  findAll() {
    return this.customerService.findAll();
  }

  @Post()
  createOrUpdate(@Body() body: { name: string; phone?: string }) {
    return this.customerService.createOrUpdate(body);
  }
}
