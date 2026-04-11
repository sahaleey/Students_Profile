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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: { username: string; password: string }) {
    const user: unknown = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.authService.login(user as Parameters<AuthService['login']>[0]);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  async changePassword(
    @Req() req: { user: { userId: string | number } },
    @Body()
    body: {
      currentPassword: string;
      newPassword: string;
      confirmNewPassword: string;
    },
  ) {
    if (!req.user?.userId) {
      throw new BadRequestException('Invalid user context');
    }

    const userId = String(req.user.userId);

    return this.authService.changePassword(
      userId,
      body.currentPassword,
      body.newPassword,
      body.confirmNewPassword,
    );
  }
}
