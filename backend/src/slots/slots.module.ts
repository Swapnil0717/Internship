import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Slot } from './slot.entity';
import { User } from '../user/user.entity';
import { SlotController } from './slots.controller';
import { SlotService } from './slots.service';
import { SlotModificationLog } from './slot-modification-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Slot,
      User,
      SlotModificationLog, 
    ]),
  ],
  controllers: [SlotController],
  providers: [SlotService],
  exports: [SlotService],
})
export class SlotsModule {}