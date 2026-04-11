import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Program } from './program.entity';

@Entity('program_results')
export class ProgramResult {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Program, { eager: true })
  @JoinColumn()
  program!: Program;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  student!: User;

  @Column({ nullable: true })
  rank!: string; // '1st', '2nd', '3rd'

  @Column({ nullable: true })
  grade!: string; // 'A', 'B', 'C'

  @Column()
  awardedPoints!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
