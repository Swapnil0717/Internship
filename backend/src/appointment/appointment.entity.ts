import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from 'typeorm';

import { Slot } from '../slots/slot.entity';
import { User } from '../user/user.entity';

export enum AppointmentStatus {
  BOOKED = 'BOOKED',
  CANCELLED = 'CANCELLED',
}

@Entity()
export class Appointment {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  patient: User;

  @ManyToOne(() => User)
  doctor: User;

  @ManyToOne(() => Slot)
  slot: Slot;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.BOOKED,
  })
  status: AppointmentStatus;

  @CreateDateColumn()
  createdAt: Date;
}