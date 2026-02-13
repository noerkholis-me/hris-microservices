import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  getHealth(): object {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'auth-service',
      uptime: process.uptime(),
    };
  }
}
