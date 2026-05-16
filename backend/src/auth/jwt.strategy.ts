import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './entities/session.entity'; // Make sure this path is correct!

interface JwtPayload {
  sub: string | number;
  username: string;
  role: string;
  sessionId: string; // 🚀 New: The specific session ID from the payload
}

interface JwtUser {
  userId: string | number;
  username: string;
  role: string;
  sessionId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    // 🚀 Inject the session repository to check if the token is still valid
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'asdfdscsdvrfvgrsffsdversfd',
    });
  }

  // 🚀 Make this async because we are doing a database check now!
  async validate(payload: JwtPayload): Promise<JwtUser> {
    // Check the "Front Desk" registry. Is this session still active?
    const session = await this.sessionRepository.findOne({
      where: { id: payload.sessionId },
    });

    if (!session || session.isActive === false) {
      throw new UnauthorizedException(
        'Session expired or revoked from another device.',
      );
    }

    // If active, let them in! This is injected into the Request object (@Req() req)
    return {
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
      sessionId: payload.sessionId,
    };
  }
}
