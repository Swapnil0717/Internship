import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Slot } from './slot.entity';
import { User } from '../user/user.entity';
import { SlotsController } from './slots.controller';
import { SlotsService } from './slots.service';


@Module({
  imports: [TypeOrmModule.forFeature([Slot, User])],
  controllers: [SlotsController],
  providers: [SlotsService],
})
export class SlotModule {}
