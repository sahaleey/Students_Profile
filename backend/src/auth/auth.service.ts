import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Session } from './entities/session.entity';
import { Repository, Not } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

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
  sessionId?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
  ) {}

  private parseUserAgent(userAgent: string) {
    const ua = userAgent || '';

    const browserMatch = ua.match(
      /(Chrome|Firefox|Safari|Edge|Opera|OPR|MSIE|Trident)\/([\d.]+)/i,
    );
    const osMatch = ua.match(/\(([^)]+)\)/);

    let browserName = 'Unknown Browser';
    if (browserMatch?.[1]) {
      browserName = browserMatch[1]
        .replace(/^OPR$/i, 'Opera')
        .replace(/^MSIE$/i, 'Internet Explorer');
    }

    let osName = 'Unknown OS';
    let osVersion = '';
    if (osMatch?.[1]) {
      const osInfo = osMatch[1];
      if (/Windows/i.test(osInfo)) osName = 'Windows';
      else if (/Mac OS X|Macintosh/i.test(osInfo)) osName = 'macOS';
      else if (/Android/i.test(osInfo)) osName = 'Android';
      else if (/iPhone|iPad|iOS/i.test(osInfo)) osName = 'iOS';
      else if (/Linux/i.test(osInfo)) osName = 'Linux';

      const versionMatch = osInfo.match(
        /(?:Windows NT|Android|OS)\s([\d_\.]+)/i,
      );
      osVersion = versionMatch?.[1]?.replace(/_/g, '.') ?? '';
    }

    return { browserName, osName, osVersion };
  }

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

  async login(user: AuthenticatedUser, ipAddress: string, userAgent: string) {
    // 1. Clean the IP Address (Translate ::1 to 127.0.0.1)
    let cleanIp = ipAddress;
    if (cleanIp === '::1' || cleanIp === '::ffff:127.0.0.1') {
      cleanIp = '127.0.0.1 (Localhost)';
    } else if (cleanIp.includes(',')) {
      cleanIp = cleanIp.split(',')[0].trim();
    }

    // 2. Parse the User Agent for a human-readable device name
    const { browserName, osName, osVersion } = this.parseUserAgent(userAgent);

    // e.g., "Chrome on Windows 10"
    const cleanDeviceInfo = `${browserName} on ${osName} ${osVersion}`.trim();

    // 3. Create a unique fingerprint for this specific user/browser/OS combo
    // Using base64 encoding just to make it a neat, storable string
    const rawFingerprint = `${user.id}-${browserName}-${osName}`;
    const fingerprint = Buffer.from(rawFingerprint).toString('base64');

    // 4. Upsert Logic: Find existing session or create a new one
    let session = await this.sessionRepository.findOne({
      where: { fingerprint: fingerprint, user: { id: String(user.id) } },
    });

    if (session) {
      // 🚀 UPDATE: Device is recognized! Just update the timestamp and IP.
      session.lastLoginAt = new Date();
      session.ipAddress = cleanIp;
      session.isActive = true;
      session.deviceInfo = cleanDeviceInfo;
      session = await this.sessionRepository.save(session);
    } else {
      //  CREATE: First time logging in from this specific browser/OS
      session = await this.sessionRepository.save({
        user: { id: String(user.id) },
        ipAddress: cleanIp,
        deviceInfo: cleanDeviceInfo,
        fingerprint: fingerprint,
        isActive: true,
      });
    }

    // 5. Build JWT Payload
    const payload: JwtPayload = {
      username: user.username,
      sub: user.id,
      role: user.role,
      sessionId: session.id,
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

  async getActiveSessions(userId: string | number) {
    return this.sessionRepository.find({
      where: { user: { id: String(userId) }, isActive: true },
      order: { lastLoginAt: 'DESC' }, // Show newest logins first
      select: ['id', 'deviceInfo', 'ipAddress', 'lastLoginAt'],
    });
  }

  // NEW: Kill all devices EXCEPT the current one
  async revokeOtherSessions(userId: string | number, currentSessionId: string) {
    await this.sessionRepository.update(
      {
        user: { id: String(userId) },
        id: Not(currentSessionId),
      },
      { isActive: false },
    );

    return { message: 'All other devices have been securely logged out.' };
  }
}
