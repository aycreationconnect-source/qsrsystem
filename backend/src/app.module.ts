import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CategoryModule } from './category/category.module';
import { MenuModule } from './menu/menu.module';
import { InventoryModule } from './inventory/inventory.module';
import { OrderModule } from './order/order.module';
import { AreaModule } from './area/area.module';
import { TableModule } from './table/table.module';
import { AddonModule } from './addon/addon.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [PrismaModule, CategoryModule, MenuModule, InventoryModule, OrderModule, AreaModule, TableModule, AddonModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
