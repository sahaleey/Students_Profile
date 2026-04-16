// backend/src/users/users.controller.ts
import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  @UseGuards(JwtAuthGuard)
  @Post('update-fcm-token')
  async updateToken(@Req() req, @Body('token') token: string) {
    // req.user.id comes from your JWT payload
    await this.userRepo.update(req.user.id, { fcmToken: token });
    return { success: true };
  }
}
