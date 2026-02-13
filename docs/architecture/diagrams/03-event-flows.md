# HRIS Microservices - Event Flow Diagrams

## Overview

This document illustrates key event-driven workflows in the HRIS system, showing how services communicate asynchronously via RabbitMQ.

---

## 1. Employee Onboarding Flow

```mermaid
sequenceDiagram
    participant HR as HR Admin
    participant Gateway as API Gateway
    participant Auth as Auth Service
    participant Emp as Employee Service
    participant MQ as RabbitMQ
    participant Notif as Notification Service
    participant Leave as Leave Service
    participant Att as Attendance Service

    HR->>Gateway: POST /employees (create employee)
    Gateway->>Emp: Create employee
    Emp->>Emp: Save to employee_db
    Emp-->>Gateway: Employee created
    Gateway-->>HR: 201 Created

    Note over Emp,MQ: Async event publishing
    Emp->>MQ: Publish: employee.created

    MQ->>Auth: Subscribe: employee.created
    Auth->>Auth: Create user account
    Auth->>MQ: Publish: user.created

    MQ->>Notif: Subscribe: user.created
    Notif->>Notif: Send welcome email
    Notif->>External: Email Service

    MQ->>Leave: Subscribe: employee.created
    Leave->>Leave: Initialize leave balance

    MQ->>Att: Subscribe: employee.created
    Att->>Att: Create attendance record
```

**Event Flow**:

1. HR creates employee via API
2. Employee Service publishes `employee.created` event
3. Auth Service creates user account → publishes `user.created`
4. Notification Service sends welcome email
5. Leave Service initializes leave balances
6. Attendance Service creates attendance record

**Result**: New employee fully onboarded across all systems

---

## 2. Leave Request & Approval Flow

```mermaid
sequenceDiagram
    participant Emp as Employee
    participant Gateway as API Gateway
    participant Leave as Leave Service
    participant MQ as RabbitMQ
    participant Notif as Notification Service
    participant Att as Attendance Service
    participant Mgr as Manager

    Emp->>Gateway: POST /leave/requests
    Gateway->>Leave: Create leave request
    Leave->>Leave: Check balance
    Leave->>Leave: Save request (status: pending)
    Leave-->>Gateway: Request created
    Gateway-->>Emp: 201 Created

    Leave->>MQ: Publish: leave.requested
    MQ->>Notif: Subscribe: leave.requested
    Notif->>External: Notify manager (email)

    Note over Mgr: Manager reviews request
    Mgr->>Gateway: PATCH /leave/requests/:id/approve
    Gateway->>Leave: Approve request
    Leave->>Leave: Update status (approved)
    Leave->>Leave: Deduct balance
    Leave-->>Gateway: Approved
    Gateway-->>Mgr: 200 OK

    Leave->>MQ: Publish: leave.approved

    MQ->>Notif: Subscribe: leave.approved
    Notif->>External: Notify employee (email)

    MQ->>Att: Subscribe: leave.approved
    Att->>Att: Block attendance dates
    Att->>Att: Update calendar
```

**Event Flow**:

1. Employee submits leave request
2. Leave Service publishes `leave.requested` → Manager notified
3. Manager approves request
4. Leave Service publishes `leave.approved`
5. Notification Service notifies employee
6. Attendance Service blocks dates in calendar

**Business Rules**:

- Balance checked before approval
- Automatic calendar blocking
- Multi-channel notifications

---

## 3. Monthly Payroll Processing Flow

