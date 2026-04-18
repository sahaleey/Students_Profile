// backend/src/users/users.controller.ts
import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

// 1. Fix the type to be a string!
type AuthenticatedRequest = Request & {
  user: { userId: string };
};

@Controller('users')
export class UsersController {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  @UseGuards(JwtAuthGuard)
  @Post('update-fcm-token')
  async updateToken(
    @Req() req: AuthenticatedRequest,
    @Body('token') token: string,
  ) {
    // 2. Defensive check: Never trust the request blindly!
    if (!req.user || !req.user.userId) {
      throw new UnauthorizedException(
        'User ID is missing from the JWT payload!',
      );
    }

    // 3. Now it is safe to update
    await this.userRepo.update(req.user.userId, { fcmToken: token });
    return { success: true };
  }
}
