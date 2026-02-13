# Week 1 Implementation Checklist

## Overview
Week 1 focuses on setting up the foundation: project structure, Docker infrastructure, and the Auth Service MVP.

**Goal:** By end of Week 1, you should have:
- ✅ Complete project structure
- ✅ Docker infrastructure running (PostgreSQL, Redis, RabbitMQ)
- ✅ Auth Service with JWT authentication working
- ✅ API Gateway basic routing
- ✅ First end-to-end authentication flow

---

## Day 1: Project Setup & Infrastructure

### Morning: Project Structure

- [ ] **1.1 Create Project Directory**
  ```powershell
  mkdir hris-microservices
  cd hris-microservices
  git init
  ```

- [ ] **1.2 Initialize npm Workspace**
  ```powershell
  npm init -y
  ```
  - [ ] Configure workspaces in package.json
  - [ ] Add root-level scripts
  - [ ] Install concurrently for running multiple services

- [ ] **1.3 Create Folder Structure**
  ```powershell
  mkdir services, packages, docs, infrastructure, apps
  mkdir docs\architecture, docs\architecture\diagrams, docs\architecture\adr
  mkdir infrastructure\docker, infrastructure\scripts
  mkdir packages\common, packages\contracts, packages\events
  ```

- [ ] **1.4 Setup Git**
  - [ ] Create .gitignore
  - [ ] Create .env.example
  - [ ] Initial commit

### Afternoon: Docker Infrastructure

- [ ] **1.5 Create docker-compose.yml**
  - [ ] PostgreSQL service (512MB limit)
  - [ ] Redis service (256MB limit)
  - [ ] RabbitMQ service (512MB limit)
  - [ ] Health checks for all services
  - [ ] Proper volume configuration

- [ ] **1.6 Create Database Init Script**
  - [ ] `infrastructure/docker/init-databases.sql`
  - [ ] Create all 6 databases (auth_db, employee_db, etc.)
  - [ ] Grant privileges

- [ ] **1.7 Start Infrastructure**
  ```powershell
  docker-compose up -d
  docker-compose ps  # Verify all running
  ```

- [ ] **1.8 Verify Services**
  - [ ] PostgreSQL: Connect via psql or GUI client
  - [ ] Redis: `docker exec -it hris-redis redis-cli ping`
  - [ ] RabbitMQ: Visit http://localhost:15672

### Evening: Documentation

- [ ] **1.9 Copy Documentation Files**
  - [ ] Copy all architecture diagrams to /docs/architecture/diagrams/
  - [ ] Copy ADRs to /docs/architecture/adr/
  - [ ] Copy SETUP-GUIDE-WINDOWS.md to /docs/
  - [ ] Copy README.md to project root

- [ ] **1.10 Review & Customize**
  - [ ] Update README with your name and links
  - [ ] Read through architecture documents
  - [ ] Understand event flows

---

## Day 2: Auth Service Foundation

### Morning: NestJS Setup

- [ ] **2.1 Install NestJS CLI Globally**
  ```powershell
  npm install -g @nestjs/cli
  ```

- [ ] **2.2 Create Auth Service**
  ```powershell
  cd services
  nest new auth-service
  ```
  - [ ] Choose npm as package manager
  - [ ] Wait for installation to complete

- [ ] **2.3 Install Dependencies**
  ```powershell
  cd auth-service
  
  # Prisma
  npm install @prisma/client
  npm install -D prisma
  
  # NestJS packages
  npm install @nestjs/config @nestjs/jwt @nestjs/passport
  npm install passport passport-jwt bcrypt
  npm install -D @types/passport-jwt @types/bcrypt
  
  # RabbitMQ
  npm install @nestjs/microservices amqplib amqp-connection-manager
  npm install -D @types/amqplib
  
  # Validation
  npm install class-validator class-transformer
  
  # Swagger
  npm install @nestjs/swagger
  ```

### Afternoon: Prisma Setup

- [ ] **2.4 Initialize Prisma**
  ```powershell
  npx prisma init
  ```

- [ ] **2.5 Configure Prisma Schema**
  - [ ] Open `prisma/schema.prisma`
  - [ ] Copy the granular auth schema we designed
  - [ ] Includes: User, Role, Permission, UserRole, RolePermission, RefreshToken, LoginHistory, etc.

- [ ] **2.6 Create .env File**
  ```env
  DATABASE_URL="postgresql://hris:hris123@localhost:5432/auth_db"
  JWT_SECRET=your-super-secret-jwt-key-change-in-production
  JWT_EXPIRATION=15m
  REFRESH_TOKEN_EXPIRATION=7d
  PORT=3001
  RABBITMQ_URL=amqp://hris:hris123@localhost:5672
  REDIS_HOST=localhost
  REDIS_PORT=6379
  ```

