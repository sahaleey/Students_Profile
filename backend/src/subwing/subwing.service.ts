import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program } from './entities/program.entity';
import { ProgramResult } from './entities/program-result.entity';
import { Achievement } from '../usthad/entities/achievement.entity';
import { AcademicMonth } from '../admin/entities/academic-month.entity';
import { NotificationsService } from '../notifications/notifications.service';

interface Winner {
  studentId: string;
  rank?: string;
  grade?: string;
  points: number;
}

@Injectable()
export class SubwingService {
  constructor(
    @InjectRepository(Program) private programRepo: Repository<Program>,
    @InjectRepository(ProgramResult)
    private resultRepo: Repository<ProgramResult>,
    @InjectRepository(Achievement)
    private achievementRepo: Repository<Achievement>,
    @InjectRepository(AcademicMonth)
    private monthRepo: Repository<AcademicMonth>,
    private notifService: NotificationsService,
  ) {}

  // 1. Create a new Program
  async createProgram(subWingId: string, data: any) {
    const program = this.programRepo.create({
      ...data,
      createdBy: { id: subWingId },
      status: 'Ongoing',
    });
    return this.programRepo.save(program);
  }

  // 2. Get Sub-Wing's Programs
  async getMyPrograms(subWingId: string) {
    return this.programRepo.find({
      where: { createdBy: { id: subWingId } },
      order: { createdAt: 'DESC' },
    });
  }

  // 3. Declare Winners & Distribute Points
  async publishResults(
    subWingId: string,
    programId: string,
    winners: Winner[],
  ) {
    const program = await this.programRepo.findOne({
      where: { id: programId, createdBy: { id: subWingId } },
    });
    if (!program) throw new NotFoundException('Program not found');

    // Get the global active month from Admin's clock
    const activeMonthRecord = await this.monthRepo.findOne({
      where: { isActive: true },
    });
    const currentMonth = activeMonthRecord
      ? activeMonthRecord.name
      : 'Unassigned Term';

    const results: ProgramResult[] = [];
    const achievements: Achievement[] = [];

    // Process every winner
    for (const winner of winners) {
      // Create the official Program Result (Rank & Grade)
      const result = this.resultRepo.create({
        program: { id: programId },
        student: { id: winner.studentId },
        rank: winner.rank,
        grade: winner.grade,
        awardedPoints: winner.points,
      });
      results.push(result);

      // 🚀 CRITICAL: Automatically create an Achievement so the student gets the points globally!
      const achievement = this.achievementRepo.create({
        student: { id: winner.studentId },
        awardedBy: { id: subWingId }, // The Subwing gave it
        academicMonth: currentMonth,
        title: `Winner: ${program.title} (${winner.rank || winner.grade})`,
        points: winner.points,
      });
      achievements.push(achievement);
      let rankText = winner.rank
        ? `${winner.rank} Place`
        : `Grade ${winner.grade}`;

      await this.notifService.sendNotification({
        recipientId: winner.studentId, // 🎯 Targeted strictly to this student
        title: 'Congratulations! 🏆',
        message: `You secured ${rankText} in the "${program.title}" program and earned +${winner.points} points!`,
        type: 'SUCCESS',
        link: '/student', // Sends them to their dashboard to see their new points!
      });
    }

    // Save everything in bulk
    await this.resultRepo.save(results);
    await this.achievementRepo.save(achievements);

    // Close the program
    program.status = 'Results Declared';
    await this.programRepo.save(program);

    return { message: 'Results published successfully!' };
  }
  // 4. HISAN Analytics - A comprehensive performance dashboard for all Sub-Wings
  async getPublishedResults(subWingId: string) {
    return this.resultRepo.find({
      where: { program: { createdBy: { id: subWingId } } },
      relations: ['program', 'student'],
      order: { createdAt: 'DESC' },
    });
  }
  // 5. Get results for a specific student
  async getMyResults(studentId: string) {
    return this.resultRepo.find({
      where: { student: { id: studentId } },
      relations: ['program', 'program.createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  // 6. Get ALL results for HISAN / Admin
  async getAllPublishedResults() {
    return this.resultRepo.find({
      relations: ['program', 'program.createdBy', 'student'],
      order: { createdAt: 'DESC' },
    });
  }
}
