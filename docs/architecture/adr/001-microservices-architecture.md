# ADR-001: Microservices Architecture over Monolithic

## Status

**Accepted**

## Context

We need to build an HRIS (Human Resource Information System) as a portfolio project that demonstrates:

- Production-ready architecture skills
- Scalability understanding
- Modern backend development practices
- System design capabilities for senior/mid-level roles

Two main architectural approaches were considered:

1. **Modular Monolith** with NestJS modules
2. **Microservices** with separate services

## Decision

We will use **Microservices Architecture** with the following characteristics:

- Services organized by business domains (bounded contexts)
- Each service has its own database (database per service pattern)
- Inter-service communication via REST (synchronous) and RabbitMQ (asynchronous)
- API Gateway as single entry point
- Event-driven architecture for cross-service updates

### Service Boundaries

1. **Auth Service** - Authentication & Authorization
2. **Employee Service** - Employee master data
3. **Attendance Service** - Time tracking
4. **Leave Service** - Leave management
5. **Payroll Service** - Payroll processing
6. **Notification Service** - Email & notifications

---

## Rationale

### Why Microservices?

#### 1. **Portfolio Differentiation**

- Most portfolio projects are simple monoliths or CRUD applications
- Microservices demonstrates understanding of distributed systems
- Shows ability to handle complex architecture decisions
- Highly valued skill in job market (many companies specifically seek this experience)

#### 2. **Learning Depth**

- Forces understanding of:
  - Service boundaries and domain-driven design
  - Inter-service communication (sync vs async)
  - Data consistency in distributed systems
  - Event-driven architecture
  - Message queues (RabbitMQ)
  - API gateway patterns
  - Service discovery (future)
  - Distributed tracing (future)

#### 3. **Scalability Demonstration**

- Each service can scale independently based on load
- Example: Payroll service needs more resources at month-end
- Attendance service handles more traffic during clock-in/out times
- Shows understanding of real-world scaling needs

#### 4. **Technology Showcase**

- Multiple technologies working together:
  - NestJS microservices
  - PostgreSQL (database per service)
  - RabbitMQ (message broker)
  - Redis (caching)
  - Docker (containerization)
  - Docker Compose (orchestration)

#### 5. **Real-World Relevance**

- Mirrors production systems in modern companies
- Demonstrates understanding of:
  - Bounded contexts
  - Service ownership
  - Failure isolation
  - Deployment independence

### Why NOT a Modular Monolith?

While a modular monolith would be:

- ✅ Simpler to develop
- ✅ Easier to deploy
- ✅ Less infrastructure overhead
- ✅ Better for team of 1-5 developers

It would NOT demonstrate:

- ❌ Distributed systems knowledge
- ❌ Microservices experience (high demand in market)
- ❌ Event-driven architecture
- ❌ Service mesh understanding
- ❌ Independent scaling capabilities

## Trade-offs Accepted

### Increased Complexity ⚠️

**Challenge**: More moving parts, harder to debug
**Mitigation**:

- Comprehensive logging with correlation IDs
- Health check endpoints
- Docker Compose for easy local development
- Clear documentation

### Network Latency 📡

**Challenge**: Inter-service calls add latency
**Mitigation**:

- Redis caching for frequently accessed data
- Async communication where appropriate
- Smart service boundaries to minimize cross-service calls

### Data Consistency 🔄

**Challenge**: No database transactions across services
**Mitigation**:

- Event-driven architecture for eventual consistency
- Saga pattern for distributed transactions (if needed)
- Idempotent event handlers

### Operational Complexity 🔧

**Challenge**: More services to deploy and monitor
**Mitigation**:

- Docker Compose for local development
- Railway/Render for simple cloud deployment
- Basic monitoring with health checks
- Centralized logging (future: ELK stack)

### Development Speed 🐌

**Challenge**: Takes longer to build features across services
**Mitigation**:

- Well-defined service contracts
- Shared libraries for common code
- Code generation for boilerplate
- Focus on core features, not everything

## Consequences

### Positive ✅

1. **Portfolio Impact**: Stands out significantly in job applications
2. **Interview Topics**: Rich discussion points for system design interviews
3. **Skill Development**: Deep learning of distributed systems
4. **Resume Value**: "Designed and implemented microservices architecture" is powerful
5. **Scalability**: Each service independently scalable (demonstrates understanding)

### Negative ⚠️

