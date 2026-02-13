# HRIS Microservices - Complete Setup Guide with Turborepo

## Overview
This guide sets up your entire HRIS microservices project with Turborepo using the modern `apps/` directory structure for all applications (both backend services and frontend).

---

## Project Structure

```
hris-microservices/
├── apps/                           # All applications
│   ├── api-gateway/               # API Gateway
│   ├── auth-service/              # Auth microservice
│   ├── employee-service/          # Employee microservice
│   ├── attendance-service/        # Attendance microservice
│   ├── leave-service/             # Leave microservice
│   ├── payroll-service/           # Payroll microservice
│   ├── notification-service/      # Notification microservice
│   └── web/                       # Next.js frontend
│
├── packages/                       # Shared packages
│   ├── eslint-config/             # Shared ESLint configs
│   ├── typescript-config/         # Shared TypeScript configs
│   ├── prettier-config/           # Shared Prettier config
│   ├── common/                    # Shared utilities
│   ├── contracts/                 # Shared DTOs/interfaces
│   └── events/                    # Event definitions
│
├── infrastructure/                 # Infrastructure configs
│   ├── docker/
│   └── scripts/
│
├── docs/                          # Documentation
├── turbo.json                     # Turborepo config
├── package.json                   # Root package.json
├── .gitignore
└── docker-compose.yml
```

---

## Prerequisites

### Required Software
- **Node.js**: v20.x LTS
- **npm**: v10.x (comes with Node.js)
- **Docker Desktop**: Latest version
- **Git**: Latest version
- **VS Code**: Latest version (recommended)

### System Requirements
- **OS**: Windows 10/11 with WSL 2
- **RAM**: 8GB minimum
- **Storage**: 50GB free space
- **CPU**: 4+ cores recommended

---

## Part 1: Environment Setup

### Step 1: Install Prerequisites

#### 1.1 Install Node.js
```powershell
# Download from https://nodejs.org/
# Choose LTS version (v20.x)

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

#### 1.2 Install Docker Desktop
```powershell
# Download from https://www.docker.com/products/docker-desktop/

# Enable WSL 2
wsl --install

# Restart computer

# Configure Docker Desktop:
# Settings → Resources → Advanced
# - Memory: 4GB
# - CPUs: 3
# - Swap: 1GB
```

#### 1.3 Install Git
```powershell
# Download from https://git-scm.com/download/win

# Verify
git --version
```

#### 1.4 Install VS Code Extensions
```powershell
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension prisma.prisma
code --install-extension ms-azuretools.vscode-docker
code --install-extension firsttris.vscode-jest-runner
```

---

## Part 2: Project Initialization

### Step 2: Create Project Structure

```powershell
# Create project directory
mkdir C:\Projects\hris-microservices
cd C:\Projects\hris-microservices

# Initialize Git
git init

