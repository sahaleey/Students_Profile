import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Punishment, PunishmentStatus } from './entities/punishment.entity';
import { Achievement } from './entities/achievement.entity';
import { Submission, SubmissionStatus } from './entities/submission.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/enums/role.enum';
import { AcademicMonth } from '../admin/entities/academic-month.entity';
import { NotificationsService } from '../notifications/notifications.service';

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
    private notifService: NotificationsService,
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

    const saved = await this.punishmentRepo.save(punishment);
    // 🚀 FIRE THE NOTIFICATION!
    await this.notifService.sendNotification({
      recipientId: studentId,
      title: 'Action Required',
      message: `You have received a new disciplinary action: ${data.title}. Please check your dashboard.`,
      type: 'WARNING',
      link: '/student/tasks',
    });

    return saved;
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
    const saved = await this.achievementRepo.save(achievement);

    // 🚀 FIRE NOTIFICATION TO STUDENT
    await this.notifService.sendNotification({
      recipientId: studentId,
      title: 'New Achievement Granted!',
      message: `You were directly awarded +${data.points} points for: ${data.title}. Keep up the great work!`,
      type: 'SUCCESS',
      link: '/student', // Link them to their dashboard to see the new points
    });

    return saved;
  }

  // 3. Get Dashboard Stats & Pending Submissions
  // Update this to accept the usthadId!
  async getDashboardOverview(usthadId: string) {
    // 1. Only count MY punishments
    const punishmentsCount = await this.punishmentRepo.count({
      where: { assignedBy: { id: usthadId } },
    });

    // 2. Only count MY awarded achievements
    const achievementsCount = await this.achievementRepo.count({
      where: { awardedBy: { id: usthadId } },
    });

    // 3. Find pending submissions meant for ME (or open achievement requests)
    const pendingSubmissions = await this.submissionRepo.find({
      where: [
        // Submissions trying to clear a punishment I assigned
        {
          status: SubmissionStatus.PENDING,
          targetPunishment: { assignedBy: { id: usthadId } },
        },
        // OR open achievement requests (no punishment attached)
        {
          status: SubmissionStatus.PENDING,
          targetPunishment: IsNull(),
          targetedUsthad: { id: usthadId },
        },
      ],
      relations: ['student', 'targetPunishment'],
      take: 5,
      order: { createdAt: 'DESC' },
    });

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

    const canVerifyPunishmentSubmission =
      !!submission.targetPunishment &&
      submission.targetPunishment.assignedBy?.id === usthadId;
    const canVerifyAchievementSubmission =
      !submission.targetPunishment &&
      submission.targetedUsthad?.id === usthadId;

    if (!canVerifyPunishmentSubmission && !canVerifyAchievementSubmission) {
      throw new ForbiddenException(
        'You are not allowed to verify this submission',
      );
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
        punishment.status = PunishmentStatus.RESOLVED;
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
    let notifMessage = '';
    let notifType = 'INFO';

    if (status === 'APPROVED') {
      if (submission.targetPunishment) {
        notifMessage = `Your submission was approved! The punishment "${submission.targetPunishment.title}" has been cleared.`;
        notifType = 'SUCCESS';
      } else if (awardedPoints) {
        notifMessage = `Your achievement request "${submission.title.split(' | ')[0]}" was approved! You earned +${awardedPoints} points.`;
        notifType = 'SUCCESS';
      }
    } else if (status === 'REJECTED') {
      notifMessage = `Your submission for "${submission.title.split(' | ')[0]}" was rejected by the Usthad. Please check and resubmit.`;
      notifType = 'ERROR';
    }

    if (notifMessage) {
      await this.notifService.sendNotification({
        recipientId: submission.student.id,
        title: `Submission ${status}`,
        message: notifMessage,
        type: notifType,
        link: submission.targetPunishment ? '/student/tasks' : '/student/works',
      });
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

  // Fetch a single student's full profile for Usthad
  async getStudentProfile(studentId: string) {
    const student = await this.userRepo.findOne({
      where: { id: studentId, role: Role.STUDENT },
      select: ['id', 'fullName', 'username', 'class', 'isActive'],
    });

    if (!student) throw new NotFoundException('Student not found');

    const achievements = await this.achievementRepo.find({
      where: { student: { id: studentId } },
    });
    const punishments = await this.punishmentRepo.find({
      where: { student: { id: studentId } },
    });

    const totalPoints = achievements.reduce((sum, a) => sum + a.points, 0);
    const activePunishments = punishments.filter(
      (p) => p.status === PunishmentStatus.ACTIVE,
    );

    // 🚀 Calculate Category Statuses (Red or Green)
    // Here we define the logic. If a student has an active punishment in a category, it's RED.
    const checkStatus = (categoryName: string) => {
      const hasActive = punishments.some(
        (p) =>
          p.category === categoryName && p.status !== PunishmentStatus.RESOLVED,
      );
      return hasActive ? 'RED' : 'GREEN';
    };

    const categories = [
      {
        id: 1,
        title: 'Academics',
        status: checkStatus('Academics'),
        description: 'Academic performance',
        percentage: checkStatus('Academics') === 'GREEN' ? 100 : 30,
      },
      {
        id: 2,
        title: 'Mosque',
        status: checkStatus('Mosque Attendance'),
        description: 'Prayer punctuality',
        percentage: checkStatus('Mosque Attendance') === 'GREEN' ? 100 : 30,
      },
      {
        id: 3,
        title: 'Public Behavior',
        status: checkStatus('Public Behavior'),
        description: 'Discipline and conduct',
        percentage: checkStatus('Public Behavior') === 'GREEN' ? 100 : 30,
      },
      {
        id: 4,
        title: 'Computer Lab',
        status: checkStatus('Computer Lab'),
        description: 'Lab discipline and usage',
        percentage: checkStatus('Computer Lab') === 'GREEN' ? 100 : 30,
      },
      {
        id: 5,
        title: 'Library',
        status: checkStatus('Library'),
        description: 'Library behavior and book returns',
        percentage: checkStatus('Library') === 'GREEN' ? 100 : 30,
      },
    ];

    return {
      profile: { ...student, totalPoints },
      categories,
      activePunishments,
      recentAchievements: achievements.slice(0, 5), // Last 5 achievements
    };
  }
}


