# Permission System - Complete Usage Guide

## 📚 Table of Contents
1. [Quick Start](#quick-start)
2. [Basic Usage](#basic-usage)
3. [Advanced Patterns](#advanced-patterns)
4. [Real-World Examples](#real-world-examples)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Step 1: Run Seed

```bash
cd apps/auth-service
npx prisma db seed
```

This creates:
- ✅ Default permissions (50+)
- ✅ 4 roles (Super Admin, HR Admin, Manager, Employee)
- ✅ Admin user (admin@hris.com / Admin123!@#)

### Step 2: Update Common Package Exports

```typescript
// packages/common/src/index.ts
export * from './types/permission.types';
export * from './decorators/permissions.decorator';
export * from './guards/permissions.guard';
```

### Step 3: Register Guard Globally (Optional)

```typescript
// apps/auth-service/src/app.module.ts
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard, PermissionsGuard } from '@hris/common';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Apply auth globally
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard, // Apply permissions globally
    },
  ],
})
export class AppModule {}
```

---

## 📖 Basic Usage

### 1. **Simple Permission Check (OR Logic)**

User needs ANY of these permissions:

```typescript
import { Controller, Get } from '@nestjs/common';
import { Permissions } from '@hris/common';

@Controller('employees')
export class EmployeeController {
  // User can access if they have EITHER permission
  @Permissions('employee:read:own', 'employee:read:department')
  @Get('profile')
  getProfile() {
    return 'Employee profile';
  }
}
```

### 2. **Multiple Permissions Required (AND Logic)**

User needs ALL of these permissions:

```typescript
import { RequireAllPermissions } from '@hris/common';

@Controller('employees')
export class EmployeeController {
  // User MUST have BOTH permissions
  @RequireAllPermissions('employee:read:all', 'employee:update:all')
  @Patch(':id')
  updateEmployee(@Param('id') id: string) {
    return `Update employee ${id}`;
  }
}
```

### 3. **Role-Based Access**

```typescript
import { RequireRole } from '@hris/common';

@Controller('admin')
export class AdminController {
  // Only users with admin OR hr_admin role
  @RequireRole('super_admin', 'hr_admin')
  @Post('system-settings')
  updateSettings() {
    return 'Settings updated';
  }
}
```

### 4. **Skip Permission Check (Public Endpoints)**

```typescript
import { SkipPermissionCheck } from '@hris/common';

@Controller('public')
export class PublicController {
  // No auth or permission check
  @SkipPermissionCheck()
  @Get('health')
  getHealth() {
    return { status: 'ok' };
  }
}
```

---

## 🎯 Advanced Patterns

### 1. **Shorthand Decorators**

```typescript
import { AdminOnly, ManagerAccess, SelfAccess } from '@hris/common';

@Controller('employees')
export class EmployeeController {
  // Super admin only (wildcard: *:*:*)
  @AdminOnly()
  @Delete(':id')
  deleteEmployee(@Param('id') id: string) {}

  // Manager can read department employees
  @ManagerAccess('employee', 'read') // → employee:read:department
  @Get('team')
  getTeamMembers() {}

  // Employee can only update own profile
  @SelfAccess('employee', 'update') // → employee:update:own
  @Patch('me')
  updateMyProfile() {}
}
```

### 2. **Resource Ownership Validation (Own Scope)**

Guard automatically validates if resource ID matches user's ID:

```typescript
@Controller('employees')
export class EmployeeController {
  // Guard checks: params.id === user.employeeId
  @Permissions('employee:update:own')
  @Patch(':id')
  updateEmployee(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    // If id !== user.employeeId → 403 Forbidden
    return `Update employee ${id}`;
  }
}
```

### 3. **Manual Permission Check in Service**

For complex business logic:

```typescript
import { ForbiddenException } from '@nestjs/common';
import { matchesPermission } from '@hris/common';

@Injectable()
export class EmployeeService {
  async updateEmployee(
    id: string,
    data: UpdateEmployeeDto,
    user: AuthenticatedUser,
  ) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
    });

    // Manual department scope check
    const hasPermission = user.permissions.some(
      (p) =>
        matchesPermission('employee:update:department', p) &&
        employee.departmentId === user.departmentId,
    );

    if (!hasPermission) {
      throw new ForbiddenException('Cannot update employees outside your department');
    }

    return this.prisma.employee.update({ where: { id }, data });
  }
}
```

---

## 💼 Real-World Examples

### Example 1: Employee Profile Management

```typescript
@Controller('employees')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  // Anyone can view their own profile
  @Permissions('employee:read:own')
  @Get('me')
  getMyProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.employeeService.findOne(user.employeeId);
  }

  // Managers can view department, HR can view all
  @Permissions('employee:read:department', 'employee:read:all')
  @Get()
  getAllEmployees(@CurrentUser() user: AuthenticatedUser) {
    // Service layer determines which employees to return based on permissions
    return this.employeeService.findAll(user);
  }

  // Only employees can update their own profile
  @Permissions('employee:update:own')
  @Patch('me')
  updateMyProfile(
    @Body() data: UpdateEmployeeDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.employeeService.update(user.employeeId, data);
  }

  // HR admins can update any employee
  @Permissions('employee:update:all')
  @Patch(':id')
  updateEmployee(
    @Param('id') id: string,
    @Body() data: UpdateEmployeeDto,
  ) {
    return this.employeeService.update(id, data);
  }

  // Only HR admins can delete
  @RequireAllPermissions('employee:delete:all')
  @Delete(':id')
  deleteEmployee(@Param('id') id: string) {
    return this.employeeService.remove(id);
  }
}
```

### Example 2: Leave Management

```typescript
@Controller('leaves')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  // Any employee can request leave
  @Permissions('leave:create:own')
  @Post()
  requestLeave(
    @Body() data: CreateLeaveDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.leaveService.create(user.employeeId, data);
  }

  // Employee can view own leaves
  @Permissions('leave:read:own')
  @Get('my-leaves')
  getMyLeaves(@CurrentUser() user: AuthenticatedUser) {
    return this.leaveService.findByEmployee(user.employeeId);
  }

  // Managers can view department leaves, HR can view all
  @Permissions('leave:read:department', 'leave:read:all')
  @Get('pending')
  getPendingLeaves(@CurrentUser() user: AuthenticatedUser) {
    return this.leaveService.findPending(user);
  }

  // Managers approve department leaves, HR approves all
  @Permissions('leave:approve:department', 'leave:approve:all')
  @Patch(':id/approve')
  approveLeave(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.leaveService.approve(id, user);
  }

  // Managers reject department leaves, HR rejects all
  @Permissions('leave:reject:department', 'leave:reject:all')
  @Patch(':id/reject')
  rejectLeave(
    @Param('id') id: string,
    @Body() data: { reason: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.leaveService.reject(id, data.reason, user);
  }
}
```

### Example 3: Payroll Access

```typescript
@Controller('payroll')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  // Employee can view own payslips
  @Permissions('payroll:read:own')
  @Get('my-payslips')
  getMyPayslips(@CurrentUser() user: AuthenticatedUser) {
    return this.payrollService.findByEmployee(user.employeeId);
  }

  // Only HR can view all payroll data
  @RequireAllPermissions('payroll:read:all')
  @Get('all')
  getAllPayroll() {
    return this.payrollService.findAll();
  }

  // Only HR can process payroll
  @RequireAllPermissions('payroll:create:all')
  @Post('process')
  processPayroll(@Body() data: ProcessPayrollDto) {
    return this.payrollService.processMonthly(data);
  }

  // Only HR can export payroll data
  @RequireAllPermissions('payroll:export:all')
  @Get('export')
  exportPayroll(@Query() filters: ExportFiltersDto) {
    return this.payrollService.export(filters);
  }
}
```

### Example 4: Role Management (Admin Only)

```typescript
@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  // Anyone can view available roles
  @Permissions('role:read:all')
  @Get()
  getAllRoles() {
    return this.roleService.findAll();
  }

  // Only admins can create roles
  @AdminOnly()
  @Post()
  createRole(@Body() data: CreateRoleDto) {
    return this.roleService.create(data);
  }

  // Only admins can assign roles to users
  @RequireAllPermissions('role:assign:all')
  @Post(':roleId/assign/:userId')
  assignRole(
    @Param('roleId') roleId: string,
    @Param('userId') userId: string,
  ) {
    return this.roleService.assignToUser(roleId, userId);
  }
}
```

---

## 🧪 Testing

### Unit Test Example

```typescript
import { Test } from '@nestjs/testing';
import { PermissionsGuard } from '@hris/common';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [PermissionsGuard, Reflector],
    }).compile();

    guard = module.get<PermissionsGuard>(PermissionsGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should allow access with correct permission', async () => {
    const mockContext = createMockExecutionContext({
      user: {
        sub: 'user-123',
        permissions: ['employee:read:own'],
        roles: ['employee'],
      },
      requiredPermissions: ['employee:read:own'],
    });

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should deny access without permission', async () => {
    const mockContext = createMockExecutionContext({
      user: {
        sub: 'user-123',
        permissions: ['employee:read:own'],
        roles: ['employee'],
      },
      requiredPermissions: ['employee:delete:all'],
    });

    await expect(guard.canActivate(mockContext)).rejects.toThrow('Insufficient permissions');
  });
});
```

### E2E Test Example

```typescript
describe('Employee API (e2e)', () => {
  let app: INestApplication;
  let employeeToken: string;
  let hrAdminToken: string;

  beforeAll(async () => {
    // ... setup app ...
    
    // Login as employee
    const employeeAuth = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'employee@test.com', password: 'password' });
    employeeToken = employeeAuth.body.accessToken;

    // Login as HR admin
    const hrAuth = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'hr@test.com', password: 'password' });
    hrAdminToken = hrAuth.body.accessToken;
  });

  it('employee can view own profile', () => {
    return request(app.getHttpServer())
      .get('/employees/me')
      .set('Authorization', `Bearer ${employeeToken}`)
      .expect(200);
  });

  it('employee cannot delete profiles', () => {
    return request(app.getHttpServer())
      .delete('/employees/123')
      .set('Authorization', `Bearer ${employeeToken}`)
      .expect(403);
  });

  it('HR admin can delete profiles', () => {
    return request(app.getHttpServer())
      .delete('/employees/123')
      .set('Authorization', `Bearer ${hrAdminToken}`)
      .expect(200);
  });
});
```

---

## 🔧 Troubleshooting

### Issue 1: "User not authenticated"

**Problem**: Guard throws UnauthorizedException

**Solution**:
- Ensure JwtAuthGuard runs BEFORE PermissionsGuard
- Check JWT token is valid
- Verify `@CurrentUser()` decorator populates request.user

```typescript
// Correct order
@UseGuards(JwtAuthGuard, PermissionsGuard)
```

### Issue 2: "Insufficient permissions" but user has role

**Problem**: User has role but still denied access

**Solution**:
- Check if permissions are included in JWT payload
- Run seed script to ensure role has correct permissions
- Verify `getUserPermissions()` method fetches correctly

```bash
# Re-run seed
npx prisma db seed

# Check user permissions in JWT
console.log(jwtPayload.permissions);
```

### Issue 3: "Cannot access resources owned by others"

**Problem**: Own scope validation fails

**Solution**:
- Ensure `employeeId` is in JWT payload
- Verify param name matches (`id`, `userId`, `employeeId`)
- Check if resourceId extraction works

```typescript
// Make sure JWT has employeeId
const payload = {
  sub: userId,
  employeeId: employee.id, // ← Required for 'own' scope
  permissions: [...],
};
```

### Issue 4: Wildcard permissions not working

**Problem**: Admin with `*:*:*` still denied

**Solution**:
- Verify `matchesPermission()` function is called
- Check if wildcard is in permissions array
- Ensure super admin role has wildcard permission

```sql
-- Check if super admin has wildcard
SELECT p.* FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
JOIN roles r ON r.id = rp.role_id
WHERE r.name = 'super_admin';
```

---

## 📚 Next Steps

1. ✅ Update JWT payload to include permissions (see `enhanced-auth-service.ts`)
2. ✅ Run seed script: `npx prisma db seed`
3. ✅ Test with default admin user
4. ✅ Create role management endpoints
5. ✅ Add permission management UI (future)

---

## 🎓 Permission Format Reference

```
Format: resource:action:scope

Resources:
- employee, attendance, leave, payroll
- notification, role, permission, user

Actions:
- create, read, update, delete
- approve, reject, assign, revoke, export

Scopes:
- own: User's own resources only
- department: User's department resources
- all: All resources in system

Wildcards:
- employee:*:all  → All actions on employees
- *:*:*           → Super admin (everything)
```

---

**Need help?** Check the inline documentation in the source files!