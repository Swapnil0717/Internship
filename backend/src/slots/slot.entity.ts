import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
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

@Entity()
export class Slot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  doctorId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'doctorId' })
  doctor: User;

  @Column({ type: 'enum', enum: SlotType })
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

  @Column()
  duration: number;

  @Column()
  maxPatients: number;

  @Column({ default: true })
  isParent: boolean;

  /* 🔥 branchId replaces parentId */
  @Column({ nullable: true })
  branchId: number;

  @Column({ nullable: true })
  patientId: number;

  @OneToMany(() => Slot, (slot) => slot.branchParent)
  children: Slot[];

  @ManyToOne(() => Slot, (slot) => slot.children, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'branchId' })
  branchParent: Slot;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}