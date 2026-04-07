import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
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

  @ManyToOne(() => User, { eager: true })
  student!: User;

  @ManyToOne(() => User, { eager: true })
  grantedBy!: User;

  @CreateDateColumn()
  createdAt!: Date;
}
