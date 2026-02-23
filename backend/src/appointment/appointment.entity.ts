import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Slot } from '../slots/slot.entity';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  patient: User;

  @ManyToOne(() => Slot, { eager: true })
  slot: Slot;

  @Column({
    type: 'enum',
    enum: ['BOOKED', 'CANCELLED', 'COMPLETED'],
    default: 'BOOKED',
  })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}