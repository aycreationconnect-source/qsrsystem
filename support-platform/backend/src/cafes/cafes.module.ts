import { Module } from '@nestjs/common';
import { CafesService } from './cafes.service';
import { CafesController } from './cafes.controller';
import { PlansModule } from '../plans/plans.module';

@Module({
  imports: [PlansModule],
  controllers: [CafesController],
  providers: [CafesService],
  exports: [CafesService],
})
export class CafesModule {}
