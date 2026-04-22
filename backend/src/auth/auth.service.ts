import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

interface AuthenticatedUser {
  id: number | string;
  username: string;
  role: string;
  fullName: string;
  class?: string;
  department?: string;
}

interface JwtPayload {
  username: string;
  sub: number | string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);

    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    if (user.isActive === false) {
      throw new UnauthorizedException(
        'Access Denied: Your account has been revoked by an Admin.',
      );
    }

    const isPasswordValid = await bcrypt.compare(pass, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const { passwordHash: _passwordHash, ...result } = user;
    return result;
  }

  login(user: AuthenticatedUser) {
    const payload: JwtPayload = {
      username: user.username,
      sub: user.id,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
        class: user.class,
        department: user.department,
      },
    };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    confirmNewPassword: string,
  ) {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      throw new BadRequestException('All password fields are required');
    }

    if (newPassword.length < 4 || newPassword.length > 8) {
      throw new BadRequestException(
        'New password must be between 4 and 8 characters long',
      );
    }

    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException(
        'New password and confirmation password do not match',
      );
    }

    const user = await this.usersService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const isSameAsOldPassword = await bcrypt.compare(
      newPassword,
      user.passwordHash,
    );
    if (isSameAsOldPassword) {
      throw new BadRequestException(
        'New password must be different from the current password',
      );
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePasswordHash(userId, newPasswordHash);

    return { message: 'Password changed successfully' };
  }
}
