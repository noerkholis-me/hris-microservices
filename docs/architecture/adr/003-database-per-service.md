# ADR-002: Database Per Service Pattern

**Date:** 2025-02-12  
**Status:** Accepted  
**Deciders:** Development Team  
**Related:** [ADR-001: Microservices Architecture](./ADR-001-microservices-architecture.md)

---

## Context

In a microservices architecture, we need to decide how services access and manage data. The primary question is: should services share a database or have their own?

### Options Considered

1. **Shared Database**
2. **Database Per Service** ✅
3. **Hybrid Approach**

---

## Decision

We will implement **Database Per Service** pattern where:

- Each microservice has its own dedicated PostgreSQL database
- No direct database access between services
- Data sharing happens only through APIs or events
- Each service manages its own schema migrations

### Database Allocation

```
PostgreSQL Instance (Single server, multiple databases)
├── auth_db          → Auth Service
├── employee_db      → Employee Service
├── attendance_db    → Attendance Service
├── leave_db         → Leave Service
├── payroll_db       → Payroll Service
└── notification_db  → Notification Service
```

**Note:** While we use separate databases, they reside on the same PostgreSQL instance for cost efficiency. This is acceptable for a portfolio project while maintaining logical separation.

---

## Rationale

### Why Database Per Service

**1. True Service Independence**
- Services can be deployed independently
- Database schema changes don't affect other services
- Service can change its data model without coordination
- Each team (or developer) has full ownership

**2. Technology Flexibility**
- Can choose different databases for different services (future)
- Example: Could use MongoDB for notification service if needed
- Not locked into single database technology

**3. Scalability**
- Scale databases independently based on load
- Payroll DB might need more resources during month-end
- Attendance DB might have higher write throughput

**4. Fault Isolation**
- Database failure in one service doesn't cascade
- Service A's database issues don't block Service B
- Better resilience overall

**5. Clear Boundaries**
- Forces proper service boundaries
- No "accidental" coupling through shared tables
- Must use APIs or events for data access
- Enforces bounded contexts (DDD)

**6. Security & Compliance**
- Granular access control per service
- Easier to apply different security policies
- Example: Payroll data can have stricter access controls
- Audit trails per service

**7. Portfolio Demonstration**
- Shows understanding of microservices principles
- Demonstrates data management in distributed systems
- Proves knowledge of DDD patterns

---

## Trade-offs & Challenges

### Challenges We Accept

**1. No Database Joins Across Services**

**Problem:** Can't use SQL JOIN between Employee and Attendance tables

**Solutions:**
```typescript
// Anti-pattern: Direct database access
// ❌ SELECT * FROM employee_db.employees e 
//    JOIN attendance_db.records a ON e.id = a.employee_id

// ✅ Solution 1: API Call (synchronous)
const employee = await employeeService.getEmployee(employeeId);
const attendance = await attendanceService.getAttendance(employeeId);

// ✅ Solution 2: Data Denormalization
// Store minimal employee data in attendance_db when needed
interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string; // Denormalized
  clockIn: DateTime;
  clockOut: DateTime;
}

// ✅ Solution 3: Event-driven data sync
// When employee name changes, publish event
// Attendance service updates its denormalized copy
```

**2. Distributed Transactions**

**Problem:** No ACID transactions across databases

**Solutions:**
```typescript
// ❌ Anti-pattern: Distributed transaction
await db.transaction(async (tx) => {
  await employeeDb.update(...);  // Different DB
  await leaveDb.update(...);     // Different DB
});

// ✅ Solution 1: Saga Pattern with compensating transactions
try {
  await employeeService.createEmployee(data);
  await leaveService.initializeBalance(employeeId);
} catch (error) {
  // Compensate: delete employee
  await employeeService.deleteEmployee(employeeId);
}

// ✅ Solution 2: Event-driven eventual consistency
employeeService.emit('employee.created', data);
// Leave service reacts asynchronously
// Accepts eventual consistency
```

