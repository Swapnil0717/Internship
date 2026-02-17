import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Appointment } from './appointment.entity';
import { User } from '../user/user.entity';
import { Slot } from 'src/slots/slot.entity';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,

    @InjectRepository(Slot)
    private slotRepo: Repository<Slot>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  // ===============================
  // CREATE BOOKING
  // ===============================
  async createBooking(userId: number, dto: { slotId: number }) {
    const slot = await this.slotRepo.findOne({
      where: { id: dto.slotId, isActive: true },
      relations: ['doctor'],
    });

    if (!slot) {
      throw new NotFoundException('Slot not found or inactive');
    }

    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // ❗ Check if slot already booked by this user (optional rule)
    const existing = await this.appointmentRepo.findOne({
      where: {
        slot: { id: slot.id },
        patient: { id: userId },
      },
    });

    if (existing) {
      throw new BadRequestException('You already booked this slot');
    }

    const appointment = this.appointmentRepo.create({
      patient: user,
      slot,
      status: 'BOOKED',
    });

    return this.appointmentRepo.save(appointment);
  }

  // ===============================
  // CANCEL BOOKING
  // ===============================
  async cancelBooking(appointmentId: number, userId: number) {
    const appointment = await this.appointmentRepo.findOne({
      where: { id: appointmentId },
      relations: ['patient'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.patient.id !== userId) {
      throw new BadRequestException('Not allowed');
    }

    appointment.status = 'CANCELLED';

    return this.appointmentRepo.save(appointment);
  }

  // ===============================
  // VIEW MY APPOINTMENTS
  // ===============================
  async getMyAppointments(userId: number) {
    return this.appointmentRepo.find({
      where: {
        patient: { id: userId },
      },
      relations: ['slot', 'slot.doctor'],
      order: { createdAt: 'DESC' },
    });
  }
}
