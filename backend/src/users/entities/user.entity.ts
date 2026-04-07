import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { Role } from '../enums/role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  username!: string; // Students can use Admn No here

  @Column()
  passwordHash!: string; // We NEVER store plain text passwords

  @Column({ type: 'enum', enum: Role, default: Role.STUDENT })
  role!: Role;

  @Column()
  fullName!: string;

  @Column({ type: 'varchar', nullable: true })
  admissionNumber!: string | null;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
