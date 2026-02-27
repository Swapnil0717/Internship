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

  async bookAppointment(patientId: number, slotId: number) {

    return this.dataSource.transaction(async (manager) => {

      const slot = await manager
          .createQueryBuilder(Slot, 'slot')
          .innerJoinAndSelect('slot.doctor','doctor')
          .setLock('pessimistic_write')
          .where('slot.id = :id',{ id: slotId })
          .getOne();

      if (!slot) throw new NotFoundException('Slot not found');

      const patient = await manager.findOne(User, {
        where: { id: patientId },
      });

      if (!patient || patient.role !== 'PATIENT')
        throw new ForbiddenException('Only patient can book');

      if (slot.currentPatients >= slot.maxPatients)
        throw new BadRequestException('Slot full');

      const exists = await manager.findOne(Appointment, {
        where: {
          patient: { id: patientId },
          slot: { id: slotId },
          status: AppointmentStatus.BOOKED,
        },
      });

      if (exists)
        throw new BadRequestException('Already booked');

      slot.currentPatients++;

      await manager.save(slot);

      return manager.save(
        manager.create(Appointment, {
          patient,
          doctor: slot.doctor,
          slot,
          status: AppointmentStatus.BOOKED,
        }),
      );
    });
  }

  async cancelAppointment(id: number, userId: number) {

    return this.dataSource.transaction(async (manager) => {

      const appointment = await manager.findOne(Appointment, {
        where: { id },
        relations: ['slot', 'patient', 'doctor'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!appointment)
        throw new NotFoundException('Appointment not found');

      if (appointment.status === AppointmentStatus.CANCELLED)
        throw new BadRequestException('Already cancelled');

      if (
        appointment.patient.id !== userId &&
        appointment.doctor.id !== userId
      )
        throw new ForbiddenException('Not authorized');

      appointment.status = AppointmentStatus.CANCELLED;

      if (appointment.slot && appointment.slot.currentPatients > 0) {
        appointment.slot.currentPatients--;
        await manager.save(appointment.slot);
      }

      return manager.save(appointment);
    });
  }

  async getPatientAppointments(patientId: number) {

    return this.appointmentRepo.find({
      where: { patient: { id: patientId } },
      order: { createdAt: 'DESC' },
    });
  }

  async getDoctorAppointments(doctorId: number) {

    return this.appointmentRepo.find({
      where: { doctor: { id: doctorId } },
      order: { createdAt: 'DESC' },
    });
  }
}