# HRIS Microservices - Database Schemas

## Overview

Each microservice has its own PostgreSQL database following the "database per service" pattern. This ensures:

- Data ownership and encapsulation
- Independent scaling
- Service autonomy
- Clear boundaries

---

## 1. Auth Service Database (`auth_db`)

### Tables Overview

- `users` - User accounts and authentication
- `roles` - System roles (RBAC)
- `permissions` - Fine-grained permissions
- `user_roles` - User-role assignments
- `role_permissions` - Role-permission assignments
- `refresh_tokens` - JWT refresh tokens
- `login_history` - Audit trail
- `password_resets` - Password reset tokens
- `email_verifications` - Email verification tokens

### Schema (Prisma)

```prisma
// services/auth-service/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                String    @id @default(uuid())
  email             String    @unique
  username          String    @unique
  passwordHash      String    @map("password_hash")
  emailVerified     Boolean   @default(false) @map("email_verified")
  isActive          Boolean   @default(true) @map("is_active")
  isSuspended       Boolean   @default(false) @map("is_suspended")
  suspendedAt       DateTime? @map("suspended_at")
  suspendedReason   String?   @map("suspended_reason")

  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")
  lastLoginAt       DateTime? @map("last_login_at")
  passwordChangedAt DateTime? @map("password_changed_at")

  roles             UserRole[]
  refreshTokens     RefreshToken[]
  loginHistory      LoginHistory[]
  passwordResets    PasswordReset[]
  emailVerifications EmailVerification[]

  employeeId        String?   @unique @map("employee_id") // Reference to employee service

  @@index([email])
  @@index([employeeId])
  @@map("users")
}

model Role {
  id          String   @id @default(uuid())
  name        String   @unique
  displayName String   @map("display_name")
  description String?
  isSystem    Boolean  @default(false) @map("is_system")

  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  userRoles   UserRole[]
  permissions RolePermission[]

  @@map("roles")
}

model UserRole {
  id         String    @id @default(uuid())
  userId     String    @map("user_id")
  roleId     String    @map("role_id")

  validFrom  DateTime? @map("valid_from")
  validUntil DateTime? @map("valid_until")

  assignedBy String?   @map("assigned_by")
  assignedAt DateTime  @default(now()) @map("assigned_at")

  user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  role       Role      @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@unique([userId, roleId])
  @@index([userId])
  @@index([roleId])
  @@map("user_roles")
}

model Permission {
  id          String   @id @default(uuid())
  resource    String   // employee, attendance, leave, payroll
  action      String   // create, read, update, delete, approve
  scope       String?  // own, department, all
  displayName String   @map("display_name")
  description String?

  createdAt   DateTime @default(now()) @map("created_at")

  rolePermissions RolePermission[]

  @@unique([resource, action, scope])
  @@index([resource])
  @@map("permissions")
}

model RolePermission {
  id           String     @id @default(uuid())
  roleId       String     @map("role_id")
  permissionId String     @map("permission_id")

  grantedAt    DateTime   @default(now()) @map("granted_at")
  grantedBy    String?    @map("granted_by")

  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@unique([roleId, permissionId])
  @@index([roleId])
  @@index([permissionId])
  @@map("role_permissions")
}

model RefreshToken {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  token     String   @unique
  deviceId  String?  @map("device_id")
  userAgent String?  @map("user_agent")
  ipAddress String?  @map("ip_address")

  isRevoked Boolean  @default(false) @map("is_revoked")
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@index([expiresAt])
  @@map("refresh_tokens")
}

model LoginHistory {
  id         String      @id @default(uuid())
  userId     String      @map("user_id")
  ipAddress  String      @map("ip_address")
  userAgent  String?     @map("user_agent")
  deviceId   String?     @map("device_id")

  status     LoginStatus
  failReason String?     @map("fail_reason")

  loginAt    DateTime    @default(now()) @map("login_at")
  logoutAt   DateTime?   @map("logout_at")

  user       User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([loginAt])
  @@map("login_history")
}

enum LoginStatus {
  SUCCESS
  FAILED
  BLOCKED
  SUSPICIOUS
}

model PasswordReset {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  token     String   @unique

  isUsed    Boolean  @default(false) @map("is_used")
  usedAt    DateTime? @map("used_at")
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@map("password_resets")
}

model EmailVerification {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  token     String   @unique

  isUsed    Boolean  @default(false) @map("is_used")
  usedAt    DateTime? @map("used_at")
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@map("email_verifications")
}
```

