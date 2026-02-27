import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Leave } from './leave.entity';
import { Slot } from '../slots/slot.entity';
import { Appointment } from '../appointment/appointment.entity';

import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Leave,
      Slot,
      Appointment, // ✅ ADD THIS
    ]),
  ],
  providers: [LeaveService],
  controllers: [LeaveController],
})
export class LeaveModule {}