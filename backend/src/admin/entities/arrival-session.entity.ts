import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('arrival_sessions')
export class ArrivalSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ default: true })
  isOpen!: boolean;

  @CreateDateColumn()
  openedAt!: Date;

  @Column({ nullable: true })
  closedAt!: Date;
}
