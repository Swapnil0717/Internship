import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Slot } from '../slots/slot.entity';
import { Appointment } from '../appointment/appointment.entity';

export enum UserRole {
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  // =============================
  // BASIC DETAILS
  // =============================

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string; // set when profile completed

  @Column({ nullable: true })
  refreshToken: string; // for JWT refresh flow

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;

  @Column({ nullable: true })
  phoneNumber: string;

  // =============================
  // DOCTOR-SPECIFIC FIELD
  // =============================

  @Column({ nullable: true })
  specialization: string;

  // =============================
  // PROFILE STATUS
  // =============================

  @Column({ default: false })
  isProfileCompleted: boolean;

  // =============================
  // RELATIONSHIPS
  // =============================

  @OneToMany(() => Slot, (slot) => slot.doctor)
  slots: Slot[];

  @OneToMany(() => Appointment, appointment => appointment.patient)
  appointments: Appointment[];

  // =============================
  // TIMESTAMPS
  // =============================

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