- [ ] **2.7 Run First Migration**
  ```powershell
  npx prisma migrate dev --name init
  ```
  - [ ] Verify tables created in PostgreSQL
  - [ ] Check Prisma Client generated

### Evening: Seed Data

- [ ] **2.8 Create Seed File**
  - [ ] Create `prisma/seed.ts`
  - [ ] Add seed logic for:
    - [ ] Super admin user
    - [ ] Default roles (super_admin, hr_admin, manager, employee)
    - [ ] Default permissions
    - [ ] Role-permission mappings

- [ ] **2.9 Configure Seed in package.json**
  ```json
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
  ```

- [ ] **2.10 Install ts-node and Run Seed**
  ```powershell
  npm install -D ts-node
  npx prisma db seed
  ```

- [ ] **2.11 Verify Seed Data**
  ```powershell
  npx prisma studio
  ```
  - [ ] Check Users table
  - [ ] Check Roles table
  - [ ] Check Permissions table

---

## Day 3: Auth Module Implementation

### Morning: Auth Module Structure

- [ ] **3.1 Generate Auth Module**
  ```powershell
  nest g module auth
  nest g service auth
  nest g controller auth
  ```

- [ ] **3.2 Create DTOs**
  - [ ] `src/auth/dto/login.dto.ts`
    ```typescript
    export class LoginDto {
      @IsEmail()
      email: string;
      
      @IsString()
      @MinLength(8)
      password: string;
    }
    ```
  
  - [ ] `src/auth/dto/register.dto.ts`
  - [ ] `src/auth/dto/refresh-token.dto.ts`
  - [ ] `src/auth/dto/auth-response.dto.ts`

- [ ] **3.3 Create Interfaces**
  - [ ] `src/auth/interfaces/jwt-payload.interface.ts`
  - [ ] `src/auth/interfaces/tokens.interface.ts`

### Afternoon: JWT Strategy

- [ ] **3.4 Create JWT Strategy**
  - [ ] `src/auth/strategies/jwt.strategy.ts`
  - [ ] Implement validate method
  - [ ] Extract user from payload
  - [ ] Check if user is active

- [ ] **3.5 Create JWT Auth Guard**
  - [ ] `src/auth/guards/jwt-auth.guard.ts`
  - [ ] Extend AuthGuard('jwt')

- [ ] **3.6 Configure JWT Module**
  - [ ] Update `auth.module.ts`
  - [ ] Register JwtModule with config
  - [ ] Register PassportModule
  - [ ] Register JwtStrategy

### Evening: Auth Service Implementation

- [ ] **3.7 Implement AuthService Methods**
  
  **Login Method:**
  ```typescript
  async login(loginDto: LoginDto) {
    // 1. Find user by email
    // 2. Verify password
    // 3. Generate access token
    // 4. Generate refresh token
    // 5. Save refresh token to DB
    // 6. Log login to login_history
    // 7. Return tokens + user info
  }
  ```
  - [ ] Implement user lookup
  - [ ] Implement password verification (bcrypt.compare)
  - [ ] Implement token generation
  - [ ] Implement login history logging

  **Refresh Token Method:**
  ```typescript
  async refreshToken(refreshToken: string) {
    // 1. Verify refresh token from DB
    // 2. Check if revoked
    // 3. Check expiration
    // 4. Generate new access token
    // 5. Optionally rotate refresh token
    // 6. Return new tokens
  }
  ```

  **Logout Method:**
  ```typescript
  async logout(userId: string, refreshToken: string) {
    // 1. Revoke refresh token
    // 2. Log logout to login_history
    // 3. Add access token to Redis blacklist (optional)
  }
  ```

- [ ] **3.8 Test Auth Service**
  - [ ] Write unit tests for each method
  - [ ] Mock Prisma client
  - [ ] Test success and error cases

---

## Day 4: Auth Controller & Guards

### Morning: Auth Controller

- [ ] **4.1 Implement Auth Controller**
  
  **Login Endpoint:**
  ```typescript
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
  ```

  **Refresh Endpoint:**
  ```typescript
  @Post('refresh')
  async refresh(@Body() refreshDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshDto.refreshToken);
  }
  ```

  **Logout Endpoint:**
  ```typescript
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@User() user, @Body() body) {
    return this.authService.logout(user.id, body.refreshToken);
  }
  ```

  **Get Profile:**
  ```typescript
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@User() user) {
    return this.authService.getProfile(user.id);
  }
  ```

- [ ] **4.2 Add Swagger Documentation**
  - [ ] Add @ApiTags('auth')
  - [ ] Add @ApiOperation() to each endpoint
  - [ ] Add @ApiResponse() decorators
  - [ ] Add @ApiBearerAuth() for protected routes

