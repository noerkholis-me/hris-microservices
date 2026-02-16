/**
 * Permission System Types
 * Format: resource:action:scope
 * Example: 'employee:read:own', 'leave:approve:department'
 */

/**
 * Resources that can be accessed in the system
 */
export type PermissionResource =
  | 'employee'
  | 'attendance'
  | 'leave'
  | 'payroll'
  | 'notification'
  | 'role'
  | 'permission'
  | 'user';

/**
 * Actions that can be performed on resources
 */
export type PermissionAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'assign'
  | 'revoke'
  | 'export';

/**
 * Scope of the permission
 * - own: Can only access their own resources
 * - department: Can access resources in their department
 * - all: Can access all resources
 */
export type PermissionScope = 'own' | 'department' | 'all';

/**
 * Full permission string in format: resource:action:scope
 * Examples:
 * - 'employee:read:own' - Read own employee profile
 * - 'employee:read:department' - Read all employees in department
 * - 'leave:approve:department' - Approve leaves in department
 * - 'payroll:read:all' - Read all payroll data
 */
export type Permission =
  `${PermissionResource}:${PermissionAction}:${PermissionScope}`;

/**
 * Wildcard permission for admin roles
 * Examples:
 * - 'employee:*:all' - All actions on employees
 * - '*:*:*' - Super admin (all permissions)
 */
export type WildcardPermission =
  | Permission
  | `${PermissionResource}:*:${PermissionScope}`
  | `${PermissionResource}:${PermissionAction}:*`
  | `${PermissionResource}:*:*`
  | '*:*:*';

/**
 * Permission check result
 */
export interface PermissionCheckResult {
  granted: boolean;
  reason?: string;
  requiredPermission?: string;
  userPermissions?: string[];
}

/**
 * Permission validation options
 */
export interface PermissionValidationOptions {
  /**
   * Resource ID to validate for 'own' scope
   */
  resourceId?: string;

  /**
   * User's employee ID for resource ownership check
   */
  employeeId?: string;

  /**
   * User's department ID for department scope check
   */
  departmentId?: string;

  /**
   * Whether to log permission checks
   */
  enableLogging?: boolean;
}

/**
 * Parse permission string into components
 */
export function parsePermission(permission: string): {
  resource: string;
  action: string;
  scope: string;
} | null {
  const parts = permission.split(':');
  if (parts.length !== 3) return null;

  return {
    resource: parts[0],
    action: parts[1],
    scope: parts[2],
  };
}

/**
 * Build permission string from components
 */
export function buildPermission(
  resource: PermissionResource,
  action: PermissionAction,
  scope: PermissionScope,
): Permission {
  return `${resource}:${action}:${scope}`;
}

/**
 * Check if permission matches pattern (supports wildcards)
 */
export function matchesPermission(
  required: string,
  userPermission: string,
): boolean {
  const requiredParts = required.split(':');
  const userParts = userPermission.split(':');

  if (requiredParts.length !== 3 || userParts.length !== 3) {
    return false;
  }

  for (let i = 0; i < 3; i++) {
    if (userParts[i] === '*') continue; // Wildcard matches anything
    if (requiredParts[i] !== userParts[i]) return false;
  }

  return true;
}

/**
 * Common permission constants
 */
export const PERMISSIONS = {
  // Employee permissions
  EMPLOYEE_CREATE_ALL: 'employee:create:all' as Permission,
  EMPLOYEE_READ_OWN: 'employee:read:own' as Permission,
  EMPLOYEE_READ_DEPARTMENT: 'employee:read:department' as Permission,
  EMPLOYEE_READ_ALL: 'employee:read:all' as Permission,
  EMPLOYEE_UPDATE_OWN: 'employee:update:own' as Permission,
  EMPLOYEE_UPDATE_ALL: 'employee:update:all' as Permission,
  EMPLOYEE_DELETE_ALL: 'employee:delete:all' as Permission,

  // Attendance permissions
  ATTENDANCE_CREATE_OWN: 'attendance:create:own' as Permission,
  ATTENDANCE_READ_OWN: 'attendance:read:own' as Permission,
  ATTENDANCE_READ_DEPARTMENT: 'attendance:read:department' as Permission,
  ATTENDANCE_READ_ALL: 'attendance:read:all' as Permission,
  ATTENDANCE_UPDATE_ALL: 'attendance:update:all' as Permission,

  // Leave permissions
  LEAVE_CREATE_OWN: 'leave:create:own' as Permission,
  LEAVE_READ_OWN: 'leave:read:own' as Permission,
  LEAVE_READ_DEPARTMENT: 'leave:read:department' as Permission,
  LEAVE_READ_ALL: 'leave:read:all' as Permission,
  LEAVE_APPROVE_DEPARTMENT: 'leave:approve:department' as Permission,
  LEAVE_APPROVE_ALL: 'leave:approve:all' as Permission,
  LEAVE_REJECT_DEPARTMENT: 'leave:reject:department' as Permission,

  // Payroll permissions
  PAYROLL_READ_OWN: 'payroll:read:own' as Permission,
  PAYROLL_READ_ALL: 'payroll:read:all' as Permission,
  PAYROLL_CREATE_ALL: 'payroll:create:all' as Permission,
  PAYROLL_UPDATE_ALL: 'payroll:update:all' as Permission,

  // Role & Permission management
  ROLE_CREATE_ALL: 'role:create:all' as Permission,
  ROLE_READ_ALL: 'role:read:all' as Permission,
  ROLE_UPDATE_ALL: 'role:update:all' as Permission,
  ROLE_DELETE_ALL: 'role:delete:all' as Permission,
  ROLE_ASSIGN_ALL: 'role:assign:all' as Permission,

  PERMISSION_READ_ALL: 'permission:read:all' as Permission,
  PERMISSION_CREATE_ALL: 'permission:create:all' as Permission,

  // User management
  USER_READ_ALL: 'user:read:all' as Permission,
  USER_UPDATE_ALL: 'user:update:all' as Permission,
  USER_DELETE_ALL: 'user:delete:all' as Permission,

  // Super admin wildcard
  SUPER_ADMIN: '*:*:*' as WildcardPermission,
} as const;
