import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permission.decorator';
import { AuthenticatedUser } from '@hris/contracts';

interface RequestWithUser {
  user?: AuthenticatedUser;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      this.logger.debug('No permissions required, allowing access');
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request?.user;

    if (!user?.sub) {
      this.logger.warn('Permission check failed: User not authenticated');
      throw new ForbiddenException('User not authenticated');
    }

    const userPermissions = new Set(user.permissions);
    const hasPermission = requiredPermissions.every((perm) =>
      userPermissions.has(perm),
    );

    if (!hasPermission) {
      this.logger.warn(
        `Permission denied for user ${user.sub}. Required: ${requiredPermissions.join(', ')}, Has: ${Array.from(userPermissions).join(', ') || 'none'}`,
      );
      throw new ForbiddenException('Insufficient permission');
    }

    this.logger.log('Permission check passed for user', user.sub);
    return hasPermission;
  }
}
