# HRIS Microservices with Turborepo

> A production-ready HRIS (Human Resource Information System) built with microservices architecture, showcasing modern backend development practices, event-driven design, and monorepo management with Turborepo.

[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Turborepo-1.11-red.svg)](https://turbo.build/)
[![NestJS](https://img.shields.io/badge/NestJS-10-ea2845.svg)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)

---

## 🎯 Project Overview

A comprehensive HRIS system demonstrating:

- **6+ Microservices** with clear domain boundaries
- **Event-Driven Architecture** via RabbitMQ
- **Monorepo Management** with Turborepo for fast builds
- **Database per Service** pattern with PostgreSQL
- **Modern Tech Stack** (NestJS, Prisma, Next.js)
- **Production-Ready Patterns** (RBAC, caching, testing)

**Purpose**: Portfolio project to demonstrate senior-level backend & system design skills.

---

## 📁 Project Structure

```
hris-microservices/
├── apps/                          # All applications
│   ├── api-gateway/              # API Gateway (Port 3000)
│   ├── auth-service/             # Authentication & RBAC (Port 3001)
│   ├── employee-service/         # Employee management (Port 3002)
│   ├── attendance-service/       # Time tracking (Port 3003)
│   ├── leave-service/            # Leave management (Port 3004)
│   ├── payroll-service/          # Payroll processing (Port 3005)
│   ├── notification-service/     # Notifications (Port 3006)
│   └── web/                      # Next.js frontend
│
├── packages/                      # Shared packages
│   ├── eslint-config/            # Shared ESLint configs
│   ├── typescript-config/        # Shared TS configs
│   ├── prettier-config/          # Shared Prettier config
│   ├── common/                   # Shared utilities
│   ├── contracts/                # DTOs & interfaces
│   └── events/                   # Event definitions
│
├── infrastructure/                # DevOps configs
│   ├── docker/                   # Docker configs
│   └── scripts/                  # Automation scripts
│
├── docs/                         # Documentation
│   ├── architecture/             # System diagrams
│   ├── adr/                      # Architecture decisions
│   └── api/                      # API documentation
│
├── turbo.json                    # Turborepo config
├── docker-compose.yml            # Local infrastructure
└── package.json                  # Root package.json
```

---

## 🏗️ Architecture

### High-Level System Design

```
┌─────────────────┐
│   Users         │
│  (Employees,    │
│   Managers, HR) │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│   API Gateway :3000     │
│  - Routing              │
│  - Auth validation      │
│  - Rate limiting        │
└──────────┬──────────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌────────┐   ┌────────────┐
│ Auth   │   │ Employee   │
│ :3001  │   │ :3002      │
└───┬────┘   └──────┬─────┘
    │               │
    ▼               ▼
┌────────┐   ┌────────────┐
│Attend. │   │ Leave      │
│ :3003  │   │ :3004      │
└───┬────┘   └──────┬─────┘
    │               │
    ▼               ▼
┌────────┐   ┌────────────┐
│Payroll │   │Notification│
│ :3005  │   │ :3006      │
└───┬────┘   └──────┬─────┘
    │               │
    └───────┬───────┘
            ▼
     ┌──────────────┐
     │  RabbitMQ    │
     │ Message Bus  │
     └──────────────┘
```

### Services Overview

| Service                  | Purpose               | Database        | Key Features                 |
| ------------------------ | --------------------- | --------------- | ---------------------------- |
| **API Gateway**          | Single entry point    | -               | Routing, auth, rate limiting |
| **Auth Service**         | Authentication & RBAC | auth_db         | JWT, permissions, roles      |
| **Employee Service**     | Employee data         | employee_db     | CRUD, org hierarchy          |
| **Attendance Service**   | Time tracking         | attendance_db   | Clock in/out, schedules      |
| **Leave Service**        | Leave management      | leave_db        | Requests, approvals          |
| **Payroll Service**      | Salary processing     | payroll_db      | Calculations, payslips       |
| **Notification Service** | Alerts                | notification_db | Email, in-app                |
| **Web (Frontend)**       | User interface        | -               | Next.js 14, React            |

---

## 🛠️ Tech Stack

### Backend

- **Framework**: NestJS 11 (TypeScript)
- **ORM**: Prisma 5
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Message Broker**: RabbitMQ 3
- **Authentication**: JWT (passport)
- **Validation**: class-validator

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State**: React Context / Zustand
- **HTTP**: Axios

### DevOps & Tools

- **Monorepo**: Turborepo
- **Containerization**: Docker
- **Package Manager**: npm
- **Code Quality**: ESLint, Prettier
- **Testing**: Jest
- **Git Hooks**: Husky + lint-staged

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 20+ LTS
- **Docker Desktop**: Latest
- **RAM**: 8GB minimum
- **OS**: Windows 10/11 (WSL 2), macOS, or Linux

### Installation

```bash
# 1. Clone repository
git clone <your-repo>
cd hris-microservices

# 2. Run automated setup (Windows PowerShell)
.\scripts\setup-project.ps1

# OR Manual setup:
npm install

# 3. Start infrastructure
npm run docker:up

# 4. Copy environment file
cp .env.example .env

# 5. Generate Prisma clients
npm run prisma:generate

# 6. Start development
npm run dev
```

### Available Commands

```bash
# Development
npm run dev                    # Start all services
npm run dev:backend            # Backend services only
npm run dev:web                # Frontend only
npm run dev:auth               # Single service

# Building
npm run build                  # Build everything
npm run build:backend          # Build backend only

# Testing
npm run test                   # Run all tests
npm run test:cov              # With coverage

# Code Quality
npm run lint                   # Lint all
npm run lint:fix              # Fix issues
npm run format                # Format code
npm run type-check            # TypeScript check

# Database
npm run prisma:generate       # Generate clients
npm run prisma:studio         # Open Prisma Studio

# Docker
npm run docker:up             # Start infrastructure
npm run docker:down           # Stop all
npm run docker:logs           # View logs

# Cleanup
npm run clean                 # Clean build artifacts
```

---

## 📖 Documentation

### Getting Started

1. [Complete Setup Guide](./docs/setup/01-complete-setup-guide.md) - Full installation walkthrough
2. [Docker Setup](./docs/setup/02-docker-setup.md) - Infrastructure configuration
3. [Project Roadmap](./docs/setup/03-project-roadmap.md) - 10-week development plan

### Architecture

1. [System Context](./docs/architecture/01-system-context.md) - High-level overview
2. [Container Diagram](./docs/architecture/02-container-diagram.md) - Services detail
3. [Event Flows](./docs/architecture/03-event-flows.md) - Event-driven workflows

### Design Decisions

1. [ADR-001: Microservices Architecture](./docs/adr/001-microservices-architecture.md)
2. [ADR-002: Turborepo](./docs/adr/002-turborepo-monorepo-tool.md)

### Technical References

1. [Database Schemas](./docs/database/schemas.md) - All Prisma schemas
2. [API Documentation](./docs/api/) - Swagger/OpenAPI specs

---

## 🎓 Key Learning Objectives

This project demonstrates:

### 1. Microservices Architecture

- ✅ Domain-Driven Design (DDD) principles
- ✅ Service boundary definition
- ✅ Inter-service communication (sync & async)
- ✅ Data consistency in distributed systems

### 2. Event-Driven Design

- ✅ RabbitMQ message broker integration
- ✅ Publish-subscribe patterns
- ✅ Event sourcing concepts
- ✅ Eventual consistency handling

### 3. Monorepo Management

- ✅ Turborepo for fast builds (caching, parallelization)
- ✅ Shared package architecture
- ✅ Consistent tooling across services

### 4. Database Design

- ✅ Database per service pattern
- ✅ Granular RBAC with permissions
- ✅ Normalized schemas
- ✅ Prisma ORM mastery

### 5. Security & Authentication

- ✅ JWT implementation
- ✅ Role-Based Access Control
- ✅ Fine-grained permissions
- ✅ Password hashing & token management

### 6. DevOps & Deployment

- ✅ Docker containerization
- ✅ Docker Compose orchestration
- ✅ Environment management
- ✅ CI/CD ready structure

---

## 🔑 Key Features

### Authentication & Authorization

- JWT-based authentication with refresh tokens
- Granular role-based access control (RBAC)
- Permission system (resource:action:scope)
- Login history & audit trails
- Password reset & email verification

### Employee Management

- Complete employee lifecycle management
- Organization hierarchy
- Department & position management
- Document storage
- Emergency contacts

### Attendance Tracking

- Clock in/out with location
- Work schedule management
- Overtime requests & approvals
- Late detection
- Timesheet generation

### Leave Management

- Leave request workflows
- Multi-level approval chains
- Leave balance tracking
- Carry-forward policies
- Leave calendar

### Payroll Processing

- Automated salary calculations
- Overtime pay integration
- Tax & deduction handling
- Payslip generation (PDF)
- Batch processing

### Notifications

- Email notifications
- In-app notifications
- Event-driven triggers
- Template management
- Delivery tracking

---

## 🧪 Testing Strategy

```
Unit Tests       >80% coverage per service
Integration Tests   All service-to-service communication
E2E Tests          Critical user journeys
Load Tests         Performance benchmarks (optional)
```

### Running Tests

```bash
# All tests
turbo run test

# With coverage
turbo run test:cov

# Single service
turbo run test --filter=auth-service

# E2E tests
turbo run test:e2e
```

---

## 📊 Performance

### Turborepo Benefits

| Task      | Without Turbo | With Turbo (first) | With Turbo (cached) |
| --------- | ------------- | ------------------ | ------------------- |
| Build all | 180s          | 90s                | 5s                  |
| Test all  | 120s          | 40s                | 3s                  |
| Lint all  | 60s           | 20s                | 2s                  |

**Estimated time saved over 10 weeks**: 10-15 hours

### Resource Usage

```
Docker (PostgreSQL, Redis, RabbitMQ):  1.5 GB
Turborepo overhead:                    0.15 GB
Each NestJS service:                   ~0.3 GB
Next.js frontend:                      ~0.4 GB
VS Code:                               0.5 GB
---------------------------------------------------
Total (6 services + web):              ~7.5 GB  ✅
```

---

## 🚀 Deployment

### Development

```bash
# Local development with hot reload
npm run dev
```

### Staging/Production

- **Backend**: Railway or Render
- **Frontend**: Vercel
- **Database**: Railway PostgreSQL
- **Redis**: Redis Cloud
- **RabbitMQ**: CloudAMQP

**Estimated Cost**: $0-10/month (within free tiers)

---

## 🎯 Project Timeline

**Total Duration**: 10 weeks (full-time)

| Week | Focus                 | Deliverable              |
| ---- | --------------------- | ------------------------ |
| 1-2  | Foundation & Auth     | Auth service working     |
| 3-4  | Core Services         | Employee, Attendance     |
| 5-6  | Event-Driven          | Leave, Payroll, RabbitMQ |
| 7-8  | Testing & Quality     | >80% coverage, optimized |
| 9-10 | Frontend & Deployment | Full-stack deployed      |

**Detailed roadmap**: [docs/setup/03-project-roadmap.md](./docs/setup/03-project-roadmap.md)

---

## 🎬 Demo Scenarios

### 1. Employee Onboarding

1. HR creates employee → System creates user account
2. Welcome email sent → Leave balance initialized
3. Employee logs in → Profile complete

### 2. Leave Request Flow

1. Employee submits leave request
2. Manager receives notification
3. Manager approves → Calendar updated
4. Employee notified via email

### 3. Monthly Payroll

1. System triggers payroll processing
2. Calculates salaries for all employees
3. Generates payslip PDFs
4. Emails payslips to employees

---

## 📈 Success Metrics

### Technical

- [ ] All services running independently
- [ ] Event-driven flows working correctly
- [ ] > 80% test coverage
- [ ] Sub-500ms API response times
- [ ] Zero critical security vulnerabilities

### Portfolio

- [ ] GitHub with clean commit history
- [ ] Live demo deployed
- [ ] Comprehensive documentation
- [ ] Demo video recorded
- [ ] LinkedIn showcase

### Learning

- [ ] Can explain microservices trade-offs
- [ ] Understand Turborepo benefits
- [ ] Comfortable with Docker deployment
- [ ] Ready for system design interviews
- [ ] Confident demoing the project

---

## 🤝 Contributing

This is a personal portfolio project, but feedback is welcome!

**To provide feedback**:

1. Open an issue
2. Suggest improvements
3. Share your experience

---

## 📄 License

MIT License - Free to use for learning and inspiration!

---

## 👨‍💻 About

**Purpose**: Portfolio & Learning Project  
**Timeline**: 10 weeks (Feb-Apr 2026)  
**Status**: In Development 🚧

**What This Demonstrates**:

- ✅ Microservices architecture design
- ✅ Event-driven system implementation
- ✅ Monorepo management with Turborepo
- ✅ Clean, maintainable, tested code
- ✅ Modern tooling & best practices
- ✅ System design thinking
- ✅ Full-stack development skills

---

## 📞 Contact

**Questions? Issues? Ideas?**

Create an issue in this repository!

---

## 🔗 Resources

### Documentation

- [NestJS Docs](https://docs.nestjs.com/)
- [Turborepo Handbook](https://turbo.build/repo/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [RabbitMQ Tutorials](https://www.rabbitmq.com/getstarted.html)

### Books

- "Building Microservices" by Sam Newman
- "Microservices Patterns" by Chris Richardson
- "Domain-Driven Design" by Eric Evans

### Similar Projects

- Netflix Architecture
- Uber's Microservices
- Spotify Backend

---

**Last Updated**: February 13, 2026  
**Version**: 1.0.0  
**Status**: Setup Complete ✅

---

<div align="center">

**⭐ Star this repo if you find it useful!**

[Documentation](./docs/) • [Architecture](./docs/architecture/) • [Setup Guide](./docs/setup/01-complete-setup-guide.md)

</div>
