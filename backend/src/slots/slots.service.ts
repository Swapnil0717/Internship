import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  DataSource,
  EntityManager,
} from 'typeorm';
import { Slot, SlotType } from './slot.entity';

@Injectable()
export class SlotsService {
  constructor(
    @InjectRepository(Slot)
    private slotRepo: Repository<Slot>,
    private dataSource: DataSource,
  ) {}

  /* ================= TIME UTILS ================= */

  private toMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  private toTime(minutes: number): string {
    const h = Math.floor(minutes / 60)
      .toString()
      .padStart(2, '0');
    const m = Math.floor(minutes % 60)
      .toString()
      .padStart(2, '0');
    return `${h}:${m}:00`;
  }

  private normalizeTime(input: string): string {
    const cleaned = input.replace('.', ':');
    const minutes = this.toMinutes(cleaned);
    return this.toTime(minutes);
  }

  /* ================= CREATE SLOT ================= */

  async createSlot(dto: any, doctorId: number) {
    if (dto.slotType === SlotType.CUSTOM)
      return this.createCustom(dto, doctorId);

    if (dto.slotType === SlotType.RECURRING)
      return this.createRecurring(dto, doctorId);

    throw new BadRequestException('Invalid slotType');
  }

  /* ================= SUB SLOT GENERATOR ================= */

  private async generateSubSlots(
    manager: EntityManager,
    parent: Slot,
  ) {
    const start = this.toMinutes(parent.startTime);
    const end = this.toMinutes(parent.endTime);

    let current = start;

    while (current < end) {
      const next = current + parent.duration;

      const child = manager.create(Slot, {
        doctorId: parent.doctorId,
        slotType: parent.slotType,
        mode: parent.mode,
        session: parent.session,
        date: parent.date,
        startTime: this.toTime(current),
        endTime:
          next > end
            ? this.toTime(end)
            : this.toTime(next),
        duration: parent.duration,
        maxPatients: 1,
        isParent: false,
        branchId: parent.id,
      });

      await manager.save(child);
      current = next;
    }
  }

  /* ================= CUSTOM SLOT ================= */

  private async createCustom(dto: any, doctorId: number) {
    return this.dataSource.transaction(async (m) => {

      const startTime = this.normalizeTime(dto.startTime);
      const endTime = this.normalizeTime(dto.endTime);

      await m.delete(Slot, {
        doctorId,
        date: dto.date,
        isParent: true,
      });

      const parent = m.create(Slot, {
        ...dto,
        doctorId,
        startTime,
        endTime,
        duration: dto.duration,
        isParent: true,
      });

      const saved = await m.save(parent);

      await this.generateSubSlots(m, saved);

      return m.findOne(Slot, {
        where: { id: saved.id },
        relations: ['children'],
      });
    });
  }

  /* ================= RECURRING SLOT ================= */

  private async createRecurring(dto: any, doctorId: number) {
    const dayMap = {
      SUNDAY: 0,
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
    };

    const results: Slot[] = [];

    return this.dataSource.transaction(async (m) => {
      const start = new Date(dto.startDate);
      const end = new Date(dto.endDate);

      for (
        let d = new Date(start);
        d <= end;
        d.setDate(d.getDate() + 1)
      ) {
        const dayName = Object.keys(dayMap).find(
          (k) => dayMap[k] === d.getDay(),
        );

        if (!dto.days.includes(dayName)) continue;

        const dateStr = d.toISOString().split('T')[0];

        const startTime = this.normalizeTime(dto.startTime);
        const endTime = this.normalizeTime(dto.endTime);

        const parent = m.create(Slot, {
          doctorId,
          slotType: SlotType.RECURRING,
          mode: dto.mode,
          session: dto.session,
          date: dateStr,
          startTime,
          endTime,
          duration: dto.duration,
          maxPatients: Math.floor(
            (this.toMinutes(endTime) -
              this.toMinutes(startTime)) /
              dto.duration,
          ),
          isParent: true,
        });

        const saved = await m.save(parent);

        await this.generateSubSlots(m, saved);

        const full = await m.findOne(Slot, {
          where: { id: saved.id },
          relations: ['children'],
        });

        if (full) results.push(full);
      }

      return results;
    });
  }