### Afternoon: Role & Permission Guards

- [ ] **4.3 Create Roles Guard**
  - [ ] `src/auth/guards/roles.guard.ts`
  - [ ] Check user roles from JWT payload
  - [ ] Compare with required roles

- [ ] **4.4 Create Permissions Guard**
  - [ ] `src/auth/guards/permissions.guard.ts`
  - [ ] Check user permissions
  - [ ] Implement resource:action:scope logic

- [ ] **4.5 Create Decorators**
  - [ ] `@Roles(...roles)` decorator
  - [ ] `@Permissions(...permissions)` decorator
  - [ ] `@User()` decorator (extract user from request)

- [ ] **4.6 Test Guards**
  ```typescript
  @Get('admin-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'hr_admin')
  async adminOnly() {
    return { message: 'Admin access granted' };
  }
  ```

### Evening: Configuration Module

- [ ] **4.7 Setup Config Module**
  - [ ] Generate: `nest g module config`
  - [ ] Create config service
  - [ ] Load environment variables
  - [ ] Validate env vars with Joi

- [ ] **4.8 Create Configuration Files**
  - [ ] `src/config/jwt.config.ts`
  - [ ] `src/config/database.config.ts`
  - [ ] `src/config/redis.config.ts`
  - [ ] `src/config/rabbitmq.config.ts`

- [ ] **4.9 Update Main.ts**
  - [ ] Add global validation pipe
  - [ ] Configure Swagger
  - [ ] Set global prefix (/api)
  - [ ] Add CORS configuration

---

## Day 5: API Gateway Setup

### Morning: Gateway Creation

- [ ] **5.1 Create API Gateway Service**
  ```powershell
  cd services
  nest new api-gateway
  ```

- [ ] **5.2 Install Dependencies**
  ```powershell
  cd api-gateway
  npm install @nestjs/config @nestjs/axios
  npm install @nestjs/microservices
  npm install axios
  ```

- [ ] **5.3 Create Proxy Module**
  - [ ] Generate module: `nest g module proxy`
  - [ ] Generate service: `nest g service proxy`
  - [ ] Generate controller: `nest g controller proxy`

### Afternoon: Gateway Implementation

- [ ] **5.4 Configure Service URLs**
  - [ ] Create .env file
  ```env
  AUTH_SERVICE_URL=http://localhost:3001
  EMPLOYEE_SERVICE_URL=http://localhost:3002
  ATTENDANCE_SERVICE_URL=http://localhost:3003
  LEAVE_SERVICE_URL=http://localhost:3004
  PAYROLL_SERVICE_URL=http://localhost:3005
  NOTIFICATION_SERVICE_URL=http://localhost:3006
  PORT=3000
  ```

- [ ] **5.5 Implement Proxy Controller**
  ```typescript
  @Controller('api')
  export class ProxyController {
    @Post('auth/*')
    async proxyToAuth(@Req() req, @Res() res) {
      // Forward to auth service
    }
    
    @All('employees/*')
    @UseGuards(JwtAuthGuard)
    async proxyToEmployee(@Req() req, @Res() res) {
      // Forward to employee service
    }
  }
  ```

- [ ] **5.6 Add JWT Validation in Gateway**
  - [ ] Copy JWT strategy from auth service
  - [ ] Validate tokens before forwarding
  - [ ] Add user info to forwarded request headers

### Evening: Testing Gateway

- [ ] **5.7 Test Gateway Routing**
  ```bash
  # Start Auth Service
  cd services/auth-service
  npm run start:dev
  
  # Start API Gateway (new terminal)
  cd services/api-gateway
  npm run start:dev
  ```

- [ ] **5.8 Test with cURL/Postman**
  ```bash
  # Login via gateway
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@hris.com","password":"Admin@123"}'
  
  # Get profile (with token)
  curl http://localhost:3000/api/auth/profile \
    -H "Authorization: Bearer YOUR_TOKEN"
  ```

- [ ] **5.9 Document Gateway Endpoints**
  - [ ] Add Swagger to gateway
  - [ ] Document all routes
  - [ ] Create Postman collection

---

## Day 6: Integration & Polish

### Morning: Integration Testing

- [ ] **6.1 Create Integration Tests**
  - [ ] Test auth flow end-to-end
  - [ ] Test token refresh
  - [ ] Test logout
  - [ ] Test protected routes

- [ ] **6.2 Test RabbitMQ Integration**
  - [ ] Setup RabbitMQ module in auth service
  - [ ] Publish test event on login
  - [ ] Create test consumer
  - [ ] Verify event flow

### Afternoon: Error Handling

