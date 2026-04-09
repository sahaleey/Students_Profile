import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Punishment } from './punishment.entity';

export enum SubmissionStatus {
  PENDING = 'Pending Verification',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column()
  purpose!: string; // 'Achievement' or 'Punishment Clearance'

  @Column({ nullable: true })
  fileUrl!: string;

  @Column({
    type: 'enum',
    enum: SubmissionStatus,
    default: SubmissionStatus.PENDING,
  })
  status!: SubmissionStatus;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  student!: User;

  // If this submission is meant to clear a punishment, link it here
  @ManyToOne(() => Punishment, { nullable: true, eager: true })
  @JoinColumn()
  targetPunishment!: Punishment;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn()
  verifiedBy!: User;
}