---

## 2. Employee Service Database (`employee_db`)

### Tables Overview

- `employees` - Employee master data
- `departments` - Organization departments
- `positions` - Job positions/titles
- `employee_documents` - Employee file attachments
- `employee_emergency_contacts` - Emergency contact info

### Schema (Prisma)

```prisma
// services/employee-service/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Employee {
  id              String    @id @default(uuid())
  employeeNumber  String    @unique @map("employee_number")

  // Personal Information
  firstName       String    @map("first_name")
  lastName        String    @map("last_name")
  middleName      String?   @map("middle_name")
  email           String    @unique
  phoneNumber     String?   @map("phone_number")
  dateOfBirth     DateTime  @map("date_of_birth")
  gender          Gender
  maritalStatus   MaritalStatus @map("marital_status")
  nationality     String

  // Address
  address         String?
  city            String?
  state           String?
  postalCode      String?   @map("postal_code")
  country         String?

  // Employment Information
  departmentId    String    @map("department_id")
  positionId      String    @map("position_id")
  managerId       String?   @map("manager_id") // Self-reference

  hireDate        DateTime  @map("hire_date")
  employmentType  EmploymentType @map("employment_type")
  employmentStatus EmploymentStatus @map("employment_status")
  terminationDate DateTime? @map("termination_date")
  terminationReason String? @map("termination_reason")

  // Profile
  profilePictureUrl String? @map("profile_picture_url")
  bio             String?

  // System
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  // Relations
  department      Department @relation(fields: [departmentId], references: [id])
  position        Position @relation(fields: [positionId], references: [id])
  manager         Employee? @relation("EmployeeManager", fields: [managerId], references: [id])
  subordinates    Employee[] @relation("EmployeeManager")
  documents       EmployeeDocument[]
  emergencyContacts EmployeeEmergencyContact[]

  // Reference to auth service
  userId          String?   @unique @map("user_id")

  @@index([email])
  @@index([employeeNumber])
  @@index([departmentId])
  @@index([positionId])
  @@index([managerId])
  @@map("employees")
}

enum Gender {
  MALE
  FEMALE
  OTHER
  PREFER_NOT_TO_SAY
}

enum MaritalStatus {
  SINGLE
  MARRIED
  DIVORCED
  WIDOWED
}

enum EmploymentType {
  FULL_TIME
  PART_TIME
  CONTRACT
  INTERNSHIP
  FREELANCE
}

enum EmploymentStatus {
  ACTIVE
  ON_LEAVE
  SUSPENDED
  TERMINATED
}

model Department {
  id          String   @id @default(uuid())
  name        String   @unique
  code        String   @unique
  description String?
  parentId    String?  @map("parent_id")

  headId      String?  @unique @map("head_id") // Department head employee ID

  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  parent      Department? @relation("DepartmentHierarchy", fields: [parentId], references: [id])
  children    Department[] @relation("DepartmentHierarchy")
  employees   Employee[]

  @@index([parentId])
  @@map("departments")
}

model Position {
  id          String   @id @default(uuid())
  title       String
  code        String   @unique
  description String?
  level       String?  // Junior, Mid, Senior, Lead, Manager

  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  employees   Employee[]

  @@map("positions")
}

model EmployeeDocument {
  id          String   @id @default(uuid())
  employeeId  String   @map("employee_id")

  documentType DocumentType @map("document_type")
  fileName    String   @map("file_name")
  fileUrl     String   @map("file_url")
  fileSize    Int      @map("file_size") // bytes
  mimeType    String   @map("mime_type")

  description String?
  uploadedBy  String   @map("uploaded_by") // User ID who uploaded

  createdAt   DateTime @default(now()) @map("created_at")

  employee    Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  @@index([employeeId])
  @@map("employee_documents")
}

enum DocumentType {
  CONTRACT
  ID_CARD
  CERTIFICATE
  RESUME
  PHOTO
  OTHER
}

model EmployeeEmergencyContact {
  id          String   @id @default(uuid())
  employeeId  String   @map("employee_id")

  name        String
  relationship String
  phoneNumber String   @map("phone_number")
  email       String?
  address     String?

  isPrimary   Boolean  @default(false) @map("is_primary")

  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  employee    Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  @@index([employeeId])
  @@map("employee_emergency_contacts")
}
```

