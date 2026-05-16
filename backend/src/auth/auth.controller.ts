import {
  BadRequestException,
  Controller,
  Post,
  Body,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Get,
  Delete,
  Ip,
  Headers,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

interface JwtUser {
  userId: string | number;
  sessionId?: string;
  [key: string]: any;
}

// Minimal local type to satisfy authService.login parameter expectations
interface AuthenticatedUser {
  id: string | number;
  username: string;
  role: string;
  fullName: string;
  [key: string]: any;
}

interface JwtRequest extends Request {
  user: JwtUser;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginDto: { username: string; password: string },
    @Ip() ip: string, // 🚀 Automatically grabs the user's IP
    @Headers('user-agent') userAgent: string, // 🚀 Grabs device info
  ) {
    const user = (await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    )) as AuthenticatedUser | null;

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Pass the IP and UserAgent down to the service!
    return this.authService.login(user, ip, userAgent);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  async changePassword(
    @Req() req: JwtRequest,
    @Body()
    body: {
      currentPassword: string;
      newPassword: string;
      confirmNewPassword: string;
    },
  ) {
    const userId = req.user && req.user.userId;
    if (!userId) throw new BadRequestException('Invalid user context');
    return this.authService.changePassword(
      String(userId),
      body.currentPassword,
      body.newPassword,
      body.confirmNewPassword,
    );
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  async getActiveSessions(@Req() req: JwtRequest) {
    // 🚀 Calling the service instead of doing DB logic here
    return this.authService.getActiveSessions(req.user.userId);
  }

  @Delete('sessions/revoke-others')
  @UseGuards(JwtAuthGuard)
  async revokeOtherDevices(@Req() req: JwtRequest) {
    // 🚀 Calling the service. We pass both the userId and the current sessionId!
    return this.authService.revokeOtherSessions(
      req.user.userId,
      String(req.user.sessionId ?? ''),
    );
  }
}
