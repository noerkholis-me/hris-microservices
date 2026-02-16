import { Permission, WildcardPermission } from '@hris/contracts';
import { SetMetadata } from '@nestjs/common';

/**
 * Metadata keys for permission decorators
 */
export const PERMISSIONS_KEY = 'permissions';
export const ALL_PERMISSIONS_KEY = 'all_permissions';
export const REQUIRE_ROLE_KEY = 'require_role';
export const SKIP_PERMISSION_CHECK_KEY = 'skip_permission_check';

/**
 * Requires ANY of the specified permissions (OR logic)
 * User only needs ONE of these permissions to access the resource
 *
 * @example
 * ```typescript
 * @Permissions('employee:read:own', 'employee:read:department')
 * @Get('profile')
 * getProfile() {
 *   // User can access if they have EITHER permission
 * }
 * ```
 */
export const Permissions = (
  ...permissions: (Permission | WildcardPermission)[]
) => SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Requires ALL of the specified permissions (AND logic)
 * User must have ALL these permissions to access the resource
 *
 * @example
 * ```typescript
 * @RequireAllPermissions('employee:read:all', 'employee:update:all')
 * @Patch(':id')
 * updateEmployee() {
 *   // User must have BOTH permissions
 * }
 * ```
 */
export const RequireAllPermissions = (
  ...permissions: (Permission | WildcardPermission)[]
) => SetMetadata(ALL_PERMISSIONS_KEY, permissions);

/**
 * Requires specific role(s)
 * Shorthand for role-based access instead of granular permissions
 *
 * @example
 * ```typescript
 * @RequireRole('admin', 'hr_admin')
 * @Post('bulk-import')
 * bulkImport() {
 *   // Only admins or HR admins can access
 * }
 * ```
 */
export const RequireRole = (...roles: string[]) =>
  SetMetadata(REQUIRE_ROLE_KEY, roles);

/**
 * Skip permission check for this endpoint
 * Use for public endpoints or when you handle auth manually
 *
 * @example
 * ```typescript
 * @SkipPermissionCheck()
 * @Get('public-profile/:username')
 * getPublicProfile() {
 *   // No permission check, public access
 * }
 * ```
 */
export const SkipPermissionCheck = () =>
  SetMetadata(SKIP_PERMISSION_CHECK_KEY, true);

/**
 * Combined decorator for common patterns
 * Shorthand for applying JwtAuthGuard + PermissionsGuard
 *
 * @example
 * ```typescript
 * @Protected('employee:read:own')
 * @Get('me')
 * getMe() {
 *   // Requires authentication AND permission
 * }
 * ```
 */
export function Protected(...permissions: (Permission | WildcardPermission)[]) {
  return function (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor,
  ) {
    // Apply both auth and permission checks
    Permissions(...permissions)(target, propertyKey, descriptor);
  };
}

/**
 * Decorator for admin-only endpoints
 * Shorthand for super admin access
 *
 * @example
 * ```typescript
 * @AdminOnly()
 * @Delete(':id')
 * deleteUser() {
 *   // Only super admins can access
 * }
 * ```
 */
export function AdminOnly() {
  return Permissions('*:*:*' as WildcardPermission);
}

/**
 * Decorator for manager-level access
 * Allows access to department-scoped resources
 *
 * @example
 * ```typescript
 * @ManagerAccess('employee:read')
 * @Get('team')
 * getTeamMembers() {
 *   // Managers can read their department employees
 * }
 * ```
 */
export function ManagerAccess(resource: string, action: string = 'read') {
  return Permissions(`${resource}:${action}:department` as Permission);
}

/**
 * Decorator for self-access only
 * User can only access their own resources
 *
 * @example
 * ```typescript
 * @SelfAccess('employee:update')
 * @Patch('profile')
 * updateProfile() {
 *   // User can only update their own profile
 * }
 * ```
 */
export function SelfAccess(resource: string, action: string = 'update') {
  return Permissions(`${resource}:${action}:own` as Permission);
}
