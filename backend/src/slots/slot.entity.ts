import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { User } from '../user/user.entity';
import { SlotType, SlotMode, SessionType } from './slot.enums';

@Entity()
export class Slot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: string;

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
    nullable: true,
  })
  mode: SlotMode;

  @Column({
    type: 'enum',
    enum: SessionType,
  })
  session: SessionType;

  @Column()
  duration: number;

  @Column()
  maxPatient: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  subSlots: {
    startTime: string;
    endTime: string;
    bookedCount: number;
  }[];

  @ManyToOne(() => User, { eager: true })
  doctor: User;
}