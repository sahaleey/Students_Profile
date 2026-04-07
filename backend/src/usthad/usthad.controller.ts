import {
  Controller,
  Get,
  Post,
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
    @Body() body: { studentId: string; title: string; points: number },
  ) {
    return this.usthadService.grantAchievement(
      req.user.userId,
      body.studentId,
      body,
    );
  }
}
