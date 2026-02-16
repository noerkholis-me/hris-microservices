import { PrismaClient } from '../src/generated/prisma/client';
import { Logger } from '@nestjs/common';
import { env } from 'prisma/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import {
  employeePermissions,
  hrAdminPermissions,
  managerPermissions,
  permissionsData,
} from '@hris/common';

const logger = new Logger('SEED DATA');
const connectionString = env('AUTH_DATABASE_URL');

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  logger.log('🌱 Starting seed...');

  // ============================================
  // 1. CREATE PERMISSIONS
  // ============================================
  logger.log('\n📋 Creating permissions...');

  const createdPermissions = new Map();

  for (const perm of permissionsData) {
    const permission = await prisma.permission.upsert({
      where: {
        resource_action_scope: {
          resource: perm.resource,
          action: perm.action,
          scope: perm.scope,
        },
      },
      update: {},
      create: perm,
    });

    createdPermissions.set(
      `${perm.resource}:${perm.action}:${perm.scope}`,
      permission.id,
    );
    logger.log(`  ✓ ${permission.displayName}`);
  }

  // ============================================
  // 2. CREATE ROLES
  // ============================================
  logger.log('\n👥 Creating roles...');

  // Super Admin Role
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'super_admin' },
    update: {},
    create: {
      name: 'super_admin',
      displayName: 'Super Administrator',
      description: 'Full system access with all permissions',
      isSystem: true,
    },
  });

  logger.log('  ✓ Super Admin role created');

  // Assign ALL permissions to Super Admin
  const allPermissions = await prisma.permission.findMany();
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: permission.id,
      },
    });
  }
  logger.log(`    - Assigned ${allPermissions.length} permissions`);

  // HR Admin Role
  const hrAdminRole = await prisma.role.upsert({
    where: { name: 'hr_admin' },
    update: {},
    create: {
      name: 'hr_admin',
      displayName: 'HR Administrator',
      description: 'Manages employees, attendance, leaves, and payroll',
      isSystem: true,
    },
  });
  logger.log('  ✓ HR Admin role created');

  // HR Admin permissions
  for (const permKey of hrAdminPermissions) {
    const permId = createdPermissions.get(permKey);
    if (permId) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: hrAdminRole.id,
            permissionId: permId,
          },
        },
        update: {},
        create: {
          roleId: hrAdminRole.id,
          permissionId: permId,
        },
      });
    }
  }
  logger.log(`    - Assigned ${hrAdminPermissions.length} permissions`);

  // Manager Role
  const managerRole = await prisma.role.upsert({
    where: { name: 'manager' },
    update: {},
    create: {
      name: 'manager',
      displayName: 'Manager',
      description: 'Manages team members, approves leaves and overtime',
      isSystem: true,
    },
  });
  logger.log('  ✓ Manager role created');

  // Manager permissions
  for (const permKey of managerPermissions) {
    const permId = createdPermissions.get(permKey);
    if (permId) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: managerRole.id,
            permissionId: permId,
          },
        },
        update: {},
        create: {
          roleId: managerRole.id,
          permissionId: permId,
        },
      });
    }
  }
  logger.log(`    - Assigned ${managerPermissions.length} permissions`);

  // Employee Role
  const employeeRole = await prisma.role.upsert({
    where: { name: 'employee' },
    update: {},
    create: {
      name: 'employee',
      displayName: 'Employee',
      description: 'Basic employee access to own data',
      isSystem: true,
    },
  });
  logger.log('  ✓ Employee role created');

  // Employee permissions
  for (const permKey of employeePermissions) {
    const permId = createdPermissions.get(permKey);
    if (permId) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: employeeRole.id,
            permissionId: permId,
          },
        },
        update: {},
        create: {
          roleId: employeeRole.id,
          permissionId: permId,
        },
      });
    }
  }
  logger.log(`    - Assigned ${employeePermissions.length} permissions`);

  // ============================================
  // 3. CREATE DEFAULT ADMIN USER
  // ============================================
  logger.log('\n👤 Creating default admin user...');

  const hashedPassword = await bcrypt.hash('Admin123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@hris.com' },
    update: {},
    create: {
      email: 'admin@hris.com',
      username: 'admin',
      passwordHash: hashedPassword,
      emailVerified: true,
      isActive: true,
    },
  });
  logger.log('  ✓ Admin user created');

  // Assign Super Admin role to admin user
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: superAdminRole.id,
    },
  });
  logger.log('    ✓ Super Admin role assigned');

  // ============================================
  // SUMMARY
  // ============================================
  logger.log('\n✅ Seed completed successfully!');
  logger.log('\n📊 Summary:');
  logger.log(`  - Permissions created: ${permissionsData.length}`);
  logger.log(`  - Roles created: 4`);
  logger.log(`  - Admin user created: 1`);
  logger.log('\n⚠️  IMPORTANT: Change the admin password after first login!');
}

main()
  .catch((e) => {
    logger.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
