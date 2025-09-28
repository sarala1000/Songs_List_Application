import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Health check endpoint
   * @returns Health status object
   */
  @Get()
  healthCheck() {
    return this.appService.getHealth();
  }

  /**
   * Application info endpoint
   * @returns Application information
   */
  @Get('info')
  getAppInfo() {
    return this.appService.getAppInfo();
  }
}
