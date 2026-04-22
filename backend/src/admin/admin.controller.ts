import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard'; // 🚀 Added RolesGuard
import { Roles } from '../auth/decorators/roles.decorator'; // 🚀 Added Roles decorator
import { Role } from '../users/enums/role.enum';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard) // 🚀 Enforce Role Checking globally for this controller
@Roles(Role.ADMIN) // 🚀 Require user to be an ADMIN to use ANY of these routes
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ==========================================
  // USER MANAGEMENT
  // ==========================================

  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Post('users')
  createUser(@Body() body: any) {
    return this.adminService.createUser(body);
  }

  @Post('users/bulk')
  async bulkImport(@Body() body: any[]) {
    // Uses Promise.all to map over the array and create users concurrently
    return Promise.all(body.map((user) => this.adminService.createUser(user)));
  }

  @Patch('users/:id/access')
  toggleAccess(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.adminService.toggleAccess(id, isActive);
  }

  // ==========================================
  // PARENT MANAGEMENT
  // ==========================================

  @Get('parents')
  async getParents() {
    return this.adminService.getAllParents();
  }

  @Post('users/create-parent')
  createParentAndLink(
    @Body()
    body: {
      studentId: string;
      parentName: string;
      parentPhone: string;
    },
  ) {
    return this.adminService.createParentAccount(body);
  }

  // ==========================================
  // ACADEMIC MONTH MANAGEMENT
  // ==========================================

  @Post('months/start')
  startMonth(@Body('name') name: string) {
    return this.adminService.startNewMonth(name);
  }

  @Post('months/end')
  endMonth() {
    return this.adminService.endCurrentMonth();
  }

  @Get('months/active')
  async getActiveMonth() {
    const active = await this.adminService['monthRepo'].findOne({
      where: { isActive: true },
    });
    return active || { name: 'No Active Month', startedAt: null };
  }

  @Get('months')
  getAllMonths() {
    return this.adminService.getAllMonths();
  }

  // ==========================================
  // SYSTEM REPORTS & ARRIVALS
  // ==========================================

  @Get('report')
  getSystemReport() {
    return this.adminService.getSystemReport();
  }

  @Get('arrivals/status')
  getArrivalStatus() {
    return this.adminService.getArrivalGateStatus();
  }

  @Post('arrivals/toggle')
  toggleArrivalGate(@Body('isOpen') isOpen: boolean) {
    return this.adminService.toggleArrivalGate(isOpen);
  }

  @Get('arrivals/report')
  getArrivalReport() {
    return this.adminService.getLatestArrivalReport();
  }
}
