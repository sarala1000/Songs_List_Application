/**
 * Unit tests for AppController
 * Tests the health check and app info endpoints
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;
  let service: jest.Mocked<AppService>;

  beforeEach(async () => {
    // Create mock AppService
    const mockAppService = {
      getHealth: jest.fn(),
      getAppInfo: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
    service = module.get(AppService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('healthCheck', () => {
    it('should return health status from service', () => {
      // Arrange
      const mockHealth = {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 12345,
      };
      service.getHealth.mockReturnValue(mockHealth);

      // Act
      const result = controller.healthCheck();

      // Assert
      expect(service.getHealth).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockHealth);
    });

    it('should return valid health object structure', () => {
      // Arrange
      const mockHealth = {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 12345,
      };
      service.getHealth.mockReturnValue(mockHealth);

      // Act
      const result = controller.healthCheck();

      // Assert
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result.status).toBe('ok');
      expect(typeof result.uptime).toBe('number');
    });
  });

  describe('getAppInfo', () => {
    it('should return app info from service', () => {
      // Arrange
      const mockAppInfo = {
        name: 'Song List API',
        version: '1.0.0',
        environment: 'test',
      };
      service.getAppInfo.mockReturnValue(mockAppInfo);

      // Act
      const result = controller.getAppInfo();

      // Assert
      expect(service.getAppInfo).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockAppInfo);
    });

    it('should return valid app info structure', () => {
      // Arrange
      const mockAppInfo = {
        name: 'Song List API',
        version: '1.0.0',
        environment: 'test',
      };
      service.getAppInfo.mockReturnValue(mockAppInfo);

      // Act
      const result = controller.getAppInfo();

      // Assert
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('environment');
      expect(result.name).toBe('Song List API');
    });
  });
});