---

## 3. Attendance Service Database (`attendance_db`)

### Tables Overview

- `attendance_records` - Daily clock in/out
- `work_schedules` - Employee work schedules
- `overtime_requests` - Overtime requests
- `attendance_policies` - Company attendance policies

### Schema (Prisma)

```prisma
// services/attendance-service/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model AttendanceRecord {
  id          String   @id @default(uuid())
  employeeId  String   @map("employee_id")
  date        DateTime @db.Date

  clockInTime  DateTime? @map("clock_in_time")
  clockOutTime DateTime? @map("clock_out_time")

  clockInLocation  String? @map("clock_in_location")
  clockOutLocation String? @map("clock_out_location")

  hoursWorked      Decimal? @map("hours_worked") @db.Decimal(4, 2)
  overtimeHours    Decimal? @map("overtime_hours") @db.Decimal(4, 2)

  status      AttendanceStatus
  isLate      Boolean  @default(false) @map("is_late")
  isEarlyLeave Boolean @default(false) @map("is_early_leave")

  notes       String?

  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@unique([employeeId, date])
  @@index([employeeId])
  @@index([date])
  @@index([status])
  @@map("attendance_records")
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
  HALF_DAY
  ON_LEAVE
  WEEKEND
  HOLIDAY
}

model WorkSchedule {
  id          String   @id @default(uuid())
  employeeId  String   @map("employee_id")

  dayOfWeek   Int      @map("day_of_week") // 0 = Sunday, 6 = Saturday
  startTime   String   @map("start_time") // HH:mm format
  endTime     String   @map("end_time")   // HH:mm format

  isWorkingDay Boolean @default(true) @map("is_working_day")

  effectiveFrom DateTime @map("effective_from") @db.Date
  effectiveTo   DateTime? @map("effective_to") @db.Date

  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@unique([employeeId, dayOfWeek, effectiveFrom])
  @@index([employeeId])
  @@map("work_schedules")
}

model OvertimeRequest {
  id          String   @id @default(uuid())
  employeeId  String   @map("employee_id")

  date        DateTime @db.Date
  hours       Decimal  @db.Decimal(4, 2)
  reason      String

  status      ApprovalStatus
  approvedBy  String?  @map("approved_by")
  approvedAt  DateTime? @map("approved_at")
  rejectedReason String? @map("rejected_reason")

  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@index([employeeId])
  @@index([status])
  @@map("overtime_requests")
}

enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
}

model AttendancePolicy {
  id          String   @id @default(uuid())
  name        String   @unique

  lateThresholdMinutes Int @map("late_threshold_minutes") // e.g., 15 minutes
  halfDayThresholdHours Decimal @map("half_day_threshold_hours") @db.Decimal(3, 1) // e.g., 4.0 hours
  fullDayHours         Decimal @map("full_day_hours") @db.Decimal(3, 1) // e.g., 8.0 hours
  overtimeMultiplier   Decimal @map("overtime_multiplier") @db.Decimal(3, 2) // e.g., 1.5x

  isActive    Boolean  @default(true) @map("is_active")

  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("attendance_policies")
}
```

---

