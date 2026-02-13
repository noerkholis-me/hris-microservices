# HRIS Microservices - Automated Setup Script (PowerShell)
# Run this script to automatically set up your project structure

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "HRIS Microservices - Automated Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js 20+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "✓ npm installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm not found." -ForegroundColor Red
    exit 1
}

# Check Docker
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker not found. Please install Docker Desktop" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Creating project structure..." -ForegroundColor Yellow

# Create directory structure
$directories = @(
    "apps/api-gateway",
    "apps/auth-service",
    "apps/employee-service",
    "apps/attendance-service",
    "apps/leave-service",
    "apps/payroll-service",
    "apps/notification-service",
    "apps/web",
    "packages/eslint-config",
    "packages/typescript-config",
    "packages/prettier-config",
    "packages/common/src/utils",
    "packages/common/src/constants",
    "packages/common/src/errors",
    "packages/contracts/src/dtos",
    "packages/contracts/src/interfaces",
    "packages/events/src",
    "infrastructure/docker",
    "infrastructure/scripts",
    "docs/architecture",
    "docs/adr",
    "docs/api",
    ".vscode"
)

foreach ($dir in $directories) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    Write-Host "✓ Created $dir" -ForegroundColor Green
}

Write-Host ""
Write-Host "Creating root package.json..." -ForegroundColor Yellow

# Create root package.json
$rootPackageJson = @'
{
  "name": "hris-microservices",
  "version": "1.0.0",
  "private": true,
  "description": "HRIS Microservices with Turborepo",
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "dev:backend": "turbo run dev --filter='./apps/*-service' --filter='./apps/api-gateway'",
    "dev:web": "turbo run dev --filter=web",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "lint:fix": "turbo run lint:fix",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "type-check": "turbo run type-check",
    "clean": "turbo run clean && rm -rf node_modules .turbo",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "prisma:generate": "turbo run prisma:generate",
    "prepare": "husky install"
  },
  "devDependencies": {
    "@hris/eslint-config": "*",
    "@hris/prettier-config": "*",
    "@hris/typescript-config": "*",
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0",
    "prettier": "^3.1.0",
    "turbo": "^1.11.2"
  },
  "prettier": "@hris/prettier-config",
  "packageManager": "npm@10.2.4",
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  }
}
'@

$rootPackageJson | Out-File -FilePath "package.json" -Encoding utf8
Write-Host "✓ Created package.json" -ForegroundColor Green

Write-Host ""
Write-Host "Creating turbo.json..." -ForegroundColor Yellow

# Create turbo.json
$turboJson = @'
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env", "tsconfig.json"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "lint:fix": {
      "cache": false
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "type-check": {
      "dependsOn": ["^build"]
    },
    "prisma:generate": {
      "cache": false
    },
    "clean": {
      "cache": false
    }
  }
}
'@

$turboJson | Out-File -FilePath "turbo.json" -Encoding utf8
Write-Host "✓ Created turbo.json" -ForegroundColor Green

Write-Host ""
Write-Host "Creating .gitignore..." -ForegroundColor Yellow

# Create .gitignore
$gitignore = @'
# Dependencies
node_modules/
npm-debug.log*

# Environment
.env
.env*.local

# Build
dist/
.next/
.turbo/
*.tsbuildinfo

# IDE
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log

# Coverage
coverage/

# Prisma
prisma/migrations/**/*.sql
'@

$gitignore | Out-File -FilePath ".gitignore" -Encoding utf8
Write-Host "✓ Created .gitignore" -ForegroundColor Green

Write-Host ""
Write-Host "Creating .env.example..." -ForegroundColor Yellow

# Create .env.example
$envExample = @'
# Database URLs
AUTH_DATABASE_URL=postgresql://hris:hris123@localhost:5432/auth_db
EMPLOYEE_DATABASE_URL=postgresql://hris:hris123@localhost:5432/employee_db
ATTENDANCE_DATABASE_URL=postgresql://hris:hris123@localhost:5432/attendance_db
LEAVE_DATABASE_URL=postgresql://hris:hris123@localhost:5432/leave_db
PAYROLL_DATABASE_URL=postgresql://hris:hris123@localhost:5432/payroll_db
NOTIFICATION_DATABASE_URL=postgresql://hris:hris123@localhost:5432/notification_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=hris
RABBITMQ_PASSWORD=hris123

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m

# Ports
API_GATEWAY_PORT=3000
AUTH_SERVICE_PORT=3001
EMPLOYEE_SERVICE_PORT=3002
'@

$envExample | Out-File -FilePath ".env.example" -Encoding utf8
Copy-Item ".env.example" -Destination ".env"
Write-Host "✓ Created .env.example and .env" -ForegroundColor Green

Write-Host ""
Write-Host "Creating VS Code settings..." -ForegroundColor Yellow

# Create VS Code settings
$vscodeSettings = @'
{
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"],
  "eslint.workingDirectories": [{ "mode": "auto" }],
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/dist/**": true,
    "**/.turbo/**": true
  }
}
'@

$vscodeSettings | Out-File -FilePath ".vscode/settings.json" -Encoding utf8

$vscodeExtensions = @'
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "ms-azuretools.vscode-docker"
  ]
}
'@

$vscodeExtensions | Out-File -FilePath ".vscode/extensions.json" -Encoding utf8
Write-Host "✓ Created VS Code configuration" -ForegroundColor Green

Write-Host ""
Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run 'npm run docker:up' to start infrastructure" -ForegroundColor White
Write-Host "2. Follow the setup guide to create services" -ForegroundColor White
Write-Host "3. Run 'npm run dev' to start development" -ForegroundColor White
Write-Host ""
