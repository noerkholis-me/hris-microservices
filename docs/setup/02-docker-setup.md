# Docker Compose Configuration for HRIS Microservices

## docker-compose.yml

This file should be placed in the root of your project.

```yaml
version: '3.8'

services:
  # PostgreSQL - Single instance with multiple databases
  postgres:
    image: postgres:15-alpine
    container_name: hris-postgres
    environment:
      POSTGRES_USER: hris
      POSTGRES_PASSWORD: hris123
      POSTGRES_DB: hris
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./infrastructure/docker/init-databases.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - hris-network
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U hris"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis - Caching and sessions
  redis:
    image: redis:7-alpine
    container_name: hris-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - hris-network
    deploy:
      resources:
        limits:
          memory: 256M
        reservations:
          memory: 128M
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # RabbitMQ - Message broker
  rabbitmq:
    image: rabbitmq:3-management-alpine
    container_name: hris-rabbitmq
    environment:
      RABBITMQ_DEFAULT_USER: hris
      RABBITMQ_DEFAULT_PASS: hris123
    ports:
      - "5672:5672"   # AMQP port
      - "15672:15672" # Management UI
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    networks:
      - hris-network
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Optional: Run services in containers (for production-like testing)
  # Uncomment when you want to test containerized services
  
  # api-gateway:
  #   build:
  #     context: .
  #     dockerfile: apps/api-gateway/Dockerfile
  #   container_name: hris-gateway
  #   ports:
  #     - "3000:3000"
  #   environment:
  #     - NODE_ENV=development
  #     - REDIS_HOST=redis
  #     - REDIS_PORT=6379
  #   depends_on:
  #     - redis
  #   networks:
  #     - hris-network
  #   deploy:
  #     resources:
  #       limits:
  #         memory: 256M
  
  # auth-service:
  #   build:
  #     context: .
  #     dockerfile: apps/auth-service/Dockerfile
  #   container_name: hris-auth
  #   ports:
  #     - "3001:3001"
  #   environment:
  #     - NODE_ENV=development
  #     - DATABASE_URL=postgresql://hris:hris123@postgres:5432/auth_db
  #     - REDIS_HOST=redis
  #     - RABBITMQ_HOST=rabbitmq
  #   depends_on:
  #     - postgres
  #     - redis
  #     - rabbitmq
  #   networks:
  #     - hris-network
  #   deploy:
  #     resources:
  #       limits:
  #         memory: 256M

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:

networks:
  hris-network:
    driver: bridge
```

---

## infrastructure/docker/init-databases.sql

Create this file to initialize all databases:

```sql
-- Create databases for each service
CREATE DATABASE auth_db;
CREATE DATABASE employee_db;
CREATE DATABASE attendance_db;
CREATE DATABASE leave_db;
CREATE DATABASE payroll_db;
CREATE DATABASE notification_db;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE auth_db TO hris;
GRANT ALL PRIVILEGES ON DATABASE employee_db TO hris;
GRANT ALL PRIVILEGES ON DATABASE attendance_db TO hris;
GRANT ALL PRIVILEGES ON DATABASE leave_db TO hris;
GRANT ALL PRIVILEGES ON DATABASE payroll_db TO hris;
GRANT ALL PRIVILEGES ON DATABASE notification_db TO hris;

-- Connect to each database and grant schema privileges
\c auth_db
GRANT ALL ON SCHEMA public TO hris;

\c employee_db
GRANT ALL ON SCHEMA public TO hris;

\c attendance_db
GRANT ALL ON SCHEMA public TO hris;

\c leave_db
GRANT ALL ON SCHEMA public TO hris;

\c payroll_db
GRANT ALL ON SCHEMA public TO hris;

\c notification_db
GRANT ALL ON SCHEMA public TO hris;
```

---

## Example Dockerfile (for apps/auth-service/Dockerfile)

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY turbo.json ./

# Copy workspace configurations
COPY packages ./packages
COPY apps/auth-service ./apps/auth-service

# Install dependencies
RUN npm ci

# Build the service and its dependencies
RUN npx turbo run build --filter=auth-service...

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

# Copy built artifacts
COPY --from=builder /app/apps/auth-service/dist ./dist
COPY --from=builder /app/apps/auth-service/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Prisma
COPY --from=builder /app/apps/auth-service/prisma ./prisma

# Install only production dependencies
RUN npm ci --only=production

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 3001

CMD ["node", "dist/main.js"]
```

---

## Usage

### Development (Run services natively, infrastructure in Docker)

```powershell
# Start infrastructure only (recommended)
npm run docker:up

# Run services natively for hot reload
npm run dev

# Or run specific services
npm run dev:auth
npm run dev:employee
```

**Memory usage**: ~1.5GB (leaves 6.5GB for native services)

---

### Production-like Testing (All in Docker)

1. Uncomment service definitions in docker-compose.yml
2. Create Dockerfiles for each service
3. Run:

```powershell
docker-compose up --build
```

---

### Useful Commands

```powershell
# Start infrastructure
npm run docker:up

# Stop all
npm run docker:down

# View logs
npm run docker:logs

# Restart a service
docker-compose restart postgres

# Enter PostgreSQL
docker exec -it hris-postgres psql -U hris -d auth_db

# Enter Redis
docker exec -it hris-redis redis-cli

# Check service health
docker ps
```

---

### Port Mapping

| Service | Port | Access |
|---------|------|--------|
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |
| RabbitMQ AMQP | 5672 | localhost:5672 |
| RabbitMQ Management | 15672 | http://localhost:15672 |
| API Gateway | 3000 | http://localhost:3000 |
| Auth Service | 3001 | http://localhost:3001 |
| Employee Service | 3002 | http://localhost:3002 |
| Attendance Service | 3003 | http://localhost:3003 |
| Leave Service | 3004 | http://localhost:3004 |
| Payroll Service | 3005 | http://localhost:3005 |
| Notification Service | 3006 | http://localhost:3006 |
| Next.js Web | 3001 | http://localhost:3001 |

---

### Troubleshooting

#### Port Already in Use
```powershell
# Find process using port
netstat -ano | findstr :5432

# Kill process
taskkill /PID <PID> /F
```

#### Docker Out of Memory
```powershell
# Stop containers
npm run docker:down

# Clean up
docker system prune -a

# Restart Docker Desktop
```

#### Database Connection Issues
```powershell
# Check if PostgreSQL is running
docker ps | findstr postgres

# View logs
docker logs hris-postgres

# Restart
docker-compose restart postgres
```

---

## Health Check Script

Create `infrastructure/scripts/health-check.ps1`:

```powershell
Write-Host "Checking infrastructure health..." -ForegroundColor Cyan

# Check PostgreSQL
try {
    docker exec hris-postgres pg_isready -U hris
    Write-Host "✓ PostgreSQL is healthy" -ForegroundColor Green
} catch {
    Write-Host "✗ PostgreSQL is not responding" -ForegroundColor Red
}

# Check Redis
try {
    docker exec hris-redis redis-cli ping
    Write-Host "✓ Redis is healthy" -ForegroundColor Green
} catch {
    Write-Host "✗ Redis is not responding" -ForegroundColor Red
}

# Check RabbitMQ
try {
    $response = Invoke-WebRequest -Uri "http://localhost:15672" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ RabbitMQ is healthy" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ RabbitMQ is not responding" -ForegroundColor Red
}
```

Run it:
```powershell
.\infrastructure\scripts\health-check.ps1
```

---

**Related**: [Complete Setup Guide](../setup/01-complete-setup-guide.md)