# Create directory structure
mkdir apps packages infrastructure docs
mkdir infrastructure\docker infrastructure\scripts
mkdir docs\architecture docs\adr docs\api
```

### Step 3: Initialize Root Package

Create `package.json`:
```json
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
    "dev:gateway": "turbo run dev --filter=api-gateway",
    "dev:auth": "turbo run dev --filter=auth-service",
    "dev:employee": "turbo run dev --filter=employee-service",
    "dev:attendance": "turbo run dev --filter=attendance-service",
    "dev:leave": "turbo run dev --filter=leave-service",
    "dev:payroll": "turbo run dev --filter=payroll-service",
    "dev:notification": "turbo run dev --filter=notification-service",
    
    "build": "turbo run build",
    "build:backend": "turbo run build --filter='./apps/*-service' --filter='./apps/api-gateway'",
    "build:web": "turbo run build --filter=web",
    
    "test": "turbo run test",
    "test:cov": "turbo run test:cov",
    "test:e2e": "turbo run test:e2e",
    
    "lint": "turbo run lint",
    "lint:fix": "turbo run lint:fix",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "type-check": "turbo run type-check",
    
    "clean": "turbo run clean && rm -rf node_modules .turbo",
    "clean:deps": "find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +",
    
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f",
    "docker:restart": "docker-compose restart",
    
    "prisma:generate": "turbo run prisma:generate",
    "prisma:studio": "turbo run prisma:studio --filter",
    "prisma:migrate": "turbo run prisma:migrate --filter",
    
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
```

---

## Part 3: Turborepo Configuration

### Step 4: Create `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env", "tsconfig.json"],
  "globalEnv": [
    "NODE_ENV",
    "DATABASE_URL",
    "REDIS_HOST",
    "RABBITMQ_HOST",
    "JWT_SECRET"
  ],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"],
      "env": ["NODE_ENV"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "start": {
      "dependsOn": ["build"]
    },
    "lint": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "lint:fix": {
      "cache": false,
      "outputs": []
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "inputs": ["src/**/*.ts", "test/**/*.ts"]
    },
    "test:cov": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "test:e2e": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "prisma:generate": {
      "cache": false,
      "outputs": ["node_modules/.prisma/**"]
    },
    "prisma:migrate": {
      "cache": false
    },
    "prisma:studio": {
      "cache": false
    },
    "clean": {
      "cache": false
    }
  }
}
```

---

## Part 4: Shared Configuration Packages

### Step 5: Create ESLint Config Package

```powershell
cd packages
mkdir eslint-config
cd eslint-config
```

#### Create `packages/eslint-config/package.json`
```json
{
  "name": "@hris/eslint-config",
  "version": "1.0.0",
  "private": true,
  "main": "index.js",
  "files": ["index.js", "nestjs.js", "nextjs.js"],
  "dependencies": {
    "@typescript-eslint/eslint-plugin": "^6.13.0",
    "@typescript-eslint/parser": "^6.13.0",
    "eslint": "^8.54.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.1",
    "eslint-plugin-import": "^2.29.0",
    "eslint-config-next": "^14.0.4"
  }
}
```

#### Create `packages/eslint-config/index.js`
```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: process.cwd(),
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', 'dist', 'node_modules', '.turbo'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
  },
};
```

#### Create `packages/eslint-config/nestjs.js`
```javascript
module.exports = {
  extends: ['./index.js'],
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-empty-function': [
      'error',
      { allow: ['constructors'] },
    ],
    '@typescript-eslint/no-parameter-properties': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        args: 'after-used',
        ignoreRestSiblings: true,
      },
    ],
  },
};
```

#### Create `packages/eslint-config/nextjs.js`
```javascript
module.exports = {
  extends: ['next/core-web-vitals', './index.js'],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    'react/jsx-key': 'error',
  },
};
```

---

### Step 6: Create TypeScript Config Package

```powershell
cd ..
mkdir typescript-config
cd typescript-config
```

#### Create `packages/typescript-config/package.json`
```json
{
  "name": "@hris/typescript-config",
  "version": "1.0.0",
  "private": true,
  "files": ["base.json", "nestjs.json", "nextjs.json"]
}
```

#### Create `packages/typescript-config/base.json`
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2021",
    "lib": ["ES2021"],
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "module": "commonjs",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "removeComments": true,
    "incremental": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": false,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "allowJs": false,
    "skipLibCheck": true
  },
  "exclude": ["node_modules", "dist", "test", "**/*spec.ts"]
}
```

