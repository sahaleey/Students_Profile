import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('arrivals')
export class Arrival {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User)
  student!: User;

  @Column()
  recordedTime!: Date;

  @Column()
  isLate!: boolean;

  @Column({ default: false })
  fineAssigned!: boolean;

  @Column()
  academicMonth!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ default: false })
  isExcused!: boolean;

  @Column({ nullable: true })
  sessionId!: string;
}
