# HRIS Microservices - Container Diagram (C4 Level 2)

## Overview

This diagram shows the internal structure of the HRIS system, breaking it down into containers (applications and data stores).

## Container Diagram

```mermaid
graph TB
    subgraph Users
        USER[Users<br/>Employees, Managers,<br/>HR, Admins]
    end

    subgraph "API Layer"
        GATEWAY[API Gateway<br/>NestJS<br/>Port 3000<br/>-<br/>Routing<br/>Auth validation<br/>Rate limiting]
    end

    subgraph "Microservices"
        AUTH[Auth Service<br/>NestJS<br/>Port 3001<br/>-<br/>Authentication<br/>Authorization<br/>User management]

        EMP[Employee Service<br/>NestJS<br/>Port 3002<br/>-<br/>Employee CRUD<br/>Departments<br/>Positions]

        ATT[Attendance Service<br/>NestJS<br/>Port 3003<br/>-<br/>Clock in/out<br/>Timesheets<br/>Schedules]

        LEAVE[Leave Service<br/>NestJS<br/>Port 3004<br/>-<br/>Leave requests<br/>Approvals<br/>Balances]

        PAY[Payroll Service<br/>NestJS<br/>Port 3005<br/>-<br/>Salary calc<br/>Payslips<br/>Tax calculation]

        NOTIF[Notification Service<br/>NestJS<br/>Port 3006<br/>-<br/>Email<br/>In-app alerts<br/>Templates]
    end

    subgraph "Data Stores"
        DB_AUTH[(Auth DB<br/>PostgreSQL<br/>-<br/>Users<br/>Roles<br/>Permissions)]

        DB_EMP[(Employee DB<br/>PostgreSQL<br/>-<br/>Employees<br/>Departments<br/>Positions)]

        DB_ATT[(Attendance DB<br/>PostgreSQL<br/>-<br/>Records<br/>Schedules<br/>Overtime)]

        DB_LEAVE[(Leave DB<br/>PostgreSQL<br/>-<br/>Requests<br/>Balances<br/>Policies)]

        DB_PAY[(Payroll DB<br/>PostgreSQL<br/>-<br/>Payrolls<br/>Payslips<br/>Components)]

        DB_NOTIF[(Notification DB<br/>PostgreSQL<br/>-<br/>Logs<br/>Templates)]
    end

    subgraph "Infrastructure"
        REDIS[(Redis<br/>Cache<br/>-<br/>Sessions<br/>Tokens<br/>Rate limits)]

        MQ[RabbitMQ<br/>Message Broker<br/>-<br/>Events<br/>Async tasks<br/>Notifications]
    end

    subgraph "External"
        EMAIL_SVC[Email Service<br/>SendGrid/SMTP]
        STORAGE_SVC[File Storage<br/>S3/Cloudflare]
    end

    %% User connections
    USER -->|HTTPS<br/>REST API| GATEWAY

    %% Gateway to services (REST)
    GATEWAY -->|REST| AUTH
    GATEWAY -->|REST| EMP
    GATEWAY -->|REST| ATT
    GATEWAY -->|REST| LEAVE
    GATEWAY -->|REST| PAY

    %% Services to databases
    AUTH -->|Read/Write| DB_AUTH
    EMP -->|Read/Write| DB_EMP
    ATT -->|Read/Write| DB_ATT
    LEAVE -->|Read/Write| DB_LEAVE
    PAY -->|Read/Write| DB_PAY
    NOTIF -->|Read/Write| DB_NOTIF

    %% Services to Redis
    AUTH -->|Cache tokens| REDIS
    GATEWAY -->|Rate limiting| REDIS

    %% Services to RabbitMQ (publish)
    AUTH -->|Publish:<br/>user.created| MQ
    EMP -->|Publish:<br/>employee.created<br/>employee.updated| MQ
    ATT -->|Publish:<br/>attendance.clocked| MQ
    LEAVE -->|Publish:<br/>leave.approved<br/>leave.rejected| MQ
    PAY -->|Publish:<br/>payroll.completed<br/>payslip.generated| MQ

    %% Services subscribing to events
    MQ -->|Subscribe| NOTIF
    MQ -->|Subscribe| EMP
    MQ -->|Subscribe| ATT
    MQ -->|Subscribe| PAY

    %% Notification to external
    NOTIF -->|Send emails| EMAIL_SVC
    EMP -->|Upload files| STORAGE_SVC

    %% Styling
    style GATEWAY fill:#FF6B6B,stroke:#C92A2A,stroke-width:3px,color:#fff
    style AUTH fill:#4A90E2,stroke:#2E5C8A,stroke-width:2px,color:#fff
    style EMP fill:#4A90E2,stroke:#2E5C8A,stroke-width:2px,color:#fff
    style ATT fill:#4A90E2,stroke:#2E5C8A,stroke-width:2px,color:#fff
    style LEAVE fill:#4A90E2,stroke:#2E5C8A,stroke-width:2px,color:#fff
    style PAY fill:#4A90E2,stroke:#2E5C8A,stroke-width:2px,color:#fff
    style NOTIF fill:#4A90E2,stroke:#2E5C8A,stroke-width:2px,color:#fff
    style MQ fill:#FF9F43,stroke:#D97706,stroke-width:2px,color:#fff
    style REDIS fill:#FF6B9D,stroke:#C92A6A,stroke-width:2px,color:#fff
```

