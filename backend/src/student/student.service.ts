import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import {
  Punishment,
  PunishmentStatus,
} from '../usthad/entities/punishment.entity';
import { Achievement } from '../usthad/entities/achievement.entity';
import { Submission } from '../usthad/entities/submission.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Punishment)
    private punishmentRepo: Repository<Punishment>,
    @InjectRepository(Achievement)
    private achievementRepo: Repository<Achievement>,
    @InjectRepository(Submission)
    private submissionRepo: Repository<Submission>,
  ) {}

  async getDashboardData(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // 1. Fetch all data for this student
    const achievements = await this.achievementRepo.find({
      where: { student: { id: userId } },
      order: { createdAt: 'DESC' },
    });
    const punishments = await this.punishmentRepo.find({
      where: { student: { id: userId } },
      order: { createdAt: 'DESC' },
    });
    const submissions = await this.submissionRepo.find({
      where: { student: { id: userId } },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    // 🚀 1. Calculate Lifetime Total Points
    const lifetimePoints = achievements.reduce(
      (sum, ach) => sum + ach.points,
      0,
    );

    // 🚀 2. Group Points by Academic Month
    const pointsByMonth = achievements.reduce(
      (acc, ach) => {
        // If the month bucket doesn't exist yet, create it
        if (!acc[ach.academicMonth]) acc[ach.academicMonth] = 0;
        // Add points to that specific month bucket
        acc[ach.academicMonth] += ach.points;
        return acc;
      },
      {} as Record<string, number>,
    );

    // 🚀 3. Determine the "Current" Month and its points
    // (We assume the most recent achievement dictates the current month)
    const currentMonthName =
      achievements.length > 0 ? achievements[0].academicMonth : 'Term 1 - 2026';
    const currentMonthPoints = pointsByMonth[currentMonthName] || 0;

    // 🚀 4. Format the History for the frontend
    const monthlyHistory = Object.entries(pointsByMonth).map(
      ([month, points]) => ({
        month,
        points,
      }),
    );

    // 2. Calculate Total Points dynamically
    const totalPoints = achievements.reduce((sum, ach) => sum + ach.points, 0);

    // 3. Determine Category Health
    // If a punishment in a specific category is NOT resolved, that category is RED.
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
    ];

    // 4. Combine Punishments and Achievements into a "Records" timeline
    const records = [
      ...punishments.map((p) => ({
        id: p.id,
        type: 'Punishment',
        title: p.title,
        status: p.status || 'Active',
        date: p.createdAt,
        points: null,
      })),
      ...achievements.map((a) => ({
        id: a.id,
        type: 'Achievement',
        title: a.title,
        status: 'Completed',
        date: a.createdAt,
        points: `+${a.points}`,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5); // Get latest 5

    return {
      profile: {
        name: user.fullName,
        admnNo: user.username,
        photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
        points: totalPoints,
        class: user.class || 'Unassigned',
        attendance: '92%', // You can make this dynamic later!
        currentMonthPoints: currentMonthPoints,
        currentMonthName: currentMonthName,
        lifetimePoints: lifetimePoints,
      },
      monthlyHistory: monthlyHistory, // Send history array
      categories,
      records,
      recentActivities: submissions.map((s) => ({
        id: s.id,
        action: `Submitted: ${s.title}`,
        date: s.createdAt,
        status: s.status,
      })),
    };
  }
}
