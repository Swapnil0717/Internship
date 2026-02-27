import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { Appointment, AppointmentStatus } from './appointment.entity';
import { Slot } from '../slots/slot.entity';
import { User } from '../user/user.entity';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,

    @InjectRepository(Slot)
    private slotRepo: Repository<Slot>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    private dataSource: DataSource,
  ) {}

  // =====================================================
  // BOOK APPOINTMENT
  // =====================================================

  async bookAppointment(patientId: number, slotId: number) {
    return this.dataSource.transaction(async (manager) => {
      
      // 🔒 Lock slot row
      const slot = await manager
        .createQueryBuilder(Slot, 'slot')
        .innerJoinAndSelect('slot.doctor', 'doctor')
        .setLock('pessimistic_write')
        .where('slot.id = :id', { id: slotId })
        .getOne();

      if (!slot) {
        throw new NotFoundException('Slot not found');
      }

      if (slot.isParent) {
        throw new BadRequestException('Parent slot cannot be booked');
      }

      const patient = await manager.findOne(User, {
        where: { id: patientId },
      });

      if (!patient) {
        throw new NotFoundException('Patient not found');
      }

      if (patient.role !== 'PATIENT') {
        throw new ForbiddenException('Only patients can book appointments');
      }

      // 🚫 Check if already booked
      const existingBooking = await manager.findOne(Appointment, {
        where: {
          slot: { id: slot.id },
          status: AppointmentStatus.BOOKED,
        },
      });

      if (existingBooking) {
        throw new BadRequestException('Slot already booked');
      }

      // 🚫 Prevent patient double booking same slot
      const duplicateBooking = await manager.findOne(Appointment, {
        where: {
          patient: { id: patientId },
          slot: { id: slot.id },
          status: AppointmentStatus.BOOKED,
        },
      });

      if (duplicateBooking) {
        throw new BadRequestException('You already booked this slot');
      }

      const appointment = manager.create(Appointment, {
        patient,
        doctor: slot.doctor,
        slot,
        status: AppointmentStatus.BOOKED,
      });

      return manager.save(appointment);
    });
  }

  // =====================================================
  // CANCEL APPOINTMENT
  // =====================================================

  async cancelAppointment(appointmentId: number, userId: number) {
    return this.dataSource.transaction(async (manager) => {

      const appointment = await manager.findOne(Appointment, {
        where: { id: appointmentId },
        relations: ['slot', 'patient', 'doctor'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }

      if (appointment.status === AppointmentStatus.CANCELLED) {
        throw new BadRequestException('Appointment already cancelled');
      }

      if (
        appointment.patient.id !== userId &&
        appointment.doctor.id !== userId
      ) {
        throw new ForbiddenException('Not authorized to cancel');
      }

      appointment.status = AppointmentStatus.CANCELLED;

      return manager.save(appointment);
    });
  }

  // =====================================================
  // GET PATIENT APPOINTMENTS
  // =====================================================

  async getPatientAppointments(patientId: number) {
    return this.appointmentRepo.find({
      where: { patient: { id: patientId } },
      relations: ['slot', 'doctor'],
      order: { createdAt: 'DESC' },
    });
  }

  // =====================================================
  // GET DOCTOR APPOINTMENTS
  // =====================================================

  async getDoctorAppointments(doctorId: number) {
    return this.appointmentRepo.find({
      where: { doctor: { id: doctorId } },
      relations: ['slot', 'patient'],
      order: { createdAt: 'DESC' },
    });
  }
}