```mermaid
sequenceDiagram
    participant Cron as Scheduled Job
    participant Pay as Payroll Service
    participant Att as Attendance Service
    participant Leave as Leave Service
    participant Emp as Employee Service
    participant MQ as RabbitMQ
    participant Notif as Notification Service
    participant Employees as Employees

    Note over Cron: 1st of each month
    Cron->>Pay: Trigger payroll processing

    Pay->>MQ: Publish: payroll.initiated
    MQ->>Notif: Subscribe: payroll.initiated
    Notif->>External: Notify HR (email)

    Pay->>Emp: GET /employees (active)
    Emp-->>Pay: Employee list

    loop For each employee
        Pay->>Att: GET /attendance/summary/:employeeId
        Att-->>Pay: Working days, overtime

        Pay->>Leave: GET /leave/summary/:employeeId
        Leave-->>Pay: Leave taken, unpaid days

        Pay->>Pay: Calculate salary
        Pay->>Pay: Apply deductions (tax, insurance)
        Pay->>Pay: Add overtime pay
        Pay->>Pay: Subtract unpaid leave
        Pay->>Pay: Generate payslip

        Pay->>MQ: Publish: payslip.generated
    end

    Pay->>MQ: Publish: payroll.completed

    MQ->>Notif: Subscribe: payslip.generated
    Notif->>Employees: Send payslip (email)

    MQ->>Notif: Subscribe: payroll.completed
    Notif->>External: Notify HR (completion)
```

**Event Flow**:

1. Scheduled job triggers payroll (1st of month)
2. Payroll Service publishes `payroll.initiated`
3. Service queries attendance and leave data
4. For each employee:
   - Calculate net salary
   - Generate payslip
   - Publish `payslip.generated` event
5. Notification Service sends payslips via email
6. Publish `payroll.completed` → HR notified

**Calculations Include**:

- Base salary
- Overtime pay
- Deductions (tax, insurance)
- Unpaid leave deductions
- Bonuses/allowances

---

## 4. Attendance Clock In/Out Flow

```mermaid
sequenceDiagram
    participant Emp as Employee
    participant Gateway as API Gateway
    participant Att as Attendance Service
    participant MQ as RabbitMQ
    participant Notif as Notification Service

    Note over Emp: Morning - Clock In
    Emp->>Gateway: POST /attendance/clock-in
    Gateway->>Att: Clock in
    Att->>Att: Validate schedule
    Att->>Att: Create record
    Att->>Att: Check if late
    Att-->>Gateway: Clocked in
    Gateway-->>Emp: 200 OK (time logged)

    alt Employee is late
        Att->>MQ: Publish: attendance.late
        MQ->>Notif: Subscribe: attendance.late
        Notif->>External: Notify manager
    end

    Att->>MQ: Publish: attendance.clocked_in

    Note over Emp: Evening - Clock Out
    Emp->>Gateway: POST /attendance/clock-out
    Gateway->>Att: Clock out
    Att->>Att: Update record
    Att->>Att: Calculate hours worked
    Att->>Att: Check for overtime
    Att-->>Gateway: Clocked out
    Gateway-->>Emp: 200 OK (total hours)

    alt Overtime detected
        Att->>MQ: Publish: attendance.overtime_detected
        MQ->>Notif: Subscribe: overtime.detected
        Notif->>Emp: Notify employee
    end

    Att->>MQ: Publish: attendance.clocked_out
```

**Event Flow**:

1. Employee clocks in → record created
2. If late → manager notified
3. Employee clocks out → hours calculated
4. If overtime → employee notified
5. Events published for audit trail

**Business Rules**:

- Validation against work schedule
- Late detection (15 min threshold)
- Overtime calculation (>8 hours/day)
- Real-time notifications

---

## 5. Password Reset Flow

```mermaid
sequenceDiagram
    participant User as User
    participant Gateway as API Gateway
    participant Auth as Auth Service
    participant MQ as RabbitMQ
    participant Notif as Notification Service

    User->>Gateway: POST /auth/forgot-password
    Gateway->>Auth: Request password reset
    Auth->>Auth: Generate reset token
    Auth->>Auth: Save token (expires in 1hr)
    Auth-->>Gateway: Token created
    Gateway-->>User: 200 OK (check email)

    Auth->>MQ: Publish: password_reset.requested
    MQ->>Notif: Subscribe: password_reset.requested
    Notif->>User: Email reset link

    Note over User: Click link in email
    User->>Gateway: POST /auth/reset-password
    Gateway->>Auth: Reset password (with token)
    Auth->>Auth: Validate token (not expired/used)
    Auth->>Auth: Hash new password
    Auth->>Auth: Update user
    Auth->>Auth: Mark token as used
    Auth->>Auth: Invalidate all sessions
    Auth-->>Gateway: Password reset
    Gateway-->>User: 200 OK

    Auth->>MQ: Publish: password.changed
    MQ->>Notif: Subscribe: password.changed
    Notif->>User: Confirmation email
```

