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
import { Achievement } from '../usthad/entities/achievement.entity';
import {
  Punishment,
  PunishmentStatus,
} from '../usthad/entities/punishment.entity';
import { Role } from 'src/users/enums/role.enum';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(AcademicMonth)
    private monthRepo: Repository<AcademicMonth>,
    @InjectRepository(Achievement)
    private achievementRepo: Repository<Achievement>, // 🚀 Added
    @InjectRepository(Punishment)
    private punishmentRepo: Repository<Punishment>, // 🚀 Added
  ) {}

  // 1. Get all users
  async getAllUsers() {
    const users = await this.usersRepository.find({
      select: ['id', 'fullName', 'username', 'role', 'class', 'isActive'],
      order: { role: 'ASC', fullName: 'ASC' },
    });

    const achievements = await this.achievementRepo.find({
      relations: ['student'],
    });
    const activeMonth = await this.monthRepo.findOne({
      where: { isActive: true },
    });

    // Find the most recently closed month to show "Past Month Points"
    const pastMonth = await this.monthRepo.findOne({
      where: { isActive: false },
      order: { closedAt: 'DESC' },
    });

    return users.map((user) => {
      const userAchievements = achievements.filter(
        (a) => a.student?.id === user.id,
      );

      const totalPoints = userAchievements.reduce(
        (sum, a) => sum + a.points,
        0,
      );
      const currentMonthPoints = activeMonth
        ? userAchievements
            .filter((a) => a.academicMonth === activeMonth.name)
            .reduce((sum, a) => sum + a.points, 0)
        : 0;
      const pastMonthPoints = pastMonth
        ? userAchievements
            .filter((a) => a.academicMonth === pastMonth.name)
            .reduce((sum, a) => sum + a.points, 0)
        : 0;

      return { ...user, totalPoints, currentMonthPoints, pastMonthPoints };
    });
  }

  // 3. Add the brand new System Report generator!
  async getSystemReport() {
    const studentsCount = await this.usersRepository.count({
      where: { role: 'student' as any, isActive: true },
    });
    const usthadsCount = await this.usersRepository.count({
      where: { role: 'usthad' as any, isActive: true },
    });
    const activePunishments = await this.punishmentRepo.count({
      where: { status: PunishmentStatus.ACTIVE },
    });

    const achievements = await this.achievementRepo.find({
      relations: ['student'],
    });
    const totalPointsAwarded = achievements.reduce(
      (sum, a) => sum + a.points,
      0,
    );

    // Calculate Top 5 Students
    const studentStats: Record<
      string,
      { name: string; points: number; class: string }
    > = {};
    achievements.forEach((a) => {
      if (!a.student) return;
      if (!studentStats[a.student.id]) {
        studentStats[a.student.id] = {
          name: a.student.fullName,
          points: 0,
          class: a.student.class || 'N/A',
        };
      }
      studentStats[a.student.id].points += a.points;
    });

    const topStudents = Object.values(studentStats)
      .sort((a, b) => b.points - a.points)
      .slice(0, 5);

    return {
      studentsCount,
      usthadsCount,
      activePunishments,
      totalPointsAwarded,
      topStudents,
    };
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

  async createParentAccount(data: {
    studentId: string;
    parentName: string;
    parentPhone: string;
  }) {
    // 1. Find the student
    const student = await this.usersRepository.findOne({
      where: { id: data.studentId },
    });
    if (!student) throw new Error('Student not found');

    // 2. Check if this parent phone number already exists (maybe they have 2 kids in the school!)
    let parent = await this.usersRepository.findOne({
      where: { username: data.parentPhone, role: Role.PARENT },
    });

    if (!parent) {
      // 3. If parent doesn't exist, create a new account for them
      const hashedPassword = await bcrypt.hash('parent123', 10); // Default password for all parents

      parent = this.usersRepository.create({
        fullName: data.parentName,
        username: data.parentPhone, // They log in with their phone number
        phone: data.parentPhone, // We also save it in the dedicated phone column
        passwordHash: hashedPassword,
        role: Role.PARENT,
        isActive: true,
      });
      parent = await this.usersRepository.save(parent);
    }

    // 4. Link the student to this parent
    student.parent = parent;
    await this.usersRepository.save(student);

    return {
      message: 'Parent linked successfully!',
      parentLogin: data.parentPhone,
      defaultPassword: 'parent123',
    };
  }
  async getAllParents() {
    return this.usersRepository.find({
      where: { role: Role.PARENT },
      relations: ['children'], // 🚀 Make sure to load the linked children!
      order: { fullName: 'ASC' },
    });
  }
}
