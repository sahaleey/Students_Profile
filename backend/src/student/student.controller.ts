import {
  BadRequestException,
  Controller,
  Get,
  UseGuards,
  Request,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { SubmissionStatus } from '../usthad/entities/submission.entity';
import { PunishmentStatus } from '../usthad/entities/punishment.entity';
import { NotificationsService } from '../notifications/notifications.service'; // 🚀 Imported

interface AuthenticatedRequest extends Request {
  user: { userId: string };
}

@Controller('student')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STUDENT) // ONLY Students can access!
export class StudentController {
  constructor(
    private readonly studentService: StudentService,
    private readonly notifService: NotificationsService, // 🚀 1. Injected here!
  ) {}

  @Get('dashboard')
  getDashboard(@Request() req: AuthenticatedRequest) {
    return this.studentService.getDashboardData(req.user.userId);
  }

  @Get('usthads')
  getUsthads() {
    return this.studentService['userRepo'].find({
      where: { role: Role.USTHAD, isActive: true },
      select: ['id', 'fullName'],
      order: { fullName: 'ASC' },
    });
  }

  // --- WORKS / ACHIEVEMENTS ---
  @Post('submissions')
  async submitWork(
    @Request() req: AuthenticatedRequest,
    @Body() body: { title: string; content: string; targetedUsthadId: string },
  ) {
    if (!body.targetedUsthadId) {
      throw new BadRequestException('Please select a target Usthad');
    }

    const targetedUsthad = await this.studentService['userRepo'].findOne({
      where: { id: body.targetedUsthadId, role: Role.USTHAD, isActive: true },
    });
    if (!targetedUsthad) {
      throw new BadRequestException('Selected Usthad not found');
    }

    const formattedTitle = `${body.title} | Content: ${body.content}`;

    const submission = this.studentService['submissionRepo'].create({
      student: { id: req.user.userId },
      targetedUsthad: { id: body.targetedUsthadId },
      title: formattedTitle,
      purpose: 'STUDENT_SUBMISSION',
      status: SubmissionStatus.PENDING,
    });

    const savedSubmission =
      await this.studentService['submissionRepo'].save(submission);

    // 🚀 2. Notify the Student that it was received
    await this.notifService.sendNotification({
      recipientId: req.user.userId,
      title: 'Submission Sent',
      message: `Your achievement request "${body.title}" has been sent to ${targetedUsthad.fullName} for verification.`,
      type: 'INFO',
      link: '/student/works',
    });

    await this.notifService.sendNotification({
      recipientId: targetedUsthad.id,
      title: 'New Achievement Request',
      message: `A student submitted "${body.title}" for your verification.`,
      type: 'INFO',
      link: '/usthad/attachments',
    });

    return savedSubmission;
  }

  @Get('submissions')
  async getMySubmissions(@Request() req: AuthenticatedRequest) {
    return this.studentService['submissionRepo'].find({
      where: { student: { id: req.user.userId } },
      order: { createdAt: 'DESC' },
    });
  }

  // --- TASKS / PUNISHMENT CLEARANCE ---
  @Get('punishments')
  async getMyPunishments(@Request() req: AuthenticatedRequest) {
    return this.studentService['punishmentRepo'].find({
      where: {
        student: { id: req.user.userId },
        status: PunishmentStatus.ACTIVE,
      },
      order: { createdAt: 'DESC' },
    });
  }

  @Post('punishments/:id/submit')
  async submitPunishmentWork(
    @Request() req: AuthenticatedRequest,
    @Param('id') punishmentId: string,
    @Body() body: { title: string; content: string },
  ) {
    const formattedTitle = `${body.title} | Content: ${body.content}`;

    // 1. Create the submission as normal
    const submission = this.studentService['submissionRepo'].create({
      student: { id: req.user.userId },
      targetPunishment: { id: punishmentId },
      title: formattedTitle,
      purpose: 'STUDENT_SUBMISSION',
      status: SubmissionStatus.PENDING,
    });

    const savedSubmission =
      await this.studentService['submissionRepo'].save(submission);

    // 🚀 2. THE TARGETED NOTIFICATION LOGIC
    // We must fetch the punishment and explicitly load the 'assignedBy' relation
    const punishment = await this.studentService['punishmentRepo'].findOne({
      where: { id: punishmentId },
      relations: ['assignedBy'], // <-- This is the magic key!
    });

    // 3. Check if we found the punishment AND the Usthad who assigned it
    if (punishment && punishment.assignedBy) {
      // Send the ping ONLY to that specific Usthad's ID
      await this.notifService.sendNotification({
        recipientId: punishment.assignedBy.id,
        title: 'Clearance Request 🛡️',
        message: `A student submitted proof to clear your punishment: "${punishment.title}". Please review it.`,
        type: 'WARNING', // Orange color to grab attention
        link: '/usthad/attachments',
      });
    }

    return savedSubmission;
  }
}
