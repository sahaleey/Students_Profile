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
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { UsthadService } from './usthad.service';
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
@Roles(Role.USTHAD) // ONLY Usthads can access these routes!
export class UsthadController {
  constructor(private readonly usthadService: UsthadService) {}

  @Get('dashboard')
  getDashboard() {
    return this.usthadService.getDashboardOverview();
  }

  @Get('students')
  async getStudents() {
    // We are grabbing the connection directly from the service.
    // Usually, you'd put this in usthad.service.ts, but we'll do it fast here:
    return this.usthadService['userRepo'].find({
      where: { role: Role.STUDENT, isActive: true },
      select: ['id', 'fullName', 'username', 'class'],
      order: { fullName: 'ASC' },
    });
  }
  @Get('punishments')
  async getPunishments() {
    return this.usthadService['punishmentRepo'].find({
      relations: ['student'], // So we can see who got punished
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
  getAttachments() {
    return this.usthadService['submissionRepo'].find({
      relations: ['student', 'targetPunishment'],
      order: { createdAt: 'DESC' },
    });
  }
  // For Remove and Get achievement
  @Get('achievements')
  getAchievements() {
    return this.usthadService['achievementRepo'].find({
      relations: ['student'], // So we know WHO got the achievement
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
}
