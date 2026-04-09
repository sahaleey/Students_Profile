import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Punishment, PunishmentStatus } from './entities/punishment.entity';
import { Achievement } from './entities/achievement.entity';
import { Submission, SubmissionStatus } from './entities/submission.entity';
import { User } from '../users/entities/user.entity';
import { AcademicMonth } from '../admin/entities/academic-month.entity';

interface AssignPunishmentData {
  title: string;
  category: string;
  description: string;
}

interface GrantAchievementData {
  title: string;
  points: number;
  academicMonth?: string;
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
    @InjectRepository(AcademicMonth)
    private monthRepo: Repository<AcademicMonth>,
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
      awardedBy: { id: usthadId },
      student: { id: studentId },
      academicMonth: data.academicMonth,
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
  // 4. Verify Student Submission

  async verifySubmission(
    usthadId: string,
    submissionId: string,
    status: string,
    awardedPoints?: number, // 🚀 Added optional points parameter
  ) {
    const submission = await this.submissionRepo.findOne({
      where: { id: submissionId },
      relations: ['student', 'targetPunishment'],
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    const verifier = await this.userRepo.findOne({
      where: { id: usthadId },
    });
    if (!verifier) {
      throw new NotFoundException('Usthad not found');
    }

    if (status === 'APPROVED') {
      submission.status = SubmissionStatus.APPROVED;
    } else if (status === 'REJECTED') {
      submission.status = SubmissionStatus.REJECTED;
    }
    submission.verifiedBy = verifier;
    const savedSubmission = await this.submissionRepo.save(submission);

    // Scenario A: It was a Punishment Clearance
    if (
      status === 'APPROVED' &&
      submission.targetPunishment &&
      submission.targetPunishment.id
    ) {
      const punishment = await this.punishmentRepo.findOne({
        where: { id: submission.targetPunishment.id },
      });
      if (punishment) {
        punishment.status = 'Resolved' as any;
        await this.punishmentRepo.save(punishment);
      }
    }
    // Scenario B: It was an Achievement Request (No punishment attached!)
    else if (
      status === 'APPROVED' &&
      !submission.targetPunishment &&
      awardedPoints
    ) {
      // 🚀 Automatically create the achievement and give the points!
      const activeMonthRecord = await this.monthRepo.findOne({
        where: { isActive: true },
      });
      const currentMonth = activeMonthRecord
        ? activeMonthRecord.name
        : 'Default Term';
      const newAchievement = this.achievementRepo.create({
        student: { id: submission.student.id },
        awardedBy: { id: usthadId },
        title: submission.title.split(' | ')[0], // Just use the title part
        points: awardedPoints,
        academicMonth: currentMonth,
      });
      await this.achievementRepo.save(newAchievement);
    }

    return savedSubmission;
  }
  // Remove a punishment record (for mistakes or resolved issues)
  async removePunishment(punishmentId: string) {
    const punishment = await this.punishmentRepo.findOne({
      where: { id: punishmentId },
    });

    if (!punishment) {
      throw new NotFoundException('Punishment not found');
    }

    // This completely removes the row from the database table
    return this.punishmentRepo.remove(punishment);
  }
  // For create Attachment
  async createAttachmentOnBehalf(
    usthadId: string,
    data: { studentId: string; punishmentId: string; workTitle: string },
  ) {
    const punishment = await this.punishmentRepo.findOne({
      where: { id: data.punishmentId },
    });
    if (!punishment) throw new NotFoundException('Punishment not found');

    const submission = this.submissionRepo.create({
      student: { id: data.studentId },
      targetPunishment: { id: data.punishmentId },
      purpose: 'ATTACHMENT',
      title: data.workTitle,
      status: SubmissionStatus.APPROVED, // If Usthad creates it, it's instantly approved!
      // verifiedBy: { id: usthadId } // Optional
    });

    await this.submissionRepo.save(submission);

    // Auto-resolve the punishment
    punishment.status = PunishmentStatus.RESOLVED;
    await this.punishmentRepo.save(punishment);

    return submission;
  }

  // For Remove Achievement (if needed, e.g., for mistakes)
  async removeAchievement(achievementId: string) {
    const achievement = await this.achievementRepo.findOne({
      where: { id: achievementId },
    });
    if (!achievement) throw new NotFoundException('Achievement not found');
    return this.achievementRepo.remove(achievement);
  }
}
