import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('slot_modification_log')
export class SlotModificationLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  doctorId: number;

  @Column()
  slotId: number;

  @Column()
  oldStartTime: string;

  @Column()
  oldEndTime: string;

  @Column()
  newStartTime: string;

  @Column()
  newEndTime: string;

  @Column()
  actionType: 'EXPAND' | 'SHRINK';

  @CreateDateColumn()
  createdAt: Date;
}