## 4. Leave Service Database (`leave_db`)

### Tables Overview

- `leave_requests` - Leave applications
- `leave_balances` - Employee leave balances
- `leave_policies` - Leave types and policies
- `leave_approval_workflows` - Approval chains

### Schema (Prisma)

```prisma
// services/leave-service/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model LeaveRequest {
  id          String   @id @default(uuid())
  employeeId  String   @map("employee_id")
  leavePolicyId String @map("leave_policy_id")

  startDate   DateTime @map("start_date") @db.Date
  endDate     DateTime @map("end_date") @db.Date
  totalDays   Decimal  @map("total_days") @db.Decimal(4, 1) // Can be 0.5 for half-day

  reason      String
  status      LeaveRequestStatus

  appliedAt   DateTime @default(now()) @map("applied_at")

  approvedBy  String?  @map("approved_by")
  approvedAt  DateTime? @map("approved_at")
  rejectedBy  String?  @map("rejected_by")
  rejectedAt  DateTime? @map("rejected_at")
  rejectedReason String? @map("rejected_reason")

  cancelledAt DateTime? @map("cancelled_at")
  cancelledReason String? @map("cancelled_reason")

  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  leavePolicy LeavePolicy @relation(fields: [leavePolicyId], references: [id])

  @@index([employeeId])
  @@index([status])
  @@index([startDate])
  @@map("leave_requests")
}

enum LeaveRequestStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
}

model LeaveBalance {
  id          String   @id @default(uuid())
  employeeId  String   @map("employee_id")
  leavePolicyId String @map("leave_policy_id")
  year        Int

  totalDays   Decimal  @map("total_days") @db.Decimal(5, 1)
  usedDays    Decimal  @default(0) @map("used_days") @db.Decimal(5, 1)
  remainingDays Decimal @map("remaining_days") @db.Decimal(5, 1)

  carryForwardDays Decimal @default(0) @map("carry_forward_days") @db.Decimal(5, 1)

  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  leavePolicy LeavePolicy @relation(fields: [leavePolicyId], references: [id])

  @@unique([employeeId, leavePolicyId, year])
  @@index([employeeId])
  @@map("leave_balances")
}

model LeavePolicy {
  id          String   @id @default(uuid())
  name        String   @unique
  code        String   @unique
  description String?

  daysPerYear Decimal  @map("days_per_year") @db.Decimal(4, 1)
  maxCarryForward Decimal @default(0) @map("max_carry_forward") @db.Decimal(4, 1)

  requiresApproval Boolean @default(true) @map("requires_approval")
  isPaid      Boolean  @default(true) @map("is_paid")

  minNoticeDays Int    @default(0) @map("min_notice_days")
  maxConsecutiveDays Int? @map("max_consecutive_days")

  isActive    Boolean  @default(true) @map("is_active")

  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  leaveRequests LeaveRequest[]
  leaveBalances LeaveBalance[]

  @@map("leave_policies")
}
```

---

## 5. Payroll Service Database (`payroll_db`)

### Tables Overview

- `payroll_runs` - Monthly payroll processing
- `payslips` - Individual payslips
- `salary_components` - Base, allowances, bonuses
- `deductions` - Tax, insurance
- `payroll_adjustments` - Manual adjustments

### Schema (Prisma)

