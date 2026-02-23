import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

import { Slot } from './slot.entity';
import { CreateSlotDto } from './dto/create-slot.dto';
import { SlotType, SlotMode } from './slot.enums';
import { User } from '../user/user.entity';

dayjs.extend(isSameOrBefore);

@Injectable()
export class SlotsService {
  constructor(
    @InjectRepository(Slot)
    private readonly slotRepo: Repository<Slot>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // ✅ FIXED: accept doctorId instead of User
  async createSlot(dto: CreateSlotDto, doctorId: number) {
    const doctor = await this.userRepo.findOne({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (dto.slotType === SlotType.CUSTOM) {
      return this.createCustomSlot(dto, doctor);
    }

    return this.createRecurringSlots(dto, doctor);
  }

  async getDoctorSlots(doctorId: number) {
    return this.slotRepo.find({
      where: { doctor: { id: doctorId } },
      relations: ['doctor'],
      order: { date: 'ASC' },
    });
  }

  // 🔒 keep private
  private async createRecurringSlots(dto: CreateSlotDto, doctor: User) {
    const slots: Slot[] = [];
    let current = dayjs(dto.startDate);
    const end = dayjs(dto.endDate);

    while (current.isSameOrBefore(end)) {
      const dayName = current.format('dddd');

      if (dto.days && dto.days.includes(dayName)) {
        const subSlots = this.generateSubSlots(
          dto.startTime,
          dto.endTime,
          dto.duration,
        );

        slots.push(
          this.slotRepo.create({
            date: current.format('YYYY-MM-DD'),
            startTime: dto.startTime,
            endTime: dto.endTime,
            mode: dto.mode,
            slotType: SlotType.RECURRING,
            maxPatient: dto.maxPatient,
            session: dto.session,
            duration: dto.duration,
            subSlots,
            doctor,
          }),
        );
      }

      current = current.add(1, 'day');
    }

    return this.slotRepo.save(slots);
  }

  private async createCustomSlot(dto: CreateSlotDto, doctor: User) {
    const subSlots = this.generateSubSlots(
      dto.startTime,
      dto.endTime,
      dto.duration,
    );

    const slot = this.slotRepo.create({
      date: dto.date,
      startTime: dto.startTime,
      endTime: dto.endTime,
      slotType: SlotType.CUSTOM,
      maxPatient: dto.maxPatient,
      session: dto.session,
      duration: dto.duration,
      subSlots,
      doctor,
    });

    return this.slotRepo.save(slot);
  }

  private generateSubSlots(
    startTime: string,
    endTime: string,
    duration: number,
  ) {
    const slots: {
      startTime: string;
      endTime: string;
      bookedCount: number;
    }[] = [];

    let current = dayjs(`2026-01-01 ${startTime}`);
    const end = dayjs(`2026-01-01 ${endTime}`);

    while (current.add(duration, 'minute').isSameOrBefore(end)) {
      const next = current.add(duration, 'minute');

      slots.push({
        startTime: current.format('HH:mm'),
        endTime: next.format('HH:mm'),
        bookedCount: 0,
      });

      current = next;
    }

    return slots;
  }
}