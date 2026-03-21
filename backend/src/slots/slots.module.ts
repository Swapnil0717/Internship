import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Slot } from './slot.entity';
import { User } from '../user/user.entity';
import { SlotsService } from './slots.service';
import { SlotModificationLog } from './slot-modification-log.entity';
import { SlotsController } from './slots.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Slot,
      User,
      SlotModificationLog, 
    ]),
  ],
  controllers: [SlotsController],
  providers: [SlotsService],
  exports: [SlotsService],
})
export class SlotsModule {}