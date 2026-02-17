import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Slot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: string; // YYYY-MM-DD

  @Column()
  startTime: string; // HH:mm

  @Column()
  endTime: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.slots, { onDelete: 'CASCADE' })
  doctor: User;
}
