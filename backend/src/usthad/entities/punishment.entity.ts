import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum PunishmentStatus {
  ACTIVE = 'Active',
  RESOLVED = 'Resolved',
}

@Entity('punishments')
export class Punishment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column()
  category!: string; // e.g., 'Public Behavior', 'Masjid'

  @Column('text')
  description!: string;

  @Column({
    type: 'enum',
    enum: PunishmentStatus,
    default: PunishmentStatus.ACTIVE,
  })
  status: PunishmentStatus = PunishmentStatus.ACTIVE;

  // The student receiving the punishment
  @ManyToOne(() => User, { eager: true })
  student!: User;

  // The Usthad who assigned it
  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  assignedBy!: User;

  @CreateDateColumn()
  createdAt!: Date;
  @Column({ default: 'PUNISHMENT' })
  actionType!: string;
}
