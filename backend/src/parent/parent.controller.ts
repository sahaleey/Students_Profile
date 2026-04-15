import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ParentService } from './parent.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

@Controller('parent')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PARENT)
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  @Get('dashboard')
  async getDashboard(@Request() req: any) {
    const parentId = req.user.userId;

    return this.parentService.getDashboardData(parentId);
  }
}
