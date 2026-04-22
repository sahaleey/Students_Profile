import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  Body,
  UseGuards,
  Request,
  Req,
  Query,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { UsthadService } from './usthad.service';
import { IsNull } from 'typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // You need to create this basic guard
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator'; // Custom decorator
import { Role } from '../users/enums/role.enum';
import { SubmissionStatus } from './entities/submission.entity';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    userId: string;
  };
}

@Controller('usthad')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USTHAD, Role.HISAN)
export class UsthadController {
  constructor(private readonly usthadService: UsthadService) {}

  @Get('dashboard')
  getDashboard(@Req() req: AuthenticatedRequest) {
    return this.usthadService.getDashboardOverview(req.user.userId);
  }
  @Roles(Role.USTHAD, Role.HISAN, Role.SUBWING, Role.ADMIN, Role.STAFF)
  @Get('students')
  async getStudents() {
    return this.usthadService.getStudentsWithPoints();
  }

  @Roles(Role.USTHAD, Role.HISAN, Role.SUBWING)
  @Get('star-students')
  getStarStudents(@Query('minPoints') minPoints?: string) {
    const parsedMinPoints = Number(minPoints);
    const threshold = Number.isFinite(parsedMinPoints) ? parsedMinPoints : 100;
    return this.usthadService.getStarStudents(threshold);
  }
  @Get('punishments')
  getPunishments(@Request() req: AuthenticatedRequest) {
    return this.usthadService['punishmentRepo'].find({
      // 🚀 ONLY fetch punishments assigned by this exact Usthad
      where: { assignedBy: { id: req.user.userId } },
      relations: ['student'],
      order: { createdAt: 'DESC' },
    });
  }
  @Post('punishments')
  assignPunishment(
    @Request() req: AuthenticatedRequest,
    @Body()
    body: {
      studentId: string;
      title: string;
      category: string;
      description: string;
    },
  ) {
    // req.user comes from the JWT Token!
    return this.usthadService.assignPunishment(
      req.user.userId,
      body.studentId,
      body,
    );
  }

  @Post('achievements')
  grantAchievement(
    @Request() req: AuthenticatedRequest,
    @Body()
    body: {
      studentId: string;
      title: string;
      points: number;
      academicMonth?: string;
      isSpecialHighlight?: boolean;
    },
  ) {
    return this.usthadService.grantAchievement(
      req.user.userId,
      body.studentId,
      body,
    );
  }
  @Patch('submissions/:id/verify')
  verifySubmission(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body('status') status: string, // 🚀 Changed to string here
    @Body('points') points?: number,
  ) {
    return this.usthadService.verifySubmission(
      req.user.userId,
      id,
      status,
      points,
    );
  }
  // Delete a punishment record Route
  @Delete('punishments/:id')
  removePunishment(@Param('id') id: string) {
    return this.usthadService.removePunishment(id);
  }
  //For create and Get attachment on behalf of student
  // Add this to UsthadController
  @Post('attachments')
  createAttachment(
    @Request() req: AuthenticatedRequest,
    @Body()
    body: { studentId: string; punishmentId: string; workTitle: string },
  ) {
    return this.usthadService.createAttachmentOnBehalf(req.user.userId, body);
  }

  // We also need a route to fetch all submissions for the right column!
  @Get('attachments')
  getAttachments(@Request() req: AuthenticatedRequest) {
    return this.usthadService['submissionRepo'].find({
      where: [
        // 🚀 Submissions tied to MY punishments
        { targetPunishment: { assignedBy: { id: req.user.userId } } },
        // 🚀 OR open achievement requests
        { targetPunishment: IsNull(), targetedUsthad: { id: req.user.userId } },
      ],
      relations: ['student', 'targetPunishment', 'targetedUsthad'],
      order: { createdAt: 'DESC' },
    });
  }
  // For Remove and Get achievement
  @Get('achievements')
  getAchievements(@Request() req: AuthenticatedRequest) {
    return this.usthadService['achievementRepo'].find({
      // 🚀 ONLY fetch achievements awarded by this exact Usthad
      where: { awardedBy: { id: req.user.userId } },
      relations: ['student'],
      order: { createdAt: 'DESC' },
    });
  }

  @Delete('achievements/:id')
  removeAchievement(@Param('id') id: string) {
    return this.usthadService.removeAchievement(id);
  }

  @Post('submissions')
  submitWork(
    @Request() req: AuthenticatedRequest,
    @Body() body: { title: string; content: string },
  ) {
    const formattedTitle = `${body.title} | Content: ${body.content}`;

    const submission = this.usthadService['submissionRepo'].create({
      student: { id: req.user.userId },
      title: formattedTitle,

      // 🚀 THE FIX: Use the official Enum here too!
      status: SubmissionStatus.PENDING,
    });
    return this.usthadService['submissionRepo'].save(submission);
  }
  @Roles(Role.USTHAD, Role.HISAN, Role.ADMIN)
  @Get('students/:id')
  getStudentProfile(@Param('id') id: string) {
    return this.usthadService.getStudentProfile(id);
  }

  @Get('special-highlight')
  @Roles(
    Role.STUDENT,
    Role.USTHAD,
    Role.HISAN,
    Role.SUBWING,
    Role.PARENT,
    Role.ADMIN,
    Role.STAFF,
  )
  async getSpecialHighlight() {
    return this.usthadService.getLatestSpecialHighlight();
  }
  @Get('class-report')
  getClassReport() {
    return this.usthadService.getClassReport();
  }

  @Post('arrivals')
  recordArrival(
    @Request() req: any,
    @Body()
    body: { studentId: string; arrivalTime: string; isExcused: boolean },
  ) {
    return this.usthadService.recordLeaveArrival(
      req.user.userId,
      body.studentId,
      body.arrivalTime,
      body.isExcused,
    );
  }
}