**3. Data Duplication**

**Problem:** Same data might exist in multiple databases

**Example:**
```
Employee Service:
  employees { id, name, email, department }

Attendance Service:
  attendance { id, employeeId, employeeName } // Duplicated!

Payroll Service:
  payroll { id, employeeId, employeeName } // Duplicated!
```

**Why This is Acceptable:**
- Denormalization is intentional
- Each service owns what it needs
- Eventual consistency through events
- Read performance improvement
- Service independence > data normalization

**Mitigation:**
```typescript
// Keep denormalized data in sync via events
@EventHandler('employee.updated')
async handleEmployeeUpdated(event: EmployeeUpdatedEvent) {
  await this.attendanceRepo.updateMany(
    { employeeId: event.employeeId },
    { employeeName: event.name }
  );
}
```

**4. Complex Queries**

**Problem:** Reporting across multiple services is harder

**Example:** "Show all employees with attendance and leave summary"

**Solutions:**
```typescript
// ✅ Solution 1: API Aggregation (Backend for Frontend pattern)
class EmployeeReportService {
  async getEmployeeReport(employeeId: string) {
    const [employee, attendance, leave] = await Promise.all([
      employeeService.get(employeeId),
      attendanceService.getSummary(employeeId),
      leaveService.getSummary(employeeId)
    ]);
    
    return { employee, attendance, leave };
  }
}

// ✅ Solution 2: Dedicated Reporting Service (future)
// Read replicas for reporting
// CQRS pattern - separate read model
```

**5. Schema Migrations**

**Problem:** Each service manages its own migrations

**Solution:**
```bash
# Each service has its own migration folder
services/
├── auth-service/prisma/migrations/
├── employee-service/prisma/migrations/
├── attendance-service/prisma/migrations/
└── ...

# Independent migration execution
cd services/auth-service && npx prisma migrate dev
cd services/employee-service && npx prisma migrate dev
```

**Benefit:** Services evolve independently

---

## Alternatives Considered

### Option 1: Shared Database

```
All Services → Single PostgreSQL Database
              (shared tables)
```

**Pros:**
- Easy database joins
- ACID transactions work
- Simpler to set up initially
- No data duplication
- Easier complex queries

**Cons:**
- ❌ Tight coupling between services
- ❌ Schema changes affect multiple services
- ❌ Single point of failure
- ❌ Hard to scale independently
- ❌ Not true microservices
- ❌ Teams step on each other's toes

**Why Rejected:**
- Defeats the purpose of microservices
- Services aren't truly independent
- Doesn't demonstrate distributed data management
- Not aligned with learning goals

---

### Option 2: Hybrid Approach

Some services share a database, others have their own.

**Example:**
```
Shared: employee_db (Employee + Attendance + Leave)
Separate: payroll_db, notification_db
```

**Pros:**
- Reduces some complexity
- Easier for related domains
- Some independence

**Cons:**
- Inconsistent architecture
- Confusing boundaries
- Still has coupling issues
- Doesn't demonstrate full pattern

**Why Rejected:**
- Inconsistent approach is confusing
- Doesn't teach proper patterns
- Half-measure doesn't showcase skills

---

## Implementation Strategy

### 1. Database Naming Convention

```
{service_name}_db

Examples:
- auth_db
- employee_db
- attendance_db
```

### 2. Connection Management

Each service has its own DATABASE_URL:

```env
# services/auth-service/.env
DATABASE_URL="postgresql://user:pass@localhost:5432/auth_db"

# services/employee-service/.env
DATABASE_URL="postgresql://user:pass@localhost:5432/employee_db"
```

### 3. Prisma Schema Per Service

```typescript
// services/auth-service/prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL") // Points to auth_db
}

// services/employee-service/prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL") // Points to employee_db
}
```

### 4. Foreign Keys Rules

