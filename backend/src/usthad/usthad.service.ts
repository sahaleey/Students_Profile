import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Punishment } from './entities/punishment.entity';
import { Achievement } from './entities/achievement.entity';
import { Submission, SubmissionStatus } from './entities/submission.entity';
import { User } from '../users/entities/user.entity';

interface AssignPunishmentData {
  title: string;
  category: string;
  description: string;
}

interface GrantAchievementData {
  title: string;
  points: number;
}

@Injectable()
export class UsthadService {
  constructor(
    @InjectRepository(Punishment)
    private punishmentRepo: Repository<Punishment>,
    @InjectRepository(Achievement)
    private achievementRepo: Repository<Achievement>,
    @InjectRepository(Submission)
    private submissionRepo: Repository<Submission>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  // 1. Assign Punishment
  async assignPunishment(
    usthadId: string,
    studentId: string,
    data: AssignPunishmentData,
  ) {
    const student = await this.userRepo.findOne({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Student not found');

    const punishment = this.punishmentRepo.create({
      title: data.title,
      category: data.category,
      description: data.description,
      student: { id: studentId },
      assignedBy: { id: usthadId },
    });
    return this.punishmentRepo.save(punishment);
  }

  // 2. Grant Achievement (Points)
  async grantAchievement(
    usthadId: string,
    studentId: string,
    data: GrantAchievementData,
  ) {
    const achievement = this.achievementRepo.create({
      title: data.title,
      points: data.points,
      student: { id: studentId },
      grantedBy: { id: usthadId },
    });
    return this.achievementRepo.save(achievement);
  }

  // 3. Get Dashboard Stats & Pending Submissions
  async getDashboardOverview() {
    const pendingSubmissions = await this.submissionRepo.find({
      where: { status: SubmissionStatus.PENDING },
      relations: ['student', 'targetPunishment'],
      order: { createdAt: 'DESC' },
    });

    const punishmentsCount = await this.punishmentRepo.count();
    const achievementsCount = await this.achievementRepo.count();

    return {
      stats: {
        punishmentsCount,
        achievementsCount,
        pendingVerifications: pendingSubmissions.length,
      },
      pendingSubmissions,
    };
  }
}
