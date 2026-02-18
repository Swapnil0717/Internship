import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Appointment } from '../appointment/appointment.entity';

export enum SlotType {
  CUSTOM = 'CUSTOM',
  RECURRING = 'RECURRING',
}

export enum SlotMode {
  STREAM = 'STREAM',
  WAVE = 'WAVE',
}

@Entity()
export class Slot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: string; // YYYY-MM-DD

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @Column({
    type: 'enum',
    enum: SlotType,
  })
  slotType: SlotType;

  @Column({
    type: 'enum',
    enum: SlotMode,
  })
  mode: SlotMode;

  @Column({ nullable: true })
  capacity: number; // required only for WAVE

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.slots)
  doctor: User;

  @OneToMany(() => Appointment, (appt) => appt.slot)
  appointments: Appointment[];
}
