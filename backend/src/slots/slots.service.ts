import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { Slot, SlotType, SlotMode } from './slot.entity';
import { User } from '../user/user.entity';
import {
  Appointment,
  AppointmentStatus,
} from '../appointment/appointment.entity';

@Injectable()
export class SlotService {
  constructor(
    @InjectRepository(Slot)
    private slotRepo: Repository<Slot>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    private dataSource: DataSource,
  ) {}

  // ------------------------------------------------
  // CREATE SLOT
  // ------------------------------------------------

  async createSlot(dto: any, doctorPayload: any) {
    const doctor = await this.userRepo.findOne({
      where: { id: doctorPayload.sub },
    });

    if (!doctor)
      throw new BadRequestException('Doctor not found');

    const {
      slotType,
      date,
      startDate,
      endDate,
      days,
      startTime,
      endTime,
      duration,
      maxPatients,
      mode,
      session,
    } = dto;

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let result;

      if (slotType === SlotType.CUSTOM) {
        result = await this.generateForSingleDate(
          queryRunner,
          date,
          startTime,
          endTime,
          duration,
          maxPatients,
          mode,
          session,
          doctor,
        );
      }

      if (slotType === SlotType.RECURRING) {
        result = await this.generateRecurring(
          queryRunner,
          startDate,
          endDate,
          this.mapDaysToNumbers(days),
          startTime,
          endTime,
          duration,
          maxPatients,
          mode,
          session,
          doctor,
        );
      }

      await queryRunner.commitTransaction();
      return result;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // ------------------------------------------------
  // SLOT GENERATORS
  // ------------------------------------------------

  private async generateForSingleDate(
    queryRunner,
    date: string,
    startTime: string,
    endTime: string,
    duration: number,
    maxPatients: number,
    mode: SlotMode,
    session: any,
    doctor: User,
  ) {
    let start = this.toDateTime(startTime);
    const end = this.toDateTime(endTime);

    const slots: Slot[] = [];

    while (start < end) {
      const next = new Date(start);
      next.setMinutes(next.getMinutes() + duration);

      if (next > end) break;

      const startStr = this.toTime(start);
      const endStr = this.toTime(next);

      const overlap = await queryRunner.manager
        .createQueryBuilder(Slot, 'slot')
        .where(
          `slot.date=:date
           AND slot.doctorId=:doctorId
           AND (:start < slot.endTime AND :end > slot.startTime)`,
          {
            date,
            doctorId: doctor.id,
            start: startStr,
            end: endStr,
          },
        )
        .getOne();

      if (overlap)
        throw new BadRequestException('Overlapping slot');

      slots.push(
        queryRunner.manager.create(Slot, {
          doctorId: doctor.id,
          slotType: SlotType.CUSTOM,
          mode,
          session,
          date,
          startTime: startStr,
          endTime: endStr,
          duration,
          maxPatients: mode === SlotMode.WAVE ? maxPatients : 1,
          currentPatients: 0,
          doctor,
        }),
      );

      start = next;
    }

    return queryRunner.manager.save(slots);
  }

  // ------------------------------------------------
  // RECURRING SLOT
  // ------------------------------------------------

  private async generateRecurring(
    queryRunner,
    startDate: string,
    endDate: string,
    days: number[],
    startTime: string,
    endTime: string,
    duration: number,
    maxPatients: number,
    mode: SlotMode,
    session: any,
    doctor: User,
  ) {
    let current = new Date(startDate);
    const end = new Date(endDate);

    const slots: Slot[] = [];

    while (current <= end) {
      if (days.includes(current.getDay())) {
        let start = this.toDateTime(startTime);
        const dayEnd = this.toDateTime(endTime);

        while (start < dayEnd) {
          const next = new Date(start);
          next.setMinutes(next.getMinutes() + duration);

          if (next > dayEnd) break;

          const dateStr = current.toISOString().split('T')[0];

          const startStr = this.toTime(start);
          const endStr = this.toTime(next);

          const overlap = await queryRunner.manager
            .createQueryBuilder(Slot, 'slot')
            .where(
              `slot.date=:date
               AND slot.doctorId=:doctorId
               AND (:start < slot.endTime AND :end > slot.startTime)`,
              {
                date: dateStr,
                doctorId: doctor.id,
                start: startStr,
                end: endStr,
              },
            )
            .getOne();

          if (overlap)
            throw new BadRequestException('Overlapping slot');

          slots.push(
            queryRunner.manager.create(Slot, {
              doctorId: doctor.id,
              slotType: SlotType.RECURRING,
              mode,
              session,
              date: dateStr,
              startTime: startStr,
              endTime: endStr,
              duration,
              maxPatients:
                mode === SlotMode.WAVE ? maxPatients : 1,
              currentPatients: 0,
              doctor,
            }),
          );

          start = next;
        }
      }

      current.setDate(current.getDate() + 1);
    }

    return queryRunner.manager.save(slots);
  }

  // ------------------------------------------------
  // ⭐ ELASTIC ENGINE
  // ------------------------------------------------

  async updateSlotElasticity(
    doctorId: number,
    slotId: number,
    newStartTime: string,
    newEndTime: string,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const slot = await manager.findOne(Slot, {
        where: { id: slotId, doctorId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!slot)
        throw new NotFoundException('Slot not found');

      const bookingCount = await manager.count(Appointment, {
        where: {
          slot: { id: slotId },
          status: AppointmentStatus.BOOKED,
        },
      });

      // SHRINK SAFETY
      const availableCapacityAfterShrink =
        Math.floor(
          (this.timeToMinutes(newEndTime) -
            this.timeToMinutes(slot.startTime)) /
            slot.duration,
        );

      if (
        bookingCount > availableCapacityAfterShrink
      ) {
        throw new BadRequestException(
          'Shrink denied: bookings exceed capacity',
        );
      }

      // Apply elasticity
      slot.startTime = newStartTime;
      slot.endTime = newEndTime;

      await manager.save(slot);

      return { message: 'Slot elasticity updated' };
    });
  }

  // ------------------------------------------------
  // FETCH DOCTOR SLOTS
  // ------------------------------------------------

  async getDoctorSlots(doctorId: number) {
    return this.slotRepo.find({
      where: { doctorId },
      order: { date: 'ASC', startTime: 'ASC' },
    });
  }

  // ------------------------------------------------
  // HELPERS
  // ------------------------------------------------

  private mapDaysToNumbers(days: string[]): number[] {
    const map: Record<string, number> = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    return days
      .map((d) => map[d])
      .filter((v) => v !== undefined);
  }

  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  private toDateTime(time: string): Date {
    return new Date(`1970-01-01T${time}:00`);
  }

  private toTime(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }
}