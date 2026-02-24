import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Leave } from './leave.entity';
import { Slot } from '../slots/slot.entity';

import { LeaveController } from './leave.controller';
import { LeaveService } from './LeaveService';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Leave,
      Slot
    ])
  ],
  controllers: [LeaveController],
  providers: [LeaveService]
})
export class LeaveModule {}