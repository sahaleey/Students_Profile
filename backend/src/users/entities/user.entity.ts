import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
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

  @Column({ nullable: true })
  phone!: string;

  @Column({ type: 'enum', enum: Role, default: Role.STUDENT })
  role!: Role;

  @Column()
  fullName!: string;

  @Column({ nullable: true })
  class!: string;

  @Column({ type: 'varchar', nullable: true })
  admissionNumber!: string | null;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.children, { nullable: true })
  @JoinColumn()
  parent!: User;

  // 🚀 For Parents: Who are their children?
  @OneToMany(() => User, (user) => user.parent)
  children!: User[];

  @Column({ nullable: true })
  fcmToken!: string;
}
