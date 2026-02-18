import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Slot, SlotMode, SlotType } from './slot.entity';
import { CreateSlotDto } from './dto/create-slot.dto';
import { RecurringSlotDto } from './dto/recurring-slot.dto';

@Injectable()
export class SlotsService {
  constructor(
    @InjectRepository(Slot)
    private readonly slotRepo: Repository<Slot>,
  ) {}

  // ==============================
  // CREATE SLOT (CUSTOM / AUTO OVERRIDE)
  // ==============================
  async createSlot(doctorId: number, dto: CreateSlotDto) {
    const today = new Date().toISOString().split('T')[0];

    // 🔴 WAVE validation
    if (dto.mode === SlotMode.WAVE && !dto.capacity) {
      throw new BadRequestException(
        'WAVE slot requires capacity',
      );
    }

    // 🔥 AUTOMATIC OVERRIDE LOGIC
    if (
      dto.slotType === SlotType.CUSTOM &&
      dto.date === today
    ) {
      await this.slotRepo.update(
        {
          doctor: { id: doctorId },
          date: today,
          slotType: SlotType.RECURRING,
        },
        { isActive: false },
      );
    }

    const slot = this.slotRepo.create({
      ...dto,
      doctor: { id: doctorId },
      isActive: true,
    });

    return this.slotRepo.save(slot);
  }

  // ==============================
  // CREATE RECURRING SLOTS (STREAM + WAVE)
  // ==============================
  async createRecurringSlots(
    doctorId: number,
    dto: RecurringSlotDto,
  ) {
    if (dto.mode === SlotMode.WAVE && !dto.capacity) {
      throw new BadRequestException(
        'Recurring WAVE slots require capacity',
      );
    }

    const dayMap: Record<string, number> = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    const targetDays = dto.days.map(
      (d) => dayMap[d],
    );

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    const slots: Slot[] = [];
    const current = new Date(start);

    while (current <= end) {
      if (targetDays.includes(current.getDay())) {
        const dateStr = current
          .toISOString()
          .split('T')[0];

        slots.push(
          this.slotRepo.create({
            date: dateStr,
            startTime: dto.startTime,
            endTime: dto.endTime,
            slotType: SlotType.RECURRING,
            mode: dto.mode,
            capacity: dto.capacity,
            doctor: { id: doctorId },
            isActive: true,
          }),
        );
      }
      current.setDate(current.getDate() + 1);
    }

    return this.slotRepo.save(slots);
  }

  // ==============================
  // DOCTOR VIEW (FUTURE + CANCELLED)
  // ==============================
  async getDoctorSlots(
    doctorId: number,
    includeCancelled: boolean,
  ) {
    const where: any = {
      doctor: { id: doctorId },
    };

    if (!includeCancelled) {
      where.isActive = true;
    }

    return this.slotRepo.find({
      where,
      relations: ['appointments'],
      order: {
        date: 'ASC',
        startTime: 'ASC',
      },
    });
  }
}
