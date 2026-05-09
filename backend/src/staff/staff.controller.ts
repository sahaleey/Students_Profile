import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  ForbiddenException,
  NotFoundException,
  Get,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Punishment } from '../usthad/entities/punishment.entity';
import { Achievement } from '../usthad/entities/achievement.entity';
import { AcademicMonth } from '../admin/entities/academic-month.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { StaffService } from './staff.service';
import { StaffProgram } from './entities/staff-program.entity';

type AuthenticatedRequest = {
  user: {
    userId: string;
  };
};

@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STAFF) // 🚀 Master Staff Access
export class StaffController {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Punishment)
    private punishmentRepo: Repository<Punishment>,
    @InjectRepository(Achievement)
    private achievementRepo: Repository<Achievement>,
    @InjectRepository(AcademicMonth)
    private monthRepo: Repository<AcademicMonth>,
    private notifService: NotificationsService,
    private staffService: StaffService,
    @InjectRepository(StaffProgram)
    private programRepo: Repository<StaffProgram>,
  ) {}

  // ==========================================
  // 1. ALL STAFF: Assign Fines (Centralized)
  // ==========================================
  @Post('fines')
  async assignLibraryFine(
    @Request() req: AuthenticatedRequest,
    @Body()
    body: {
      studentId: string;
      title: string;
      description: string;
      amount: string;
    },
  ) {
    // 🚀 REMOVED the strict 'Library' department check. All staff can do this now.
    const staff = await this.userRepo.findOne({
      where: { id: req.user.userId },
    });
    if (!staff) throw new NotFoundException('Staff profile not found.');

    const fine = this.punishmentRepo.create({
      title: `${body.title} (₹${body.amount})`,
      category: 'Library Fine',
      description: body.description,
      actionType: 'FINE', // Triggers the Yellow UI automatically!
      student: { id: body.studentId },
      assignedBy: { id: staff.id },
    });
    await this.punishmentRepo.save(fine);

    await this.notifService.sendNotification({
      recipientId: body.studentId,
      title: 'Library Fine Issued 📚',
      message: `You have been fined ₹${body.amount} for: ${body.title}.`,
      type: 'WARNING',
      link: '/student/tasks',
    });

    return fine;
  }

  @Get('dashboard')
  getDashboard(@Request() req: AuthenticatedRequest) {
    return this.staffService.getDashboardData(req.user.userId);
  }

  // ==========================================
  // 2. ALL STAFF: Grant Achievements
  // ==========================================
  @Post('achievements')
  async grantAchievement(
    @Request() req: AuthenticatedRequest,
    @Body()
    body: {
      studentId: string;
      title: string;
      points: number;
      isSpecialHighlight?: boolean;
      department?: string; // 🚀 Accept the department from the frontend payload
    },
  ) {
    const staff = await this.userRepo.findOne({
      where: { id: req.user.userId },
    });
    if (!staff) throw new NotFoundException('Staff profile not found.');

    const studentWithParent = await this.userRepo.findOne({
      where: { id: body.studentId },
      relations: ['parent'],
    });
    if (!studentWithParent) throw new NotFoundException('Student not found.');

    const activeMonthRecord = await this.monthRepo.findOne({
      where: { isActive: true },
    });
    const academicMonth = activeMonthRecord
      ? activeMonthRecord.name
      : 'Default Term';

    // 🚀 We no longer format the title here, the frontend handles [Library] prefixes!
    const achievement = this.achievementRepo.create({
      title: body.title,
      points: body.points,
      isSpecialHighlight: body.isSpecialHighlight || false,
      awardedBy: { id: staff.id },
      student: { id: body.studentId },
      academicMonth,
    });
    const saved = await this.achievementRepo.save(achievement);

    const deptName = body.department || 'Central Staff';

    // 🚀 Notify Student
    await this.notifService.sendNotification({
      recipientId: body.studentId,
      title: 'New Achievement Granted! 🌟',
      message: `You earned +${body.points} points from ${deptName} for: ${body.title}.`,
      type: 'SUCCESS',
      link: '/student',
    });

    // 🚀 Notify Parent
    if (studentWithParent.parent) {
      await this.notifService.sendNotification({
        recipientId: studentWithParent.parent.id,
        title: 'Great News! 🌟',
        message: `Your child ${studentWithParent.fullName} earned +${body.points} points from ${deptName}!`,
        type: 'SUCCESS',
        link: '/parent/dashboard',
      });
    }

    return saved;
  }

  @Get('records')
  getRecords(@Request() req: any) {
    return this.staffService.getDepartmentRecords(req.user.userId);
  }

  // ==========================================
  // 3. ALL STAFF: Create Programs
  // ==========================================
  @Post('programs')
  async createProgram(
    @Request() req: any,
    @Body() body: { title: string; description: string; department?: string },
  ) {
    const staff = await this.userRepo.findOne({
      where: { id: req.user.userId },
    });
    if (!staff) throw new NotFoundException('Staff profile not found.');

    // 🚀 REMOVED the strict 'Outreach/Welfare' check.
    const program = this.programRepo.create({
      title: body.title,
      description: body.description,
      department: body.department || 'Central', // Fallback to central if not provided
      createdBy: { id: staff.id },
    });
    return this.programRepo.save(program);
  }

  @Get('programs')
  async getMyDepartmentPrograms(@Request() req: any) {
    // 🚀 Since staff is unified, we return ALL programs created by staff,
    // or you can adjust this if you add frontend filters later.
    return this.programRepo.find({
      relations: ['createdBy'],
      order: { date: 'DESC' },
    });
  }
}
