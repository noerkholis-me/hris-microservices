import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { ApiOperation } from '@nestjs/swagger';
// import { SuccessMessage } from '@hris/common';

@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @ApiOperation({
    summary: 'Health Check',
    description: 'Returns the current health status of the API',
  })
  @Get('health')
  getHealth(): object {
    return this.healthService.getHealth();
  }

  @ApiOperation({
    summary: 'Ping API',
    description: 'Return Pong',
  })
  @Get('api/ping')
  // @SuccessMessage('Pong')
  getPing() {}
}