**❌ Never reference tables across databases:**
```sql
-- Anti-pattern
ALTER TABLE leave_db.leaves 
  ADD FOREIGN KEY (employee_id) 
  REFERENCES employee_db.employees(id);  -- WRONG!
```

**✅ Store IDs as strings, validate via API:**
```typescript
// In Leave Service
async createLeave(data: CreateLeaveDto) {
  // Validate employee exists via API
  const employee = await this.employeeClient.getEmployee(data.employeeId);
  if (!employee) throw new NotFoundException('Employee not found');
  
  // Now create leave record
  return this.leaveRepo.create(data);
}
```

### 5. Data Sync Strategy

```typescript
// Example: Keep employee name in sync

// Employee Service (Publisher)
async updateEmployee(id: string, data: UpdateEmployeeDto) {
  const updated = await this.repo.update(id, data);
  
  this.eventEmitter.emit('employee.updated', {
    employeeId: id,
    name: data.name,
    email: data.email
  });
  
  return updated;
}

// Attendance Service (Subscriber)
@EventHandler('employee.updated')
async syncEmployeeData(event: EmployeeUpdatedEvent) {
  // Update denormalized data
  await this.attendanceRepo.updateMany(
    { employeeId: event.employeeId },
    { employeeName: event.name }
  );
}
```

---

## Cost Considerations

### Development (Local)
```yaml
# docker-compose.yml
postgres:
  image: postgres:15-alpine
  environment:
    POSTGRES_USER: hris
    POSTGRES_PASSWORD: hris123
  # PostgreSQL can host multiple databases
  # No additional cost
```

**Cost:** Free (local Docker)

### Production (Railway)

**Option 1: Single PostgreSQL Instance (Recommended for portfolio)**
- One PostgreSQL server
- Multiple databases on same instance
- **Cost:** $0-5/month (within free tier)

**Option 2: Separate Database Instances**
- One PostgreSQL instance per service
- **Cost:** $30-60/month (not feasible for portfolio)

**Decision:** Single instance, multiple databases (cost vs. true isolation trade-off)

---

## Monitoring & Maintenance

### Health Checks
Each service checks its own database:

```typescript
@Get('health')
async health() {
  const dbHealthy = await this.prisma.$queryRaw`SELECT 1`;
  return { status: 'ok', database: 'connected' };
}
```

### Backup Strategy
- PostgreSQL native backups (pg_dump per database)
- Railway automated backups
- Restoration per service possible

### Migration Management
```bash
# Run migrations for all services
npm run migrate:all

# Or individually
npm run migrate:auth
npm run migrate:employee
```

---

## Success Criteria

✅ Each service has its own database
✅ No cross-database foreign keys
✅ Services communicate via APIs or events
✅ Independent deployment of services
✅ Clear data ownership boundaries
✅ Documented data sync patterns

---

## Consequences

### Positive
- ✅ True service independence
- ✅ Clear bounded contexts
- ✅ Independent scaling
- ✅ Fault isolation
- ✅ Portfolio demonstrates distributed data management

### Negative
- ⚠️ No cross-service joins
- ⚠️ Data duplication required
- ⚠️ Eventual consistency model
- ⚠️ More complex queries

### Mitigation Strategies
- API aggregation for complex queries
- Event-driven data synchronization
- Denormalization where beneficial
- Accept eventual consistency
- CQRS for reporting (future enhancement)

---

## Related Decisions

- [ADR-001: Microservices Architecture](./ADR-001-microservices-architecture.md)
- [ADR-003: Use RabbitMQ for Event Messaging](./ADR-003-rabbitmq-messaging.md)
- ADR-006: Eventual Consistency Model (future)

---

## References

- Martin Fowler - Database Per Service: https://microservices.io/patterns/data/database-per-service.html
- Sam Newman - Building Microservices (Chapter on Data Management)
- Prisma Multi-schema documentation
- PostgreSQL Multi-database setup