1. **Time Investment**: 10-12 weeks full-time (vs 6-8 for monolith)
2. **Local Resources**: Requires 8GB RAM minimum
3. **Complexity**: More can go wrong, more to test
4. **Initial Overhead**: More setup before first feature works

### Neutral ℹ️

1. **Over-engineering**: Acknowledged and accepted for learning purposes
2. **Production Reality**: May not be needed for small HRIS, but demonstrates capability
3. **Interview Perception**: Must be able to explain "why microservices" and trade-offs

## Implementation Strategy

### Phase 1: Foundation (Weeks 1-2)

- Set up project structure (npm workspaces)
- Configure Docker Compose
- Build API Gateway
- Implement Auth Service (MVP)

### Phase 2: Core Services (Weeks 3-4)

- Employee Service
- Attendance Service
- Leave Service
- REST communication between services

### Phase 3: Event-Driven (Weeks 5-6)

- RabbitMQ integration
- Event publishers and subscribers
- Notification Service
- Async workflows

### Phase 4: Advanced (Weeks 7-8)

- Payroll Service
- Complex business logic
- Scheduled jobs
- Error handling & resilience

### Phase 5: Polish (Weeks 9-10)

- Documentation
- Testing
- Deployment
- Demo preparation

## Service Boundaries Justification

### Auth Service (Separate)

**Why**:

- Security concerns require isolation
- Used by ALL other services
- Different scaling needs
- Central to system integrity

### Employee Service (Separate)

**Why**:

- Core domain entity
- Referenced by multiple services
- Independent lifecycle
- Can be owned by HR team

### Attendance Service (Separate)

**Why**:

- High traffic (clock in/out)
- Different scaling pattern (peaks at work hours)
- Complex time calculations
- Can be owned by Operations team

### Leave Service (Separate)

**Why**:

- Distinct approval workflows
- Different business rules per company
- Integration with external calendars (future)
- Can be owned by HR team

### Payroll Service (Separate)

**Why**:

- Highly sensitive data (salaries)
- Complex calculations
- Different compliance requirements
- Resource-intensive (month-end processing)
- Can be owned by Finance team

### Notification Service (Separate)

**Why**:

- Used by ALL services
- Different scaling needs (spikes during events)
- External integrations (email providers)
- Can be replaced without affecting business logic

## Alternative Considered: Modular Monolith

### Structure Would Be:

```
src/
├── modules/
│   ├── auth/
│   ├── employee/
│   ├── attendance/
│   ├── leave/
│   ├── payroll/
│   └── notification/
```

### Why Rejected:

While technically simpler and potentially sufficient for the use case, it would NOT:

- Demonstrate microservices experience (key job requirement)
- Show distributed systems understanding
- Provide talking points for system design interviews
- Stand out in portfolio reviews

**Note**: This is explicitly acknowledged as "over-engineering for learning purposes" and will be documented as such.

## Success Criteria

This architectural decision will be considered successful if:

1. ✅ All services can run independently
2. ✅ Clear service boundaries with minimal coupling
3. ✅ Event-driven flows working correctly
4. ✅ Services can be deployed independently
5. ✅ Performance is acceptable (< 500ms for most requests)
6. ✅ Local development experience is smooth (Docker Compose)
7. ✅ Portfolio reviewers understand the architecture value
8. ✅ Can confidently explain trade-offs in interviews

## References

### Books

- "Building Microservices" by Sam Newman
- "Microservices Patterns" by Chris Richardson

### Resources

- NestJS Microservices Documentation
- Martin Fowler - Microservices Guide
- AWS Well-Architected Framework

### Similar Projects (Inspiration)

- Netflix architecture
- Uber's microservices
- Spotify's backend architecture

## Notes

**Important**: When presenting this project:

1. Always acknowledge it's over-engineered for a small HRIS
2. Explain it's for learning and demonstration
3. Be ready to discuss when you WOULDN'T use microservices
4. Explain the trade-offs clearly

**Key Talking Point for Interviews**:

> "I chose microservices not because it's the simplest solution, but because I wanted to deeply understand distributed systems architecture. In production, I would evaluate team size, scaling needs, and organizational structure before recommending this approach. For a startup HRIS, a modular monolith would likely be more appropriate."

---

**Date**: February 12, 2026
**Author**: Portfolio Project
**Reviewers**: Self-review
**Status**: Accepted ✅
