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
}
