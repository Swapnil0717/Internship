import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum UserRole {
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  googleId?: string;

  @Column({ nullable: true })
  password?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PATIENT
  })
  role: UserRole;

  @Column({ nullable: true })
  specialization?: string;
}
