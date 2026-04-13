// backend/src/users/users.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './enums/role.enum';
import * as bcrypt from 'bcrypt';

interface UserImportData {
  fullName: string;
  username: string;
  password?: string;
  role?: string;
  class?: string | number;
}

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // 🔥 This runs automatically when NestJS starts
  async onModuleInit() {
    const userCount = await this.usersRepository.count();
    const adminExists = await this.usersRepository.findOne({
      where: { role: Role.ADMIN },
    });

    if (!adminExists) {
      // Create the default admin
      const hashedPassword = await bcrypt.hash('admin123', 10); // Default password
      const admin = this.usersRepository.create({
        fullName: 'System Administrator',
        username: 'admin', // This is what you will type in the login box
        passwordHash: hashedPassword,
        role: Role.ADMIN,
        isActive: true,
      });

      await this.usersRepository.save(admin);
      console.log(
        '✅ SYSTEM BOOTSTRAP: Default Admin created! (User: admin | Pass: admin123)',
      );
    }

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
  async bulkImportUsers(usersArray: UserImportData[]) {
    const newUsers: User[] = [];

    for (const userData of usersArray) {
      // Hash a default password for everyone, e.g., 'campus123'
      const hashedPassword = await bcrypt.hash(
        userData.password || 'campus123',
        10,
      );

      const user = this.usersRepository.create({
        fullName: userData.fullName,
        username: userData.username, // Their Admission Number
        role: (userData.role as Role) || Role.STUDENT,
        class: userData.class ? String(userData.class) : 'Unassigned',
        passwordHash: hashedPassword,
        isActive: true,
      });

      newUsers.push(user);
    }

    // Save all 200 users to the database in one massive, highly-efficient query!
    await this.usersRepository.save(newUsers);

    return { message: `Successfully imported ${newUsers.length} users!` };
  }
  // Your existing method for the auth system
  async findOneByUsername(username: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { username } });
    return user ?? undefined;
  }

  async findOneById(id: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { id } });
    return user ?? undefined;
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.usersRepository.update({ id }, { passwordHash });
  }
}
