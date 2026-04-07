// backend/src/users/users.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './enums/role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // 🔥 This runs automatically when NestJS starts
  async onModuleInit() {
    const userCount = await this.usersRepository.count();

    // If the database is empty, seed it!
    if (userCount === 0) {
      console.log('🌱 Empty database detected. Seeding initial users...');

      // Hash the password 'password123'
      const defaultPassword = await bcrypt.hash('password123', 10);

      // Create Student
      await this.usersRepository.save({
        username: '1042',
        fullName: 'Sahaleey',
        admissionNumber: '1042',
        role: Role.STUDENT,
        passwordHash: defaultPassword,
      });

      // Create Usthad
      await this.usersRepository.save({
        username: 'usthad_ahmad',
        fullName: 'Usthad Ahmad',
        role: Role.USTHAD,
        passwordHash: defaultPassword,
      });

      console.log('✅ Users seeded successfully! You can now log in.');
    }
  }

  // Your existing method for the auth system
  async findOneByUsername(username: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { username } });
    return user ?? undefined;
  }
}
