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
import { Role } from 'src/users/enums/role.enum';

@Controller('admin')
@UseGuards(JwtAuthGuard)
// Require user to be logged in to use these routes
// Note: You should eventually add @Roles(Role.ADMIN) here once you make an Admin user!
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Post('users')
  createUser(@Body() body: any) {
    return this.adminService.createUser(body);
  }

  @Patch('users/:id/access')
  toggleAccess(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.adminService.toggleAccess(id, isActive);
  }

  @Post('months/start')
  startMonth(@Body('name') name: string) {
    return this.adminService.startNewMonth(name);
  }
  @Get('months/active')
  async getActiveMonth() {
    // Note: If getActiveMonth in service currently only returns a string,
    // update the service to return the whole object, or just fetch it here:
    const active = await this.adminService['monthRepo'].findOne({
      where: { isActive: true },
    });
    return active || { name: 'No Active Month', startedAt: null };
  }
  @Get('months')
  getAllMonths() {
    return this.adminService.getAllMonths();
  }

  @Post('months/end')
  endMonth() {
    return this.adminService.endCurrentMonth();
  }

  @Get('report')
  getSystemReport() {
    return this.adminService.getSystemReport();
  }
  @Post('users/bulk')
  async bulkImport(@Body() body: any[]) {
    return Promise.all(body.map((user) => this.adminService.createUser(user)));
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
    // 🚀 Change this line to call the linking function!
    return this.adminService.createParentAccount(body);
  }
  @Get('parents')
  async getParents() {
    return this.adminService.getAllParents();
  }
}
