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
import { Achievement } from '../usthad/entities/achievement.entity'; // 🚀 Imported
import { AcademicMonth } from '../admin/entities/academic-month.entity'; // 🚀 Imported
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
@Roles(Role.STAFF) // 🚀 Only Staff can access
export class StaffController {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Punishment)
    private punishmentRepo: Repository<Punishment>,
    @InjectRepository(Achievement)
    private achievementRepo: Repository<Achievement>, // 🚀 Injected
    @InjectRepository(AcademicMonth)
    private monthRepo: Repository<AcademicMonth>, // 🚀 Injected
    private notifService: NotificationsService,
    private staffService: StaffService,
    @InjectRepository(StaffProgram)
    private programRepo: Repository<StaffProgram>,
  ) {}

  // ==========================================
  // 1. LIBRARY ONLY: Assign Fines
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
    // Security Check: Are they actually Library staff?
    const staff = await this.userRepo.findOne({
      where: { id: req.user.userId },
    });
    if (!staff || staff.department !== 'Library') {
      throw new ForbiddenException('Only Library staff can issue book fines.');
    }

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
    },
  ) {
    const staff = await this.userRepo.findOne({
      where: { id: req.user.userId },
    });
    if (!staff) throw new NotFoundException('Staff profile not found.');

    // Fetch student with parent so we can notify the parent too!
    const studentWithParent = await this.userRepo.findOne({
      where: { id: body.studentId },
      relations: ['parent'],
    });
    if (!studentWithParent) throw new NotFoundException('Student not found.');

    // Fetch the active academic month
    const activeMonthRecord = await this.monthRepo.findOne({
      where: { isActive: true },
    });
    const academicMonth = activeMonthRecord
      ? activeMonthRecord.name
      : 'Default Term';

    // 🚀 Prefix the title so it looks official (e.g., "[Outreach] Best Volunteer")
    const formattedTitle = `[${staff.department || 'Staff'}] ${body.title}`;

    const achievement = this.achievementRepo.create({
      title: formattedTitle,
      points: body.points,
      isSpecialHighlight: body.isSpecialHighlight || false,
      awardedBy: { id: staff.id },
      student: { id: body.studentId },
      academicMonth,
    });
    const saved = await this.achievementRepo.save(achievement);

    // 🚀 Notify Student
    await this.notifService.sendNotification({
      recipientId: body.studentId,
      title: 'New Achievement Granted! 🌟',
      message: `You earned +${body.points} points from the ${staff.department} department for: ${body.title}.`,
      type: 'SUCCESS',
      link: '/student',
    });

    // 🚀 Notify Parent (if they exist)
    if (studentWithParent.parent) {
      await this.notifService.sendNotification({
        recipientId: studentWithParent.parent.id,
        title: 'Great News! 🌟',
        message: `Your child ${studentWithParent.fullName} earned +${body.points} points from the ${staff.department} department!`,
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
  @Post('programs')
  async createProgram(
    @Request() req: any,
    @Body() body: { title: string; description: string },
  ) {
    const staff = await this.userRepo.findOne({
      where: { id: req.user.userId },
    });
    if (!staff || staff.department === 'Library') {
      throw new ForbiddenException(
        'Only Outreach and Welfare can log departmental programs.',
      );
    }

    const program = this.programRepo.create({
      title: body.title,
      description: body.description,
      department: staff.department,
      createdBy: { id: staff.id },
    });
    return this.programRepo.save(program);
  }

  @Get('programs')
  async getMyDepartmentPrograms(@Request() req: any) {
    const staff = await this.userRepo.findOne({
      where: { id: req.user.userId },
    });
    if (!staff) throw new NotFoundException('Staff not found');

    return this.programRepo.find({
      where: { department: staff.department },
      relations: ['createdBy'],
      order: { date: 'DESC' },
    });
  }
}
