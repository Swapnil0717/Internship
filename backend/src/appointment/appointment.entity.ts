import { Slot } from 'src/slots/slot.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Column,
} from 'typeorm';
import { User } from '../user/user.entity';


@Entity()
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.appointments)
  patient: User;

  @ManyToOne(() => Slot, slot => slot.appointments, { eager: true })
  slot: Slot;

  @Column({ default: 'BOOKED' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