**Event Flow**:

1. User requests password reset
2. Auth Service generates token → publishes event
3. Notification Service sends reset email
4. User submits new password
5. Auth Service validates and updates
6. Confirmation email sent

**Security**:

- Token expires in 1 hour
- Single-use tokens
- All sessions invalidated
- Email confirmation

---

## Event Catalog

### Employee Domain Events

| Event                | Publisher        | Subscribers                           | Payload                               |
| -------------------- | ---------------- | ------------------------------------- | ------------------------------------- |
| `employee.created`   | Employee Service | Auth, Leave, Attendance, Notification | employeeId, name, email, departmentId |
| `employee.updated`   | Employee Service | Notification                          | employeeId, changes                   |
| `employee.deleted`   | Employee Service | Auth, Leave, Attendance               | employeeId                            |
| `employee.onboarded` | Employee Service | Notification                          | employeeId, name, email               |

### Leave Domain Events

| Event             | Publisher     | Subscribers              | Payload                                 |
| ----------------- | ------------- | ------------------------ | --------------------------------------- |
| `leave.requested` | Leave Service | Notification             | requestId, employeeId, managerId, dates |
| `leave.approved`  | Leave Service | Attendance, Notification | requestId, employeeId, dates            |
| `leave.rejected`  | Leave Service | Notification             | requestId, employeeId, reason           |
| `leave.cancelled` | Leave Service | Attendance, Notification | requestId, employeeId                   |

### Attendance Domain Events

| Event                          | Publisher          | Subscribers           | Payload                               |
| ------------------------------ | ------------------ | --------------------- | ------------------------------------- |
| `attendance.clocked_in`        | Attendance Service | - (audit only)        | employeeId, timestamp, location       |
| `attendance.clocked_out`       | Attendance Service | - (audit only)        | employeeId, timestamp, hoursWorked    |
| `attendance.late`              | Attendance Service | Notification          | employeeId, scheduledTime, actualTime |
| `attendance.overtime_detected` | Attendance Service | Notification, Payroll | employeeId, date, overtimeHours       |

### Payroll Domain Events

| Event                | Publisher       | Subscribers    | Payload                              |
| -------------------- | --------------- | -------------- | ------------------------------------ |
| `payroll.initiated`  | Payroll Service | Notification   | month, year                          |
| `payroll.calculated` | Payroll Service | - (audit only) | month, year, employeeCount           |
| `payroll.completed`  | Payroll Service | Notification   | month, year, totalAmount             |
| `payslip.generated`  | Payroll Service | Notification   | payslipId, employeeId, month, netPay |

### Auth Domain Events

| Event                      | Publisher    | Subscribers            | Payload                     |
| -------------------------- | ------------ | ---------------------- | --------------------------- |
| `user.created`             | Auth Service | Employee, Notification | userId, email, roles        |
| `user.updated`             | Auth Service | Notification           | userId, changes             |
| `password.changed`         | Auth Service | Notification           | userId                      |
| `password_reset.requested` | Auth Service | Notification           | userId, resetToken (hashed) |

---

## Event-Driven Benefits

✅ **Loose Coupling**: Services don't need to know about each other
✅ **Scalability**: Can process events asynchronously
✅ **Resilience**: Failed events can be retried
✅ **Audit Trail**: All events logged for compliance
✅ **Flexibility**: Easy to add new subscribers without changing publishers
✅ **Real-time**: Instant notifications and updates

---

## Message Reliability

### Delivery Guarantees

- **At-least-once delivery**: Messages may be redelivered
- **Idempotent handlers**: Services handle duplicate events safely
- **Dead Letter Queue**: Failed messages moved to DLQ for investigation

### Retry Strategy

```typescript
{
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000, // 1s, 2s, 4s
  }
}
```

---

**Next**: [Database Schemas](../database/schemas.md)
**Previous**: [Container Diagram](./02-container-diagram.md)
