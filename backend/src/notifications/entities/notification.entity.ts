import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  recipient!: User;

  @Column()
  title!: string;

  @Column('text')
  message!: string;

  @Column({ default: 'INFO' })
  type!: string; // e.g., 'SUCCESS', 'WARNING', 'ERROR', 'INFO'

  @Column({ default: false })
  isRead!: boolean;

  @Column({ nullable: true })
  link!: string; // Where the user should go when they click it

  @CreateDateColumn()
  createdAt!: Date;
}
