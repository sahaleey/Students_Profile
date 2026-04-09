import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { AcademicMonth } from './entities/academic-month.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(AcademicMonth)
    private monthRepo: Repository<AcademicMonth>,
  ) {}

  // 1. Get all users
  async getAllUsers() {
    return this.usersRepository.find({
      select: ['id', 'fullName', 'username', 'role', 'class', 'isActive'], // Exclude password hash!
      order: { createdAt: 'DESC' },
    });
  }

  // 2. Create a new user
  async createUser(data: {
    fullName: string;
    username: string;
    class?: string;
    role: User['role'];
    password: string;
  }) {
    const existingUser = await this.usersRepository.findOne({
      where: { username: data.username },
    });

    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 🚀 THE FIX: Convert role to lowercase just to be 100% safe
    const isStudent = String(data.role).toLowerCase() === 'student';

    const newUser: User = this.usersRepository.create({
      fullName: data.fullName,
      username: data.username,
      role: data.role,
      passwordHash: hashedPassword,
      isActive: true,

      // Keep type-compatible with User entity (`string | undefined`)
      class: isStudent ? data.class : undefined,
    });

    const savedUser: User = await this.usersRepository.save(newUser);
    const { passwordHash: _passwordHash, ...result } = savedUser;
    return result;
  }

  // 3. Toggle Access
  async toggleAccess(id: string, isActive: boolean) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    user.isActive = isActive;
    return this.usersRepository.save(user);
  }

  async startNewMonth(monthName: string): Promise<AcademicMonth> {
    // 1. Close all currently active months
    await this.monthRepo.update(
      { isActive: true },
      { isActive: false, closedAt: new Date() },
    );

    // 2. Start the new one
    const newMonth: AcademicMonth = this.monthRepo.create({
      name: monthName,
      isActive: true,
    });

    return this.monthRepo.save(newMonth);
  }

  async getActiveMonth() {
    const active = await this.monthRepo.findOne({ where: { isActive: true } });
    return active ? active.name : 'Unassigned Term';
  }
  // 1. Fetch all months (Active and Historical)
  async getAllMonths() {
    return this.monthRepo.find({
      order: { startedAt: 'DESC' }, // Newest first
    });
  }

  // 2. End the current active month explicitly
  async endCurrentMonth() {
    const active = await this.monthRepo.findOne({ where: { isActive: true } });
    if (!active) {
      throw new NotFoundException('No active month found to close.');
    }

    active.isActive = false;
    active.closedAt = new Date();
    return this.monthRepo.save(active);
  }
}
