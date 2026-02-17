import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Slot } from './slot.entity';
import { User } from '../user/user.entity';
import { SlotController } from './slots.controller';
import { SlotService } from './slots.service';


@Module({
  imports: [TypeOrmModule.forFeature([Slot, User])],
  controllers: [SlotController],
  providers: [SlotService],
})
export class SlotModule {}