```prisma
// services/payroll-service/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model PayrollRun {
  id          String   @id @default(uuid())

  month       Int
  year        Int
  periodStart DateTime @map("period_start") @db.Date
  periodEnd   DateTime @map("period_end") @db.Date

  status      PayrollStatus

  totalGrossPay Decimal @default(0) @map("total_gross_pay") @db.Decimal(12, 2)
  totalDeductions Decimal @default(0) @map("total_deductions") @db.Decimal(12, 2)
  totalNetPay   Decimal @default(0) @map("total_net_pay") @db.Decimal(12, 2)

  processedBy String?  @map("processed_by")
  processedAt DateTime? @map("processed_at")

  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  payslips    Payslip[]

  @@unique([month, year])
  @@index([status])
  @@map("payroll_runs")
}

enum PayrollStatus {
  DRAFT
  PROCESSING
  COMPLETED
  APPROVED
  PAID
}

model Payslip {
  id          String   @id @default(uuid())
  payrollRunId String  @map("payroll_run_id")
  employeeId  String   @map("employee_id")

  // Salary components
  basicSalary  Decimal @map("basic_salary") @db.Decimal(10, 2)
  allowances   Decimal @default(0) @map("allowances") @db.Decimal(10, 2)
  bonuses      Decimal @default(0) @map("bonuses") @db.Decimal(10, 2)
  overtimePay  Decimal @default(0) @map("overtime_pay") @db.Decimal(10, 2)

  grossPay     Decimal @map("gross_pay") @db.Decimal(10, 2)

  // Deductions
  taxDeduction Decimal @default(0) @map("tax_deduction") @db.Decimal(10, 2)
  insuranceDeduction Decimal @default(0) @map("insurance_deduction") @db.Decimal(10, 2)
  loanDeduction Decimal @default(0) @map("loan_deduction") @db.Decimal(10, 2)
  otherDeductions Decimal @default(0) @map("other_deductions") @db.Decimal(10, 2)

  totalDeductions Decimal @map("total_deductions") @db.Decimal(10, 2)

  netPay       Decimal @map("net_pay") @db.Decimal(10, 2)

  // Work details
  workingDays  Decimal @map("working_days") @db.Decimal(4, 1)
  absentDays   Decimal @default(0) @map("absent_days") @db.Decimal(4, 1)
  leaveDays    Decimal @default(0) @map("leave_days") @db.Decimal(4, 1)
  overtimeHours Decimal @default(0) @map("overtime_hours") @db.Decimal(5, 2)

  // PDF
  payslipUrl   String? @map("payslip_url")

  createdAt    DateTime @default(now()) @map("created_at")

  payrollRun   PayrollRun @relation(fields: [payrollRunId], references: [id])
  components   SalaryComponent[]
  deductions   Deduction[]

  @@unique([payrollRunId, employeeId])
  @@index([employeeId])
  @@map("payslips")
}

model SalaryComponent {
  id          String   @id @default(uuid())
  employeeId  String   @map("employee_id")
  payslipId   String?  @map("payslip_id")

  componentType ComponentType @map("component_type")
  name        String
  amount      Decimal  @db.Decimal(10, 2)

  isRecurring Boolean  @default(true) @map("is_recurring")
  isActive    Boolean  @default(true) @map("is_active")

  effectiveFrom DateTime? @map("effective_from") @db.Date
  effectiveTo   DateTime? @map("effective_to") @db.Date

  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  payslip     Payslip? @relation(fields: [payslipId], references: [id])

  @@index([employeeId])
  @@index([payslipId])
  @@map("salary_components")
}

enum ComponentType {
  BASE_SALARY
  ALLOWANCE
  BONUS
  COMMISSION
  OVERTIME
}

model Deduction {
  id          String   @id @default(uuid())
  employeeId  String   @map("employee_id")
  payslipId   String?  @map("payslip_id")

  deductionType DeductionType @map("deduction_type")
  name        String
  amount      Decimal  @db.Decimal(10, 2)

  isRecurring Boolean  @default(true) @map("is_recurring")
  isActive    Boolean  @default(true) @map("is_active")

  effectiveFrom DateTime? @map("effective_from") @db.Date
  effectiveTo   DateTime? @map("effective_to") @db.Date

  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  payslip     Payslip? @relation(fields: [payslipId], references: [id])

  @@index([employeeId])
  @@index([payslipId])
  @@map("deductions")
}

enum DeductionType {
  TAX
  INSURANCE
  PENSION
  LOAN
  ADVANCE
  OTHER
}
```

---

## 6. Notification Service Database (`notification_db`)

### Tables Overview