## Containers Description

### API Gateway (Port 3000)

**Technology**: NestJS + Express
**Responsibilities**:

- Single entry point for all client requests
- Route requests to appropriate microservices
- JWT token validation
- Rate limiting
- Request/response logging
- Load balancing (future)

**Key Routes**:

- `/api/auth/*` → Auth Service
- `/api/employees/*` → Employee Service
- `/api/attendance/*` → Attendance Service
- `/api/leave/*` → Leave Service
- `/api/payroll/*` → Payroll Service

---

### Auth Service (Port 3001)

**Technology**: NestJS + Prisma + PostgreSQL
**Database**: auth_db

**Responsibilities**:

- User authentication (login/logout)
- JWT token generation & refresh
- Password management
- Role-based access control (RBAC)
- Permission validation
- Session management

**Key Endpoints**:

- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`
- `POST /auth/forgot-password`
- `GET /auth/me`
- `GET /auth/permissions`

**Events Published**:

- `user.created`
- `user.updated`
- `user.password_changed`

---

### Employee Service (Port 3002)

**Technology**: NestJS + Prisma + PostgreSQL
**Database**: employee_db

**Responsibilities**:

- Employee master data management
- Department hierarchy
- Position/job title management
- Employee documents
- Organization structure

**Key Endpoints**:

- `POST /employees`
- `GET /employees/:id`
- `PATCH /employees/:id`
- `DELETE /employees/:id`
- `GET /departments`
- `GET /positions`

**Events Published**:

- `employee.created`
- `employee.updated`
- `employee.deleted`
- `employee.onboarded`

**Events Subscribed**:

- `user.created` → Create employee profile

---

### Attendance Service (Port 3003)

**Technology**: NestJS + Prisma + PostgreSQL
**Database**: attendance_db

**Responsibilities**:

- Clock in/out tracking
- Timesheet generation
- Work schedule management
- Overtime calculation
- Attendance reports

**Key Endpoints**:

- `POST /attendance/clock-in`
- `POST /attendance/clock-out`
- `GET /attendance/timesheet`
- `GET /attendance/reports`
- `POST /attendance/overtime`

**Events Published**:

- `attendance.clocked_in`
- `attendance.clocked_out`
- `overtime.requested`
- `overtime.approved`

**Events Subscribed**:

- `employee.created` → Initialize attendance record
- `leave.approved` → Update attendance calendar

---

### Leave Service (Port 3004)

**Technology**: NestJS + Prisma + PostgreSQL
**Database**: leave_db

**Responsibilities**:

- Leave request workflow
- Approval chain management
- Leave balance tracking
- Leave policy configuration
- Leave calendar

**Key Endpoints**:

- `POST /leave/requests`
- `GET /leave/requests/:id`
- `PATCH /leave/requests/:id/approve`
- `PATCH /leave/requests/:id/reject`
- `GET /leave/balance`
- `GET /leave/policies`

**Events Published**:

- `leave.requested`
- `leave.approved`
- `leave.rejected`
- `leave.cancelled`

**Events Subscribed**:

- `employee.created` → Initialize leave balance

---

### Payroll Service (Port 3005)

**Technology**: NestJS + Prisma + PostgreSQL
**Database**: payroll_db

**Responsibilities**:

- Monthly payroll calculation
- Payslip generation
- Salary component management
- Tax & deduction calculation
- Payroll reports

**Key Endpoints**:

- `POST /payroll/process`
- `GET /payroll/payslips/:id`
- `GET /payroll/payslips/employee/:employeeId`
- `GET /payroll/components`
- `POST /payroll/deductions`

**Events Published**:

- `payroll.initiated`
- `payroll.calculated`
- `payroll.completed`
- `payslip.generated`

**Events Subscribed**:

- `employee.created` → Set up salary components
- `attendance.overtime_approved` → Add to payroll
- `leave.approved` → Calculate leave deductions

---

### Notification Service (Port 3006)

**Technology**: NestJS + Prisma + PostgreSQL
**Database**: notification_db

**Responsibilities**:

- Email notifications
- In-app notifications
- Notification templates
- Delivery tracking
- SMS (mocked for demo)

**Key Endpoints**:

- `GET /notifications`
- `PATCH /notifications/:id/read`
- `GET /notifications/templates`

**Events Subscribed**:

- `user.created` → Send welcome email
- `leave.approved` → Notify employee
- `leave.rejected` → Notify employee
- `payslip.generated` → Send payslip email
- `employee.onboarded` → Send onboarding email

---

## Infrastructure Components

### PostgreSQL Databases

- **Strategy**: Database per service (microservices best practice)
- **Connection**: Each service has its own database
- **Isolation**: Complete data ownership per service
- **Schema**: Managed via Prisma migrations

### Redis

**Purpose**: Caching and session storage
**Use Cases**:

- JWT token blacklisting
- User session storage
- Rate limiting counters
- Cache frequently accessed data

### RabbitMQ

**Purpose**: Asynchronous communication
**Pattern**: Publish-Subscribe (Event-Driven)
**Exchanges**:

- `hris.events` - Main event exchange
- `hris.dlx` - Dead letter exchange

**Key Queues**:

- `notifications.email`
- `notifications.inapp`
- `employee.events`
- `leave.events`
- `payroll.events`

---

## Communication Patterns

### Synchronous (REST)

**Used for**:

- Real-time queries
- Immediate validation
- CRUD operations
- Client-facing APIs

**Example Flow**:

```
Client → Gateway → Service → Database → Response
```

### Asynchronous (Events)

**Used for**:

- Background processing
- Decoupled operations
- Notifications
- Data synchronization

**Example Flow**:

```
Service A → Publish Event → RabbitMQ → Service B subscribes → Process
```

---

## Scalability Considerations

### Horizontal Scaling

- Each service can scale independently
- Load balancer in front of gateway (future)
- Database read replicas (future)

### Caching Strategy

- Redis for frequently accessed data
- Service-level caching with TTL
- Cache invalidation on updates

### Message Queue

- Handles traffic spikes
- Retry mechanism for failures
- Dead letter queue for failed messages

---

## Security Layers

1. **API Gateway**: JWT validation, rate limiting
2. **Service Level**: Permission checking, data validation
3. **Database**: Row-level security (future consideration)
4. **Network**: Service mesh (future consideration)

---

**Next**: [Component Diagram](./03-component-diagram.md) - Internal service structure
**Previous**: [System Context](./01-system-context.md)
