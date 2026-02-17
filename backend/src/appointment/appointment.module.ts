import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './appointment.entity';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { User } from '../user/user.entity';
import { Slot } from 'src/slots/slot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Slot, User])],
  providers: [AppointmentService],
  controllers: [AppointmentController],
})
export class AppointmentModule {}
