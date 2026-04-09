import {
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

interface AuthenticatedRequest extends Request {
  user: { userId: string };
}

@Controller('student')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STUDENT) // ONLY Students can access!
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('dashboard')
  getDashboard(@Request() req: AuthenticatedRequest) {
    return this.studentService.getDashboardData(req.user.userId);
  }
  // Work
  @Post('submissions')
  async submitWork(
    @Request() req: AuthenticatedRequest,
    @Body() body: { title: string; content: string },
  ) {
    // We format the title to hold both pieces of data temporarily,
    // or you can add a 'content' column to your database later!
    const formattedTitle = `${body.title} | Content: ${body.content}`;

    const submission = this.studentService['submissionRepo'].create({
      student: { id: req.user.userId },
      title: formattedTitle,
      purpose: 'STUDENT_SUBMISSION',
      status: SubmissionStatus.PENDING,
    });
    return this.studentService['submissionRepo'].save(submission);
  }

  @Get('submissions')
  async getMySubmissions(@Request() req: AuthenticatedRequest) {
    return this.studentService['submissionRepo'].find({
      where: { student: { id: req.user.userId } },
      order: { createdAt: 'DESC' },
    });
  }

  //   Tasks for Punishment Clearance:
  @Get('punishments')
  async getMyPunishments(@Request() req: AuthenticatedRequest) {
    return this.studentService['punishmentRepo'].find({
      where: {
        student: { id: req.user.userId },
        status: PunishmentStatus.ACTIVE, // ONLY fetch active punishments that need clearing!
      },
      order: { createdAt: 'DESC' },
    });
  }

  @Post('punishments/:id/submit')
  async submitPunishmentWork(
    @Request() req: any,
    @Param('id') punishmentId: string,
    @Body() body: { title: string; content: string },
  ) {
    const formattedTitle = `${body.title} | Content: ${body.content}`;

    // 1. Create the submission
    const submission = this.studentService['submissionRepo'].create({
      student: { id: req.user.userId },
      targetPunishment: { id: punishmentId },
      title: formattedTitle,
      purpose: 'STUDENT_SUBMISSION', // ✅ REQUIRED
      status: SubmissionStatus.PENDING,
    });

    // 2. We REMOVED the punishment.status = 'PENDING REVIEW' code entirely!
    // Just save the submission and return.
    return this.studentService['submissionRepo'].save(submission);
  }
}
