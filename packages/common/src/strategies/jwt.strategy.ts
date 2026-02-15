import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AuthenticatedUser, JwtPayload } from '../types';

const cookieExtractor = (req: Request): string | null => {
  if (req && req.cookies) {
    return (req.cookies['accessToken'] as string) || null;
  }
  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      ignoreExpiration: false,
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    this.logger.log('test');
    if (!payload.sub || !payload.email) {
      this.logger.warn('Invalid JWT payload structure', payload);
      throw new UnauthorizedException('Invalid token payload');
    }

    const user: AuthenticatedUser = {
      sub: payload.sub,
      email: payload.email,
      permissions: payload.permissions,
    };

    this.logger.debug(`User authenticated: ${user.email} (${user.sub})`);
    return user;
  }
}
