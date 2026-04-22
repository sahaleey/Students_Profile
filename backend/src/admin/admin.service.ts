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
import { ArrivalSession } from './entities/arrival-session.entity';
import { Arrival } from '../usthad/entities/arrival.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(AcademicMonth)
    private monthRepo: Repository<AcademicMonth>,
    @InjectRepository(Achievement)
    private achievementRepo: Repository<Achievement>,
    @InjectRepository(Punishment)
    private punishmentRepo: Repository<Punishment>,
    @InjectRepository(ArrivalSession)
    private sessionRepo: Repository<ArrivalSession>,
    @InjectRepository(Arrival) private arrivalRepo: Repository<Arrival>,
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

    // 🚀 1. Find the currently active academic month
    const activeMonth = await this.monthRepo.findOne({
      where: { isActive: true },
    });
    const activeMonthName = activeMonth ? activeMonth.name : 'Default Term';

    // 🚀 2. Calculate both All-Time and Monthly points for each student
    const studentStats: Record<
      string,
      {
        name: string;
        points: number;
        currentMonthPoints: number;
        class: string;
      }
    > = {};

    achievements.forEach((a) => {
      if (!a.student) return;

      if (!studentStats[a.student.id]) {
        studentStats[a.student.id] = {
          name: a.student.fullName,
          points: 0,
          currentMonthPoints: 0,
          class: a.student.class || 'N/A',
        };
      }

      // Add to All-Time points
      studentStats[a.student.id].points += a.points;

      // Add to Monthly points IF the achievement matches the active month
      if (a.academicMonth === activeMonthName) {
        studentStats[a.student.id].currentMonthPoints += a.points;
      }
    });

    // 🚀 3. Sort for All-Time Top 5
    const topStudents = Object.values(studentStats)
      .sort((a, b) => b.points - a.points)
      .slice(0, 5);

    // 🚀 4. Sort for Monthly Top 10 (Filtering out students with 0 points this month)
    const topStudentsMonth = Object.values(studentStats)
      .filter((s) => s.currentMonthPoints > 0)
      .sort((a, b) => b.currentMonthPoints - a.currentMonthPoints)
      .slice(0, 10);

    return {
      studentsCount,
      usthadsCount,
      activePunishments,
      totalPointsAwarded,
      activeMonthName, // Sent to frontend for the Banner
      topStudents, // All-Time Top 5
      topStudentsMonth, // Monthly Top 10
    };
  }
  // 2. Create a new user
  async createUser(data: {
    fullName: string;
    username: string;
    class?: string;
    department?: string;
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
      department: data.department,
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
  // Inside admin.service.ts
  async getArrivalGateStatus() {
    const activeSession = await this.sessionRepo.findOne({
      where: { isOpen: true },
    });

    // 🚀 NEW: Find all students who already arrived in this session
    let arrivedStudentIds: string[] = [];
    if (activeSession) {
      const existingArrivals = await this.arrivalRepo.find({
        where: { sessionId: activeSession.id },
        relations: ['student'],
      });
      arrivedStudentIds = existingArrivals.map((a) => a.student.id);
    }

    return {
      isOpen: !!activeSession,
      session: activeSession,
      arrivedStudentIds, // 🚀 Send this array to the frontend
    };
  }

  async toggleArrivalGate(isOpen: boolean) {
    if (isOpen) {
      // Open a new session
      const newSession = this.sessionRepo.create({ isOpen: true });
      return this.sessionRepo.save(newSession);
    } else {
      // Close the active session
      const activeSession = await this.sessionRepo.findOne({
        where: { isOpen: true },
      });
      if (activeSession) {
        activeSession.isOpen = false;
        activeSession.closedAt = new Date();
        return this.sessionRepo.save(activeSession);
      }
    }
  }

  // 🚀 FETCH THE REPORT
  async getLatestArrivalReport() {
    // Get the most recently opened session (open or closed)
    const latestSession = await this.sessionRepo.findOne({
      where: {},
      order: { openedAt: 'DESC' },
    });

    if (!latestSession) return { session: null, records: [] };

    // Fetch all arrivals recorded during this session
    const records = await this.arrivalRepo.find({
      where: { sessionId: latestSession.id },
      relations: ['student'],
      order: { recordedTime: 'DESC' },
    });

    return { session: latestSession, records };
  }
}