#### Create `packages/typescript-config/nestjs.json`
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strictPropertyInitialization": false,
    "paths": {
      "@/*": ["src/*"],
      "@common/*": ["src/common/*"],
      "@config/*": ["src/config/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test", "**/*spec.ts", "**/*.e2e-spec.ts"]
}
```

#### Create `packages/typescript-config/nextjs.json`
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "target": "ES2021",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

### Step 7: Create Prettier Config Package

```powershell
cd ..
mkdir prettier-config
cd prettier-config
```

#### Create `packages/prettier-config/package.json`
```json
{
  "name": "@hris/prettier-config",
  "version": "1.0.0",
  "private": true,
  "main": "index.js",
  "dependencies": {
    "prettier": "^3.1.0"
  }
}
```

#### Create `packages/prettier-config/index.js`
```javascript
module.exports = {
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  arrowParens: 'always',
  endOfLine: 'lf',
  bracketSpacing: true,
  useTabs: false,
};
```

---

## Part 5: Create Example Service (Auth Service)

### Step 8: Initialize Auth Service

```powershell
cd ../../apps
mkdir auth-service
cd auth-service
```

#### Create `apps/auth-service/package.json`
```json
{
  "name": "auth-service",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "nest build",
    "dev": "nest start --watch",
    "start": "node dist/main",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,test}/**/*.ts\"",
    "lint:fix": "eslint \"{src,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf dist .turbo"
  },
  "dependencies": {
    "@hris/common": "*",
    "@hris/contracts": "*",
    "@hris/events": "*",
    "@nestjs/common": "^10.2.10",
    "@nestjs/core": "^10.2.10",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/platform-express": "^10.2.10",
    "@nestjs/microservices": "^10.2.10",
    "@nestjs/config": "^3.1.1",
    "@prisma/client": "^5.7.0",
    "bcrypt": "^5.1.1",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1"
  },
  "devDependencies": {
    "@hris/eslint-config": "*",
    "@hris/prettier-config": "*",
    "@hris/typescript-config": "*",
    "@nestjs/cli": "^10.2.1",
    "@nestjs/schematics": "^10.0.3",
    "@nestjs/testing": "^10.2.10",
    "@types/bcrypt": "^5.0.2",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.11",
    "@types/node": "^20.10.5",
    "@types/passport-jwt": "^3.0.13",
    "@types/passport-local": "^1.0.38",
    "jest": "^29.7.0",
    "prisma": "^5.7.0",
    "ts-jest": "^29.1.1",
    "ts-loader": "^9.5.1",
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.3.3"
  }
}
```

#### Create `apps/auth-service/.eslintrc.js`
```javascript
module.exports = {
  extends: ['@hris/eslint-config/nestjs'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
```

#### Create `apps/auth-service/tsconfig.json`
```json
{
  "extends": "@hris/typescript-config/nestjs.json",
  "compilerOptions": {
    "outDir": "./dist",
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@common/*": ["src/common/*"],
      "@config/*": ["src/config/*"],
      "@modules/*": ["src/modules/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
```

#### Create `apps/auth-service/.prettierrc.js`
```javascript
module.exports = {
  ...require('@hris/prettier-config'),
};
```

---

## Part 6: Create Next.js Frontend App

### Step 9: Initialize Next.js App

```powershell
cd ../
npx create-next-app@latest web --typescript --tailwind --app --src-dir --import-alias "@/*"
cd web
```

#### Update `apps/web/package.json`
```json
{
  "name": "web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf .next .turbo"
  },
  "dependencies": {
    "@hris/common": "*",
    "@hris/contracts": "*",
    "next": "^14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.2",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@hris/eslint-config": "*",
    "@hris/prettier-config": "*",
    "@hris/typescript-config": "*",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "14.0.4",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "typescript": "^5"
  }
}
```

#### Create `apps/web/.eslintrc.js`
```javascript
module.exports = {
  extends: ['@hris/eslint-config/nextjs'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
```

#### Update `apps/web/tsconfig.json`
```json
{
  "extends": "@hris/typescript-config/nextjs.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## Part 7: Create Shared Packages

### Step 10: Create Common Package

```powershell
cd ../../packages
mkdir common
cd common
```

#### Create `packages/common/package.json`
```json
{
  "name": "@hris/common",
  "version": "1.0.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "lint": "eslint \"src/**/*.ts\"",
    "lint:fix": "eslint \"src/**/*.ts\" --fix",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf dist .turbo"
  },
  "dependencies": {
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1"
  },
  "devDependencies": {
    "@hris/eslint-config": "*",
    "@hris/typescript-config": "*",
    "typescript": "^5.3.3"
  }
}
```

#### Create `packages/common/tsconfig.json`
```json
{
  "extends": "@hris/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### Create `packages/common/src/index.ts`
```typescript
export * from './utils';
export * from './constants';
export * from './errors';
```

#### Create basic utility files
```typescript
// packages/common/src/utils/index.ts
export const formatDate = (date: Date): string => {
  return date.toISOString();
};

// packages/common/src/constants/index.ts
export const APP_NAME = 'HRIS';
export const API_VERSION = 'v1';

// packages/common/src/errors/index.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

---

### Step 11: Create Contracts Package

```powershell
cd ..
mkdir contracts
cd contracts
```

#### Create `packages/contracts/package.json`
```json
{
  "name": "@hris/contracts",
  "version": "1.0.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "lint": "eslint \"src/**/*.ts\"",
    "lint:fix": "eslint \"src/**/*.ts\" --fix",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf dist .turbo"
  },
  "dependencies": {
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1"
  },
  "devDependencies": {
    "@hris/eslint-config": "*",
    "@hris/typescript-config": "*",
    "typescript": "^5.3.3"
  }
}
```

#### Create `packages/contracts/tsconfig.json`
```json
{
  "extends": "@hris/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### Create `packages/contracts/src/index.ts`
```typescript
export * from './dtos';
export * from './interfaces';
```

#### Create example DTOs
```typescript
// packages/contracts/src/dtos/auth.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

---

### Step 12: Create Events Package

```powershell
cd ..
mkdir events
cd events
```

#### Create `packages/events/package.json`
```json
{
  "name": "@hris/events",
  "version": "1.0.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "lint": "eslint \"src/**/*.ts\"",
    "lint:fix": "eslint \"src/**/*.ts\" --fix",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf dist .turbo"
  },
  "devDependencies": {
    "@hris/eslint-config": "*",
    "@hris/typescript-config": "*",
    "typescript": "^5.3.3"
  }
}
```

#### Create `packages/events/tsconfig.json`
```json
{
  "extends": "@hris/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### Create `packages/events/src/index.ts`
```typescript
export * from './employee.events';
export * from './leave.events';
export * from './auth.events';
```

#### Create event definitions
```typescript
// packages/events/src/employee.events.ts
export const EMPLOYEE_EVENTS = {
  CREATED: 'employee.created',
  UPDATED: 'employee.updated',
  DELETED: 'employee.deleted',
  ONBOARDED: 'employee.onboarded',
} as const;

export interface EmployeeCreatedEvent {
  employeeId: string;
  name: string;
  email: string;
  departmentId: string;
}

// packages/events/src/auth.events.ts
export const AUTH_EVENTS = {
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  PASSWORD_CHANGED: 'password.changed',
  PASSWORD_RESET_REQUESTED: 'password_reset.requested',
} as const;

export interface UserCreatedEvent {
  userId: string;
  email: string;
  roles: string[];
}
```

---

## Part 8: Root Configuration Files

### Step 13: Create Root Config Files

#### Create `.gitignore`
```
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Environment
.env
.env*.local

# Build
dist/
build/
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
logs/
*.log

# Docker
docker-compose.override.yml

# Uploads & temp
uploads/
temp/

# Coverage
coverage/
.nyc_output/

# Prisma
prisma/migrations/**/*.sql

# Husky
.husky/_
```

#### Create `.eslintignore`
```
node_modules
dist
.turbo
.next
coverage
*.config.js
```

#### Create `.prettierignore`
```
node_modules
dist
.turbo
.next
coverage
pnpm-lock.yaml
package-lock.json
*.md
```

#### Create `.env.example`
```env
# Node Environment
NODE_ENV=development

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=hris
POSTGRES_PASSWORD=hris123

# Database URLs (one per service)
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
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d

# API Gateway
API_GATEWAY_PORT=3000

# Service Ports
AUTH_SERVICE_PORT=3001
EMPLOYEE_SERVICE_PORT=3002
ATTENDANCE_SERVICE_PORT=3003
LEAVE_SERVICE_PORT=3004
PAYROLL_SERVICE_PORT=3005
NOTIFICATION_SERVICE_PORT=3006

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=HRIS <noreply@hris.com>

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## Part 9: VS Code Configuration

### Step 14: Create VS Code Settings

#### Create `.vscode/settings.json`
```json
{
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "eslint.workingDirectories": [
    { "mode": "auto" }
  ],
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/dist/**": true,
    "**/.turbo/**": true,
    "**/.next/**": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.turbo": true,
    "**/.next": true
  },
  "files.associations": {
    "*.json": "jsonc"
  }
}
```

#### Create `.vscode/extensions.json`
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "ms-azuretools.vscode-docker",
    "firsttris.vscode-jest-runner",
    "bradlc.vscode-tailwindcss"
  ]
}
```

---

## Part 10: Husky & Lint-Staged Setup

### Step 15: Initialize Husky

```powershell
cd C:\Projects\hris-microservices

# Initialize Husky
npx husky-init && npm install

# Create pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

#### Create `.lintstagedrc.js`
```javascript
module.exports = {
  '*.{ts,tsx}': [
    'eslint --fix',
    'prettier --write',
  ],
  '*.{json,md}': [
    'prettier --write',
  ],
};
```

---

## Part 11: Installation

### Step 16: Install All Dependencies

```powershell
# From root directory
cd C:\Projects\hris-microservices

# Install all dependencies (Turbo handles workspace linking)
npm install

# Build shared packages
turbo run build --filter='./packages/*'
```

---

## Part 12: Verify Setup

### Step 17: Test Commands

```powershell
# Test Turborepo
turbo --version

# Test linting
turbo run lint

# Test type checking
turbo run type-check

# Test build
turbo run build

# Test formatting
npm run format:check
```

---

## Part 13: Start Development

### Step 18: Start Infrastructure

```powershell
# Start Docker services
npm run docker:up

# Verify services
docker ps
```

### Step 19: Start Applications

```powershell
# Start all services in dev mode
npm run dev

# OR start specific apps
npm run dev:auth        # Auth service only
npm run dev:employee    # Employee service only
npm run dev:web         # Next.js only

# OR start all backend services
npm run dev:backend
```

---

## Summary

You now have:
- ✅ Turborepo monorepo setup
- ✅ Shared ESLint configs (base, NestJS, Next.js)
- ✅ Shared TypeScript configs
- ✅ Shared Prettier config
- ✅ Example auth-service structure
- ✅ Next.js frontend app
- ✅ Shared packages (common, contracts, events)
- ✅ VS Code integration
- ✅ Husky pre-commit hooks
- ✅ Complete project structure

---

## Next Steps

1. ✅ Follow database setup guide
2. ✅ Implement Auth Service (Week 2)
3. ✅ Create remaining services
4. ✅ Build frontend
5. ✅ Deploy to production

---

**Related Docs**:
- [Docker Setup](./02-docker-setup.md)
- [Database Schemas](../database/schemas.md)
- [10-Week Roadmap](./03-project-roadmap.md)
