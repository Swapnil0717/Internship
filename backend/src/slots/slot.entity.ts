import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

export enum SlotType {
  CUSTOM = 'CUSTOM',
  RECURRING = 'RECURRING',
}

export enum SlotMode {
  STREAM = 'STREAM',
  WAVE = 'WAVE',
}

export enum SlotSession {
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
  EVENING = 'EVENING',
}

@Entity({ name: 'slots' })
export class Slot {
  @PrimaryGeneratedColumn()
  id: number;

  // ✅ Proper Foreign Key
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctorId' })
  doctor: User;

  @Column()
  doctorId: number; // 👈 Explicit FK column

  @Column({
    type: 'enum',
    enum: SlotType,
  })
  slotType: SlotType;

  @Column({ type: 'enum', enum: SlotMode })
  mode: SlotMode;

  @Column({ type: 'enum', enum: SlotSession })
  session: SlotSession;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({ type: 'int' })
  duration: number;

  @Column({ type: 'int' })
  maxPatients: number;

  @Column({ type: 'int', default: 0 })
  currentPatients: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}