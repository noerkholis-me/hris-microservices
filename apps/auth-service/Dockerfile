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
COPY --from=builder /app/apps/auth-service/package.json ./package.json

# If you need workspace dependencies, you might need to copy them or use 'turbo prune'
# For now, we copy the node_modules from builder which contains everything
COPY --from=builder /app/node_modules ./node_modules

# Prisma
COPY --from=builder /app/apps/auth-service/prisma ./prisma

# Generate Prisma Client (Required for Linux binary)
RUN npx prisma generate

EXPOSE 3001

CMD ["node", "dist/main.js"]