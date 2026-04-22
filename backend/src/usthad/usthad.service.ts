import {
  BadRequestException,
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
import * as admin from 'firebase-admin';
import { Arrival } from './entities/arrival.entity';
import { ArrivalSession } from '../admin/entities/arrival-session.entity';

interface AssignPunishmentData {
  title: string;
  category: string;
  description: string;
  actionType?: string;
}

interface GrantAchievementData {
  title: string;
  points: number;
  academicMonth?: string;
  isSpecialHighlight?: boolean;
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
    @InjectRepository(Arrival) private arrivalRepo: Repository<Arrival>,
    @InjectRepository(ArrivalSession)
    private arrivalSessionRepo: Repository<ArrivalSession>,
  ) {}

  // 1. Assign Punishment
  async assignPunishment(
    usthadId: string,
    studentId: string,
    data: AssignPunishmentData,
  ) {
    const student = await this.userRepo.findOne({
      where: { id: studentId },
      relations: ['parent'],
    });
    if (!student) throw new NotFoundException('Student not found');

    const punishment = this.punishmentRepo.create({
      title: data.title,
      category: data.category,
      description: data.description,
      actionType: data.actionType || 'PUNISHMENT',
      student: { id: studentId },
      assignedBy: { id: usthadId },
    });

    const saved = await this.punishmentRepo.save(punishment);
    //  FIRE THE NOTIFICATION!
    await this.notifService.sendNotification({
      recipientId: studentId,
      title: 'Action Required',
      message: `You have received a new disciplinary action: ${data.title}. Please check your dashboard.`,
      type: 'WARNING',
      link: '/student/tasks',
    });
    if (student.parent) {
      await this.notifService.sendNotification({
        recipientId: student.parent.id, // 🚀 Target the parent!
        title: 'New Disciplinary Action',
        message: `Your child ${student.fullName} received a disciplinary action: ${data.title}.`,
        type: 'WARNING',
        link: '/parent',
      });
    }

    return saved;
  }

  // 2. Grant Achievement (Points)
  async grantAchievement(
    usthadId: string,
    studentId: string,
    data: GrantAchievementData,
  ) {
    // 🚀 THE FIX: Enforce point limits
    if (data.points < 1 || data.points > 20) {
      throw new ForbiddenException(
        'Points must be between 1 and 20 per achievement.',
      );
    }
    const activeMonthRecord = await this.monthRepo.findOne({
      where: { isActive: true },
    });
    const student = await this.userRepo.findOne({
      where: { id: studentId },
      relations: ['parent'],
    });
    const academicMonth =
      activeMonthRecord?.name || data.academicMonth?.trim() || 'Default Term';

    const achievement = this.achievementRepo.create({
      title: data.title,
      points: data.points,
      awardedBy: { id: usthadId },
      student: { id: studentId },
      academicMonth,
      isSpecialHighlight: data.isSpecialHighlight ?? false,
    });
    const saved = await this.achievementRepo.save(achievement);

    // ðŸš€ FIRE NOTIFICATION TO STUDENT
    await this.notifService.sendNotification({
      recipientId: studentId,
      title: 'New Achievement Granted!',
      message: `You were directly awarded +${data.points} points for: ${data.title}. Keep up the great work!`,
      type: 'SUCCESS',
      link: '/student', // Link them to their dashboard to see the new points
    });

    if (student && student.parent) {
      await this.notifService.sendNotification({
        recipientId: student.parent.id,
        title: 'Star Student! 🌟',
        message: `Your child ${student.fullName} just earned +${data.points} points for: ${data.title}.`,
        type: 'SUCCESS',
        link: '/parent',
      });
    }

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
    awardedPoints?: number, // ðŸš€ Added optional points parameter
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
      // ðŸš€ Automatically create the achievement and give the points!
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
    let parentNotifMessage = '';

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
      if (status === 'APPROVED' && parentNotifMessage) {
        // Fetch the student again to get the parent link
        const studentWithParent = await this.userRepo.findOne({
          where: { id: submission.student.id },
          relations: ['parent'],
        });

        if (studentWithParent && studentWithParent.parent) {
          await this.notifService.sendNotification({
            recipientId: studentWithParent.parent.id, // Target the parent!
            title: submission.targetPunishment
              ? 'Action Cleared! 🛡️'
              : 'Points Earned! 🌟',
            message: parentNotifMessage,
            type: 'SUCCESS',
            link: '/parent/dashboard',
          });
        }
      }
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
    const studentWithParent = await this.userRepo.findOne({
      where: { id: data.studentId },
      relations: ['parent'],
    });

    if (studentWithParent) {
      // 1. Notify Student
      await this.notifService.sendNotification({
        recipientId: data.studentId,
        title: 'Action Cleared! 🛡️',
        message: `Your punishment "${punishment.title}" was resolved by an Usthad's direct verification.`,
        type: 'SUCCESS',
        link: '/student/tasks',
      });

      // 2. Notify Parent
      if (studentWithParent.parent) {
        await this.notifService.sendNotification({
          recipientId: studentWithParent.parent.id,
          title: 'Action Cleared! 🛡️',
          message: `Your child ${studentWithParent.fullName} cleared their disciplinary action: "${punishment.title}".`,
          type: 'SUCCESS',
          link: '/parent/dashboard',
        });
      }
    }

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

  // Student list with computed points for current active month and lifetime
  async getStudentsWithPoints() {
    const students = await this.userRepo.find({
      where: { role: Role.STUDENT, isActive: true },
      select: ['id', 'fullName', 'username', 'class'],
      order: { fullName: 'ASC' },
    });

    const achievements = await this.achievementRepo.find({
      relations: ['student'],
    });
    const activeMonth = await this.monthRepo.findOne({
      where: { isActive: true },
    });

    const normalizeMonth = (value?: string) =>
      (value || '').trim().toLowerCase();
    const activeMonthName = normalizeMonth(activeMonth?.name);

    return students.map((student) => {
      const studentAchievements = achievements.filter(
        (a) => a.student?.id === student.id,
      );

      const totalPoints = studentAchievements.reduce(
        (sum, a) => sum + a.points,
        0,
      );
      const currentMonthPoints = activeMonth
        ? studentAchievements
            .filter((a) => normalizeMonth(a.academicMonth) === activeMonthName)
            .reduce((sum, a) => sum + a.points, 0)
        : 0;

      return {
        ...student,
        totalPoints,
        currentMonthPoints,
      };
    });
  }

  // Dedicated endpoint data for Wall of Fame view
  async getStarStudents(minPoints = 100) {
    const activeMonth = await this.monthRepo.findOne({
      where: { isActive: true },
    });
    const students = await this.getStudentsWithPoints();

    const starStudents = students
      .filter((student) => student.currentMonthPoints >= minPoints)
      .sort((a, b) => b.currentMonthPoints - a.currentMonthPoints);

    return {
      activeMonthName: activeMonth?.name || 'Default Term',
      minPoints,
      students: starStudents,
    };
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
      order: { createdAt: 'DESC' },
    });
    const punishments = await this.punishmentRepo.find({
      where: { student: { id: studentId } },
    });

    const totalPoints = achievements.reduce((sum, a) => sum + a.points, 0);
    const monthlyPointsMap = achievements.reduce(
      (acc, achievement) => {
        const month = (achievement.academicMonth || 'Unassigned Term').trim();
        acc[month] = (acc[month] || 0) + achievement.points;
        return acc;
      },
      {} as Record<string, number>,
    );
    const monthlyHistory = Object.entries(monthlyPointsMap).map(
      ([month, points]) => ({ month, points }),
    );

    const activePunishments = punishments.filter(
      (p) => p.status === PunishmentStatus.ACTIVE,
    );

    // ðŸš€ Calculate Category Statuses (Red or Green)
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
        title: 'Masjid',
        status: checkStatus('Masjid Attendance'),
        description: 'Prayer punctuality',
        percentage: checkStatus('Masjid Attendance') === 'GREEN' ? 100 : 30,
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
      monthlyHistory,
      categories,
      activePunishments,
      recentAchievements: achievements.slice(0, 5), // Last 5 achievements
    };
  }

  async getLatestSpecialHighlight() {
    // A. Find what the current active month is
    const activeMonth = await this.monthRepo.findOne({
      where: { isActive: true },
    });

    // If there is no active month, there can be no active highlight!
    if (!activeMonth) return null;

    // B. Search ONLY for special highlights in this specific month
    const highlight = await this.achievementRepo.findOne({
      where: {
        isSpecialHighlight: true,
        academicMonth: activeMonth.name, // 🚀 This makes it expire when the month ends!
      },
      relations: ['student', 'awardedBy'],
      order: { createdAt: 'DESC' }, // 🚀 This prevents it from being "sticky" forever
    });

    if (!highlight) return null;

    return {
      title: highlight.title,
      points: highlight.points,
      studentName: highlight.student.fullName,
      awardedBy: highlight.awardedBy.fullName,
      date: highlight.createdAt,
    };
  }

  // Fetch all students with their RED/GREEN disciplinary status
  async getClassReport() {
    const students = await this.userRepo.find({
      where: { role: Role.STUDENT, isActive: true },
      select: ['id', 'fullName', 'username', 'class'],
      order: { class: 'ASC', fullName: 'ASC' },
    });

    const activePunishments = await this.punishmentRepo.find({
      where: { status: PunishmentStatus.ACTIVE },
      relations: ['student'],
    });

    return students.map((student) => {
      // Find all active actions for THIS specific student
      const studentActions = activePunishments.filter(
        (p) => p.student?.id === student.id,
      );

      // Check what types of actions they have
      const hasPunishment = studentActions.some(
        (p) => p.actionType === 'PUNISHMENT',
      );
      const hasFine = studentActions.some((p) => p.actionType === 'FINE');

      // 🚀 The New Grading Logic
      let status = 'GREEN';
      if (hasPunishment && hasFine) status = 'BOTH';
      else if (hasPunishment) status = 'RED';
      else if (hasFine) status = 'YELLOW';

      return {
        ...student,
        status,
      };
    });
  }

  async recordLeaveArrival(
    usthadId: string,
    studentId: string,
    arrivalTime: string,
    isExcused: boolean,
  ) {
    // 1. Check if the Gate is Open!
    // (You will need to inject ArrivalSession repo into UsthadService constructor!)
    const activeSession = await this.arrivalSessionRepo.findOne({
      where: { isOpen: true },
    });
    if (!activeSession) {
      throw new BadRequestException(
        'Arrival marking is currently closed by the Admin.',
      );
    }

    const student = await this.userRepo.findOne({
      where: { id: studentId },
      relations: ['parent'],
    });
    if (!student) throw new NotFoundException('Student not found');

    const activeMonth = await this.monthRepo.findOne({
      where: { isActive: true },
    });
    const currentMonth = activeMonth ? activeMonth.name : 'Default Term';

    const arrivalDate = new Date(arrivalTime);
    const hours = arrivalDate.getHours();
    const minutes = arrivalDate.getMinutes();

    const isLate = hours > 18 || (hours === 18 && minutes > 0);

    // 🚀 THE NEW FINE RULE: Only assign fine if they are late AND NOT excused!
    const applyFine = isLate && !isExcused;

    // 2. Save the Arrival Record
    const arrivalRecord = this.arrivalRepo.create({
      student: { id: studentId },
      recordedTime: arrivalDate,
      isLate,
      isExcused, // Save the excuse
      sessionId: activeSession.id, // Link to the active Admin session!
      fineAssigned: applyFine,
      academicMonth: currentMonth,
    });
    await this.arrivalRepo.save(arrivalRecord);

    // 3. Auto-Assign Fine ONLY if applyFine is true
    if (applyFine) {
      const fine = this.punishmentRepo.create({
        title: 'Late Arrival Fine (₹150)',
        category: 'Discipline',
        description: `Arrived from leave after 6:00 PM. Recorded time: ${arrivalDate.toLocaleTimeString()}`,
        actionType: 'FINE',
        student: { id: studentId },
        assignedBy: { id: usthadId },
      });
      await this.punishmentRepo.save(fine);
    }

    // 4. Notify Parent (Dynamic Message)
    if (student.parent) {
      let parentMessage = `Your child ${student.fullName} has arrived safely at campus at ${arrivalDate.toLocaleTimeString()}.`;
      let notifType = 'SUCCESS';

      if (applyFine) {
        parentMessage +=
          ' However, they were marked LATE and issued a ₹150 fine.';
        notifType = 'WARNING';
      } else if (isLate && isExcused) {
        parentMessage +=
          ' They arrived late, but their delay was officially excused. No fine issued.';
      }

      await this.notifService.sendNotification({
        recipientId: student.parent.id,
        title: 'Campus Arrival Update 🏫',
        message: parentMessage,
        type: notifType,
        link: '/parent/dashboard',
      });
    }

    return arrivalRecord;
  }
}
