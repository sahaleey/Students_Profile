import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('achievements')
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string; // e.g., 'Won Quiz Competition'

  @Column('int')
  points!: number;

  @Column({ default: 'Term 1 - 2026' })
  academicMonth!: string;

  @ManyToOne(() => User, { eager: true })
  student!: User;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  awardedBy!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ default: false })
  isSpecialHighlight!: boolean;
}
