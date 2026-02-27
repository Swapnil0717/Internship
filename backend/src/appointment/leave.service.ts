import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Between,
  DataSource,
} from 'typeorm';

import { Leave } from './leave.entity';
import { Slot } from '../slots/slot.entity';
import { Appointment, AppointmentStatus } from './appointment.entity';
import { User } from '../user/user.entity';

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(Leave)
    private leaveRepo: Repository<Leave>,

    @InjectRepository(Slot)
    private slotRepo: Repository<Slot>,

    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,

    private dataSource: DataSource,
  ) {}

  async addLeave(dto: any, user: User) {

    if (user.role !== 'DOCTOR') {
      throw new ForbiddenException('Only doctor can add leave');
    }

    const { startDate, endDate, reason } = dto;

    if (!startDate || !endDate) {
      throw new BadRequestException('Start and End date required');
    }

    if (startDate > endDate) {
      throw new BadRequestException('Invalid date range');
    }

    return this.dataSource.transaction(async (manager) => {

      // 🚫 Prevent overlapping leave
      const existingLeave = await manager.findOne(Leave, {
        where: {
          doctor: { id: user.id },
          startDate: Between(startDate, endDate),
        },
      });

      if (existingLeave) {
        throw new BadRequestException('Leave already exists in this range');
      }

      // ✅ Create leave
      const leave = manager.create(Leave, {
        startDate,
        endDate,
        reason,
        doctor: user,
      });

      await manager.save(leave);

      // 🔍 Get all slots in range
      const slots = await manager.find(Slot, {
        where: {
          doctor: { id: user.id },
          date: Between(startDate, endDate),
        },
      });

      for (const slot of slots) {

        // 🛑 Check if booked appointment exists
        const booked = await manager.findOne(Appointment, {
          where: {
            slot: { id: slot.id },
            status: AppointmentStatus.BOOKED,
          },
        });

        if (booked) {
          throw new BadRequestException(
            `Cannot apply leave. Slot ${slot.id} has booked appointment.`,
          );
        }
      }

      // 🗑 Safe to delete slots
      await manager.delete(Slot, {
        doctor: { id: user.id },
        date: Between(startDate, endDate),
      });

      return {
        message: 'Leave added and slots removed successfully',
      };
    });
  }
}