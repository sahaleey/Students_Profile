import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('programs')
export class Program {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column('text')
  description!: string;

  @Column()
  duration!: string;

  @Column()
  eligibility!: string;

  @Column({ nullable: true, type: 'text' })
  conditions!: string;

  @Column({ default: 'Evaluating' })
  status!: string; // 'Ongoing', 'Evaluating', 'Results Declared'

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  createdBy!: User; // The specific Sub-Wing account

  @CreateDateColumn()
  createdAt!: Date;
}