- `notifications` - In-app notifications
- `notification_templates` - Email/notification templates
- `notification_logs` - Delivery tracking

### Schema (Prisma)

```prisma
// services/notification-service/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Notification {
  id          String   @id @default(uuid())
  userId      String   @map("user_id") // From auth service

  type        NotificationType
  title       String
  message     String

  isRead      Boolean  @default(false) @map("is_read")
  readAt      DateTime? @map("read_at")

  actionUrl   String?  @map("action_url")
  metadata    Json?

  createdAt   DateTime @default(now()) @map("created_at")

  @@index([userId])
  @@index([isRead])
  @@index([createdAt])
  @@map("notifications")
}

enum NotificationType {
  INFO
  SUCCESS
  WARNING
  ERROR
  LEAVE_APPROVED
  LEAVE_REJECTED
  PAYSLIP_GENERATED
  EMPLOYEE_ONBOARDED
  OVERTIME_APPROVED
}

model NotificationTemplate {
  id          String   @id @default(uuid())
  code        String   @unique
  name        String

  subject     String?  // For email
  bodyHtml    String   @map("body_html")
  bodyText    String   @map("body_text")

  variables   String[] // List of variables like {{employeeName}}

  isActive    Boolean  @default(true) @map("is_active")

  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("notification_templates")
}

model NotificationLog {
  id          String   @id @default(uuid())

  channel     NotificationChannel
  recipient   String   // email or user ID
  templateId  String?  @map("template_id")

  subject     String?
  body        String

  status      DeliveryStatus
  errorMessage String? @map("error_message")

  sentAt      DateTime? @map("sent_at")
  deliveredAt DateTime? @map("delivered_at")

  metadata    Json?

  createdAt   DateTime @default(now()) @map("created_at")

  @@index([recipient])
  @@index([status])
  @@index([createdAt])
  @@map("notification_logs")
}

enum NotificationChannel {
  EMAIL
  IN_APP
  SMS
  PUSH
}

enum DeliveryStatus {
  PENDING
  SENT
  DELIVERED
  FAILED
  BOUNCED
}
```

---

## Database Relationships Across Services

### Cross-Service References

Since each service has its own database, we **cannot use foreign keys** across services. Instead, we store IDs as strings:

```typescript
// In Auth Service
model User {
  employeeId String? @unique // Reference to Employee Service
}

// In Employee Service
model Employee {
  userId String? @unique // Reference to Auth Service
}
```

### Data Consistency Strategy

1. **Event-Driven Sync**: When employee is created, publish event to create user
2. **No Cascading Deletes**: Must handle via events
3. **Eventual Consistency**: Accept that data may be temporarily inconsistent
4. **API Calls**: For read operations, services can query each other

---

## Initial Seed Data

Each service will have seed data for demo purposes:

### Auth Service Seeds

- Default roles: super_admin, hr_admin, manager, employee
- Default permissions for each resource
- Sample admin user

### Employee Service Seeds

- Sample departments (Engineering, HR, Sales)
- Sample positions (Software Engineer, HR Manager, etc.)
- Sample employees (3-5 for demo)

### Leave Service Seeds

- Leave policies (Annual Leave, Sick Leave, Emergency Leave)
- Initial balances for employees

### Attendance Service Seeds

- Default work schedules (9am-5pm, Mon-Fri)
- Attendance policy (15 min late threshold, etc.)

### Payroll Service Seeds

- Sample salary components for employees

---

## Performance Considerations

### Indexes

- All foreign keys indexed
- Frequently queried fields indexed (email, employeeId, status, dates)
- Composite indexes for common queries

### Partitioning (Future)

- `attendance_records` by date (monthly partitions)
- `login_history` by date
- `notification_logs` by date

### Archiving Strategy

- Archive old attendance records (>2 years)
- Archive old payroll data (>7 years for compliance)
- Archive notification logs (>6 months)

---

**Next**: [Setup Guide](../setup/windows-setup.md)
**Previous**: [Event Flows](../architecture/03-event-flows.md)
