/**
 * Unit tests for AppService
 * Tests the health check and app info service logic
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service.js';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  describe('getHealth', () => {
    it('should return health status with current timestamp', () => {
      // Arrange
      const startTime = Date.now();

      // Act
      const result = service.getHealth();

      // Assert
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      
      // Check timestamp is recent
      const resultTime = new Date(result.timestamp).getTime();
      expect(resultTime).toBeGreaterThanOrEqual(startTime);
      expect(resultTime).toBeLessThanOrEqual(Date.now());
    });

    it('should return valid ISO timestamp', () => {
      // Act
      const result = service.getHealth();

      // Assert
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
      expect(new Date(result.timestamp).getTime()).not.toBeNaN();
    });

    it('should return numeric uptime', () => {
      // Act
      const result = service.getHealth();

      // Assert
      expect(typeof result.uptime).toBe('number');
      expect(result.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should return consistent status', () => {
      // Act
      const result1 = service.getHealth();
      const result2 = service.getHealth();

      // Assert
      expect(result1.status).toBe('ok');
      expect(result2.status).toBe('ok');
      expect(result1.status).toBe(result2.status);
    });
  });

  describe('getAppInfo', () => {
    it('should return app info with correct structure', () => {
      // Act
      const result = service.getAppInfo();

      // Assert
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('environment');
      expect(result.name).toBe('Song List API');
      expect(result.version).toBe('1.0.0');
    });

    it('should return current environment', () => {
      // Act
      const result = service.getAppInfo();

      // Assert
      expect(result.environment).toBeDefined();
      expect(typeof result.environment).toBe('string');
    });

    it('should return consistent app info', () => {
      // Act
      const result1 = service.getAppInfo();
      const result2 = service.getAppInfo();

      // Assert
      expect(result1.name).toBe(result2.name);
      expect(result1.version).toBe(result2.version);
    });
  });
});