  /* ================= ELASTIC UPDATE ================= */

  async elasticUpdate(
    mainSlotId: number,
    newEndTime: string,
    doctorId: number,
  ) {
    return this.dataSource.transaction(async (manager) => {

      const mainSlot = await manager.findOne(Slot, {
        where: { id: mainSlotId, doctorId, isParent: true },
      });

      if (!mainSlot) {
        throw new BadRequestException('Main slot not found');
      }

      /* ===== 1 HOUR MODIFICATION RESTRICTION ===== */

      const slotDateTime = new Date(
        `${mainSlot.date}T${mainSlot.startTime}+05:30`,
      );

      const oneHourBefore = new Date(
        slotDateTime.getTime() - 60 * 60 * 1000,
      );

      const now = new Date();

      if (now >= oneHourBefore) {
        throw new BadRequestException(
          'Slot cannot be modified within 1 hour of start time',
        );
      }

      const formattedEndTime = this.normalizeTime(newEndTime);

      const startMinutes = this.toMinutes(mainSlot.startTime);
      const newEndMinutes = this.toMinutes(formattedEndTime);
      const oldEndMinutes = this.toMinutes(mainSlot.endTime);

      if (newEndMinutes === oldEndMinutes) {
        throw new BadRequestException('No time change detected');
      }

      if (newEndMinutes <= startMinutes) {
        throw new BadRequestException('Invalid time range');
      }

      const subSlots = await manager.find(Slot, {
        where: { branchId: mainSlotId },
        order: { startTime: 'ASC' },
      });

      if (subSlots.length === 0) {
        throw new BadRequestException('No subslots found');
      }

      /* ================= SHRINK ================= */

      if (newEndMinutes < oldEndMinutes) {

        const newDuration = Math.floor(
          (newEndMinutes - startMinutes) / subSlots.length,
        );

        let cursor = startMinutes;

        for (let sub of subSlots) {
          sub.startTime = this.toTime(cursor);
          sub.endTime = this.toTime(cursor + newDuration);
          cursor += newDuration;
        }

        mainSlot.endTime = formattedEndTime;
        mainSlot.duration = newDuration;

        await manager.save(subSlots);
        await manager.save(mainSlot);

        return {
          message: 'Slot shrunk successfully',
          newDuration,
        };
      }

      /* ================= EXPAND ================= */

      else {

        const duration = mainSlot.duration;
        let lastEndTime =
          this.toMinutes(subSlots[subSlots.length - 1].endTime);

        const newSubSlots: Slot[] = [];

        while (lastEndTime + duration <= newEndMinutes) {

          const sub = manager.create(Slot, {
            doctorId,
            slotType: mainSlot.slotType,
            mode: mainSlot.mode,
            session: mainSlot.session,
            date: mainSlot.date,
            startTime: this.toTime(lastEndTime),
            endTime: this.toTime(lastEndTime + duration),
            duration,
            maxPatients: 1,
            isParent: false,
            branchId: mainSlot.id,
          });

          newSubSlots.push(sub);
          lastEndTime += duration;
        }

        mainSlot.endTime = formattedEndTime;

        await manager.save(newSubSlots);
        await manager.save(mainSlot);

        return {
          message: 'Slot expanded successfully',
          addedSlots: newSubSlots.length,
        };
      }

    });
  }

  /* ================= GET DOCTOR SLOTS ================= */

  async getDoctorSlots(doctorId: number) {
    return this.slotRepo.find({
      where: { doctorId, isParent: true },
      relations: ['children'],
      order: { date: 'ASC' },
    });
  }
}