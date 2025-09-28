import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /**
   * Get application health status
   * @returns Health status object with timestamp and uptime
   */
  getHealth(): { status: string; timestamp: string; uptime: number } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  /**
   * Get application information
   * @returns Application info object
   */
  getAppInfo(): { name: string; version: string; environment: string } {
    return {
      name: 'Song List API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}


