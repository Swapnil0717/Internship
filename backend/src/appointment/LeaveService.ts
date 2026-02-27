import {
    Injectable,
    BadRequestException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import {
    Repository,
    Between,
  } from 'typeorm';
  import { Leave } from './leave.entity';
  import { Slot } from '../slots/slot.entity';
  import { User } from '../user/user.entity';
  
  @Injectable()
  export class LeaveService {
    constructor(
      @InjectRepository(Leave)
      private leaveRepo: Repository<Leave>,
  
      @InjectRepository(Slot)
      private slotRepo: Repository<Slot>,
    ) {}
  
    async addLeave(dto: any, doctor: User) {
      const { startDate, endDate, reason } =
        dto;
  
      if (!startDate || !endDate)
        throw new BadRequestException(
          'Date required',
        );
  
      if (startDate > endDate)
        throw new BadRequestException(
          'Invalid range',
        );
  
      const leave = this.leaveRepo.create({
        startDate,
        endDate,
        reason,
        doctor,
      });
  
      await this.leaveRepo.save(leave);
  
      // 🔥 DELETE ALL SLOTS IN RANGE
      await this.slotRepo.delete({
        doctor: { id: doctor.id },
        date: Between(startDate, endDate),
      });
  
      return {
        message:
          'Leave added and slots deleted',
      };
    }
  }