- [ ] **6.3 Global Exception Filter**
  - [ ] Create exception filter
  - [ ] Handle Prisma errors
  - [ ] Handle validation errors
  - [ ] Return consistent error format

- [ ] **6.4 Logging**
  - [ ] Install Winston
  - [ ] Configure logging
  - [ ] Add request logging
  - [ ] Add error logging

### Evening: Documentation

- [ ] **6.5 Update README**
  - [ ] Add setup instructions
  - [ ] Add API endpoints
  - [ ] Add example requests/responses

- [ ] **6.6 Create Postman Collection**
  - [ ] Login request
  - [ ] Refresh token request
  - [ ] Logout request
  - [ ] Get profile request
  - [ ] Export collection

- [ ] **6.7 Record Progress**
  - [ ] Take screenshots
  - [ ] Document challenges faced
  - [ ] Update project status in README

---

## Day 7: Review & Planning

### Morning: Code Review

- [ ] **7.1 Self Code Review**
  - [ ] Check code quality
  - [ ] Remove unused imports
  - [ ] Add missing comments
  - [ ] Ensure consistent formatting

- [ ] **7.2 Run Linters**
  ```powershell
  npm run lint
  npm run format
  ```

- [ ] **7.3 Run All Tests**
  ```powershell
  npm run test
  npm run test:e2e
  ```

### Afternoon: Performance Check

- [ ] **7.4 Test Docker Resource Usage**
  - [ ] Check Docker Desktop resource usage
  - [ ] Verify no memory issues
  - [ ] Test with all services running

- [ ] **7.5 Optimize if Needed**
  - [ ] Adjust memory limits
  - [ ] Add Redis caching where needed
  - [ ] Optimize database queries

### Evening: Week 2 Planning

- [ ] **7.6 Review Week 1 Achievements**
  - [ ] List completed features
  - [ ] List blockers encountered
  - [ ] Document lessons learned

- [ ] **7.7 Plan Week 2**
  - [ ] Review Week 2 checklist (Employee Service)
  - [ ] Identify dependencies
  - [ ] Set daily goals

- [ ] **7.8 Git Housekeeping**
  - [ ] Commit all changes
  - [ ] Create meaningful commit messages
  - [ ] Push to GitHub
  - [ ] Create Week 1 tag

---

## Success Criteria

By end of Week 1, you should be able to:

✅ **Infrastructure**
- [ ] All Docker containers running (PostgreSQL, Redis, RabbitMQ)
- [ ] All 6 databases created and accessible
- [ ] RabbitMQ management UI accessible

✅ **Auth Service**
- [ ] User can login and receive JWT token
- [ ] Token can be refreshed
- [ ] User can logout (token revoked)
- [ ] Protected routes require valid JWT
- [ ] Roles and permissions system working
- [ ] Login history tracked

✅ **API Gateway**
- [ ] Forwards requests to auth service
- [ ] Validates JWT before forwarding
- [ ] Swagger documentation accessible

✅ **Documentation**
- [ ] Architecture diagrams in place
- [ ] ADRs documented
- [ ] Setup guide complete
- [ ] README up to date

✅ **Testing**
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Manual tests documented (Postman)

✅ **Code Quality**
- [ ] ESLint passing
- [ ] Prettier formatting applied
- [ ] No console errors
- [ ] Clean commit history

---

## Common Issues & Solutions

### Issue 1: Docker Containers Won't Start
**Solution:**
```powershell
docker-compose down -v
docker-compose up -d --build
```

### Issue 2: Prisma Migration Failed
**Solution:**
```powershell
npx prisma migrate reset
npx prisma migrate dev
```

### Issue 3: Port Already in Use
**Solution:**
```powershell
# Find process using port
netstat -ano | findstr :3001
# Kill process
taskkill /PID <PID> /F
```

### Issue 4: JWT Secret Not Found
**Solution:**
- Check .env file exists in service directory
- Verify environment variables loaded in main.ts
- Check ConfigModule is imported

### Issue 5: Cannot Connect to Database
**Solution:**
```powershell
# Check PostgreSQL running
docker-compose ps postgres
# Test connection
docker exec -it hris-postgres psql -U hris -d auth_db
```

---

## Next Week Preview

**Week 2: Employee Service**
- Employee CRUD operations
- Department management
- Position management
- Document upload (file storage)
- Event-driven employee creation flow
- Integration with Auth Service

Get ready! Week 2 will build on everything we learned this week. 🚀

---

## Daily Standup Questions

Answer these each day to track progress:

1. **What did I complete today?**
2. **What blockers did I encounter?**
3. **What will I work on tomorrow?**
4. **Do I need help with anything?**

Keep notes in a `DAILY-LOG.md` file!

---

**Good luck with Week 1! You've got this! 💪**
