import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard) // Anyone logged in can access their notifications
export class NotificationsController {
  constructor(private readonly notifService: NotificationsService) {}

  @Get()
  getMyNotifications(@Request() req: any) {
    return this.notifService.getUserNotifications(req.user.userId);
  }

  @Patch('read-all')
  markAllRead(@Request() req: any) {
    return this.notifService.markAllAsRead(req.user.userId);
  }

  @Patch(':id/read')
  markOneRead(@Request() req: any, @Param('id') id: string) {
    return this.notifService.markAsRead(id, req.user.userId);
  }
}
