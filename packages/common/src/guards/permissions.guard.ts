import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  PERMISSIONS_KEY,
  ALL_PERMISSIONS_KEY,
  REQUIRE_ROLE_KEY,
  SKIP_PERMISSION_CHECK_KEY,
} from '../decorators/permissions.decorator';
import { AuthenticatedUser } from '@hris/contracts';
import { matchesPermission, parsePermission } from '@hris/contracts';

interface RequestWithUser extends Request {
  user?: AuthenticatedUser;
  params?: Record<string, string>;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if permission check should be skipped
    const skipCheck = this.reflector.getAllAndOverride<boolean>(
      SKIP_PERMISSION_CHECK_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipCheck) {
      this.logger.debug('Permission check skipped via @SkipPermissionCheck()');
      return true;
    }

    // Get required permissions (OR logic)
    const anyPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Get required permissions (AND logic)
    const allPermissions = this.reflector.getAllAndOverride<string[]>(
      ALL_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Get required roles
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      REQUIRE_ROLE_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permissions or roles required, allow access
    if (
      (!anyPermissions || anyPermissions.length === 0) &&
      (!allPermissions || allPermissions.length === 0) &&
      (!requiredRoles || requiredRoles.length === 0)
    ) {
      this.logger.debug('No permissions or roles required, allowing access');
      return true;
    }

    // Get user from request
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request?.user;

    if (!user?.sub) {
      this.logger.warn('Permission check failed: User not authenticated');
      throw new UnauthorizedException('User not authenticated');
    }

    // Check role-based access
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = this.checkRoles(user, requiredRoles);
      if (!hasRole) {
        this.logger.warn(
          `Role check failed for user ${user.sub}. Required roles: ${requiredRoles.join(', ')}, User roles: ${user.roles?.join(', ') || 'none'}`,
        );
        throw new ForbiddenException('Insufficient role');
      }
      this.logger.debug(`Role check passed for user ${user.sub}`);
    }

    // Get user permissions
    const userPermissions = new Set(user.permissions || []);

    // Check ALL permissions (AND logic)
    if (allPermissions && allPermissions.length > 0) {
      const hasAll = allPermissions.every((required) =>
        this.hasPermission(required, userPermissions, user, request),
      );

      if (!hasAll) {
        this.logger.warn(
          `Permission check failed for user ${user.sub}. Required ALL: ${allPermissions.join(', ')}, Has: ${Array.from(userPermissions).join(', ') || 'none'}`,
        );
        throw new ForbiddenException('Insufficient permissions');
      }
    }

    // Check ANY permission (OR logic)
    if (anyPermissions && anyPermissions.length > 0) {
      const hasAny = anyPermissions.some((required) =>
        this.hasPermission(required, userPermissions, user, request),
      );

      if (!hasAny) {
        this.logger.warn(
          `Permission check failed for user ${user.sub}. Required ANY: ${anyPermissions.join(', ')}, Has: ${Array.from(userPermissions).join(', ') || 'none'}`,
        );
        throw new ForbiddenException('Insufficient permissions');
      }
    }

    this.logger.log(`Permission check passed for user ${user.sub}`);
    return true;
  }

  /**
   * Check if user has required permission
   * Supports wildcard matching and scope validation
   */
  private hasPermission(
    required: string,
    userPermissions: Set<string>,
    user: AuthenticatedUser,
    request: RequestWithUser,
  ): boolean {
    // Check for exact match
    if (userPermissions.has(required)) {
      return this.validateScope(required, user, request);
    }

    // Check for wildcard permissions
    for (const userPerm of userPermissions) {
      if (matchesPermission(required, userPerm)) {
        return this.validateScope(required, user, request);
      }
    }

    return false;
  }

  /**
   * Validate scope-based access (own, department, all)
   */
  private validateScope(
    permission: string,
    user: AuthenticatedUser,
    request: RequestWithUser,
  ): boolean {
    const parsed = parsePermission(permission);
    if (!parsed) return false;

    const { scope } = parsed;

    // 'all' scope - no additional checks needed
    if (scope === 'all') {
      return true;
    }

    // 'department' scope - check if user is in same department
    if (scope === 'department') {
      // Department validation will be implemented in service layer
      // since we need to query the resource's department
      return true;
    }

    // 'own' scope - validate resource ownership
    if (scope === 'own') {
      const resourceId = this.getResourceId(request);
      if (!resourceId) {
        // If no resource ID in request, allow (will be checked in service layer)
        return true;
      }

      // Check if resource ID matches user's employee ID
      if (resourceId === user.employeeId) {
        this.logger.debug(`Resource ownership validated for user ${user.sub}`);
        return true;
      }

      // Check if resource ID matches user's ID (for user endpoints)
      if (resourceId === user.sub) {
        this.logger.debug(`User self-access validated for user ${user.sub}`);
        return true;
      }

      this.logger.warn(
        `Resource ownership check failed. Resource ID: ${resourceId}, User employee ID: ${user.employeeId}, User ID: ${user.sub}`,
      );
      throw new ForbiddenException('Cannot access resources owned by others');
    }

    return true;
  }

  /**
   * Extract resource ID from request params
   */
  private getResourceId(request: RequestWithUser): string | undefined {
    const params = request.params || {};

    // Common param names for resource IDs
    return params.id || params.userId || params.employeeId || params.resourceId;
  }

  /**
   * Check if user has any of the required roles
   */
  private checkRoles(
    user: AuthenticatedUser,
    requiredRoles: string[],
  ): boolean {
    if (!user.roles || user.roles.length === 0) {
      return false;
    }

    const userRoles = new Set(user.roles);
    return requiredRoles.some((role) => userRoles.has(role));
  }
}
