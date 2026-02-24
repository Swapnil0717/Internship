import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
  } from 'typeorm';
  import { User } from '../user/user.entity';
  
  @Entity()
  export class Leave {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'date' })
    startDate: string;
  
    @Column({ type: 'date' })
    endDate: string;
  
    @Column({ nullable: true })
    reason: string;
  
    @ManyToOne(() => User, {
      onDelete: 'CASCADE',
    })
    doctor: User;
  }