import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedUser } from '@hris/contracts';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  override canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  override handleRequest<TUser = AuthenticatedUser>(
    err: Error | null,
    user: AuthenticatedUser | false,
  ): TUser {
    if (err) {
      this.logger.warn(`Authentication error: ${err.message}`);
      throw new BadRequestException(err.message);
    }

    if (!user) {
      this.logger.warn('Authentication failed: No user found');
      throw new UnauthorizedException('Authentication required');
    }

    this.logger.debug(`User authenticated: ${user.email}`);
    return user as TUser;
  }
}
