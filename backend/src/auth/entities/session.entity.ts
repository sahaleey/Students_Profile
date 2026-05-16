import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('user_sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  user!: User;

  @Column()
  deviceInfo!: string;

  @Column()
  ipAddress!: string;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  lastLoginAt!: Date;
}
