import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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

    const newUser = this.usersRepository.create({
      fullName: data.fullName,
      username: data.username,
      role: data.role,
      passwordHash: hashedPassword,
      isActive: true,

      class: data.role === ('student' as User['role']) ? data.class : undefined,
    });

    const savedUser = await this.usersRepository.save(newUser);
    const { passwordHash: _passwordHash, ...result } = savedUser; // Remove hash from response
    return result;
  }

  // 3. Toggle Access
  async toggleAccess(id: string, isActive: boolean) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    user.isActive = isActive;
    return this.usersRepository.save(user);
  }
}
