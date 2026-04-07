import { Injectable, UnauthorizedException } from '@nestjs/common'; // 🚀 Added UnauthorizedException
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

interface AuthenticatedUser {
  id: number | string;
  username: string;
  role: string;
  fullName: string;
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

  // 1. Verify credentials
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);

    // Rule 1: Does the user even exist?
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    // 🚀 Rule 2: THE FIX - Is the user's access revoked?
    // We explicitly check for false, so if a user has no isActive flag, it won't break.
    if (user.isActive === false) {
      throw new UnauthorizedException(
        'Access Denied: Your account has been revoked by an Admin.',
      );
    }

    // Rule 3: Does the password match?
    const isPasswordValid = await bcrypt.compare(pass, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password');
    }

    // Success! Strip the password and return the user
    const { passwordHash: _passwordHash, ...result } = user;
    return result;
  }

  // 2. Generate Token
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
      },
    };
  }
}
