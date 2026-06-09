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
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from 'src/users/enums/role.enum';

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
    @Req() req: Request,
    @Body() loginDto: { username: string; password: string },
    @Headers('user-agent') userAgent: string,
  ) {
    const user = (await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    )) as AuthenticatedUser | null;

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const rawIp =
      req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress ||
      'Unknown IP';

    // Ensure we send a string
    const ipStr = Array.isArray(rawIp) ? rawIp[0] : rawIp;

    return this.authService.login(user, ipStr, userAgent);
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
  @Roles(Role.ADMIN)
  async getActiveSessions(@Req() req: JwtRequest) {
    // 🚀 Calling the service instead of doing DB logic here
    return this.authService.getActiveSessions(req.user.userId);
  }

  @Delete('sessions/revoke-others')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  async revokeOtherDevices(@Req() req: JwtRequest) {
    // 🚀 Calling the service. We pass both the userId and the current sessionId!
    return this.authService.revokeOtherSessions(
      req.user.userId,
      String(req.user.sessionId ?? ''),
    );
  }
}
