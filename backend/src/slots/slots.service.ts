import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Slot } from './slot.entity';
import { CreateSlotDto } from './dto/create-slot.dto';
import { RecurringSlotDto } from './dto/recurring-slot.dto';
import { User } from '../user/user.entity';

@Injectable()
export class SlotService {
  constructor(
    @InjectRepository(Slot)
    private slotRepo: Repository<Slot>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  // -----------------------------
  // CREATE CUSTOM SLOT
  // -----------------------------
  async createSlot(doctorId: number, dto: CreateSlotDto) {
    const doctor = await this.userRepo.findOne({
      where: { id: doctorId },
    });

    if (!doctor) throw new BadRequestException('Doctor not found');

    const slot = this.slotRepo.create({
      ...dto,
      doctor,
      isActive: true,
    });

    return this.slotRepo.save(slot);
  }

  // -----------------------------
  // CREATE MULTI-WEEKDAY RECURRING
  // -----------------------------
  async createRecurringSlots(
    doctorId: number,
    dto: RecurringSlotDto,
  ) {
    const doctor = await this.userRepo.findOne({
      where: { id: doctorId },
    });

    if (!doctor) throw new BadRequestException('Doctor not found');

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (start > end) {
      throw new BadRequestException('Invalid date range');
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

    const targetDays = dto.days.map((d) => {
      if (!(d in dayMap))
        throw new BadRequestException(`Invalid day: ${d}`);
      return dayMap[d];
    });

    const slots: Slot[] = [];
    const current = new Date(start);

    while (current <= end) {
      if (targetDays.includes(current.getDay())) {
        const dateStr = current.toISOString().split('T')[0];

        const slot = this.slotRepo.create({
          doctor,
          date: dateStr,
          startTime: dto.startTime,
          endTime: dto.endTime,
          isActive: true,
        });

        slots.push(slot);
      }

      current.setDate(current.getDate() + 1);
    }

    return this.slotRepo.save(slots);
  }

  // -----------------------------
  // VIEW DOCTOR SLOTS
  // -----------------------------
  async getDoctorSlots(doctorId: number) {
    return this.slotRepo.find({
      where: { doctor: { id: doctorId } },
      order: { date: 'ASC' },
    });
  }

  // -----------------------------
  // CANCEL SLOT
  // -----------------------------
  async cancelSlot(slotId: number, doctorId: number) {
    const slot = await this.slotRepo.findOne({
      where: { id: slotId, doctor: { id: doctorId } },
    });

    if (!slot) throw new BadRequestException('Slot not found');

    slot.isActive = false;
    return this.slotRepo.save(slot);
  }
}
