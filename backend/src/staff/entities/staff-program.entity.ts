import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('staff_programs')
export class StaffProgram {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column('text')
  description!: string;

  @Column()
  department!: string; // 'Outreach' or 'Welfare'

  @ManyToOne(() => User)
  createdBy!: User;

  @CreateDateColumn()
  date!: Date;
}
