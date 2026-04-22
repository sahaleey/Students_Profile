import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement } from '../usthad/entities/achievement.entity';
import { Punishment } from '../usthad/entities/punishment.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Achievement)
    private achievementRepo: Repository<Achievement>,
    @InjectRepository(Punishment)
    private punishmentRepo: Repository<Punishment>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async getDashboardData(staffId: string) {
    const staff = await this.userRepo.findOne({ where: { id: staffId } });
    const department = staff?.department || 'Staff';

    // 1. Get achievements awarded by this staff member
    const awardedAchievements = await this.achievementRepo.find({
      where: { awardedBy: { id: staffId } },
      relations: ['student'],
      order: { createdAt: 'DESC' },
    });

    const totalPointsGiven = awardedAchievements.reduce(
      (sum, a) => sum + a.points,
      0,
    );

    // 2. If Library, get fines issued by this staff member
    let issuedFines: Punishment[] = [];
    if (department === 'Library') {
      issuedFines = await this.punishmentRepo.find({
        where: { assignedBy: { id: staffId }, actionType: 'FINE' },
        relations: ['student'],
        order: { createdAt: 'DESC' },
      });
    }

    // 3. Combine into a "Recent Activity" timeline
    const recentActivities = [
      ...awardedAchievements.map((a) => ({
        id: `ach_${a.id}`,
        type: 'Achievement',
        title: a.title,
        points: a.points,
        studentName: a.student?.fullName,
        date: a.createdAt,
      })),
      ...issuedFines.map((f) => ({
        id: `fine_${f.id}`,
        type: 'Fine',
        title: f.title,
        studentName: f.student?.fullName,
        date: f.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    return {
      department,
      stats: {
        totalAchievements: awardedAchievements.length,
        totalPointsGiven,
        totalFinesIssued: issuedFines.length,
      },
      recentActivities,
    };
  }
  async getDepartmentRecords(staffId: string) {
    const staff = await this.userRepo.findOne({ where: { id: staffId } });
    if (!staff) throw new NotFoundException('Staff not found');

    const department = staff.department || 'Staff';

    // 1. Fetch all achievements awarded by ANYONE in this exact department
    const achievements = await this.achievementRepo.find({
      where: { awardedBy: { department: department } },
      relations: ['student', 'awardedBy'],
      order: { createdAt: 'DESC' },
    });

    // 2. If they are Library, fetch the book fines too!
    let fines: any[] = [];
    if (department === 'Library') {
      fines = await this.punishmentRepo.find({
        where: {
          assignedBy: { department: 'Library' },
          actionType: 'FINE',
        },
        relations: ['student', 'assignedBy'],
        order: { createdAt: 'DESC' },
      });
    }

    return {
      department,
      achievements,
      fines,
    };
  }
}
