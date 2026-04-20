import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

interface JwtPayload {
  sub: string | number;
  username: string;
  role: string;
}

interface JwtUser {
  userId: string | number;
  username: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'asdfdscsdvrfvgrsffsdversfd',
    });
  }

  validate(payload: JwtPayload): JwtUser {
    // This payload is injected into the Request object for protected routes
    return {
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  }
}
