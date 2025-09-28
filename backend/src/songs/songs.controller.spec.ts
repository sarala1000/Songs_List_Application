/**
 * Unit tests for SongsController
 * Tests all HTTP endpoints and request/response handling
 */

import { Test, TestingModule } from '@nestjs/testing';
import { SongsController } from './songs.controller';
import { SongsService } from './songs.service';
import { BadRequestException } from '@nestjs/common';

describe('SongsController', () => {
  let controller: SongsController;
  let service: jest.Mocked<SongsService>;

  // Mock data
  const mockSongs = [
    {
      id: '1',
      band: 'The Beatles',
      song: 'Hey Jude',
      year: 1968,
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      band: 'Queen',
      song: 'Bohemian Rhapsody',
      year: 1975,
      created_at: '2024-01-01T00:00:00Z',
    },
  ];

  const mockFile = {
    fieldname: 'file',
    originalname: 'songs.csv',
    encoding: '7bit',
    mimetype: 'text/csv',
    size: 1024,
    buffer: Buffer.from('band,song,year\nThe Beatles,Hey Jude,1968'),
  } as Express.Multer.File;

  beforeEach(async () => {
    // Create mock SongsService
    const mockSongsService = {
      findAll: jest.fn(),
      importCSV: jest.fn(),
      importSampleSongs: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SongsController],
      providers: [
        {
          provide: SongsService,
          useValue: mockSongsService,
        },
      ],
    }).compile();

    controller = module.get<SongsController>(SongsController);
    service = module.get(SongsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all songs', async () => {
      // Arrange
      service.findAll.mockResolvedValue(mockSongs);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSongs);
    });

    it('should handle service errors', async () => {
      // Arrange
      service.findAll.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(controller.findAll()).rejects.toThrow('Database connection failed');
    });
  });

  describe('uploadCSV', () => {
    it('should upload CSV file successfully', async () => {
      // Arrange
      service.importCSV.mockResolvedValue(mockSongs);

      // Act
      const result = await controller.uploadCSV(mockFile);

      // Assert
      expect(service.importCSV).toHaveBeenCalledWith(mockFile.buffer.toString());
      expect(result).toEqual({
        message: 'Songs uploaded successfully',
        count: mockSongs.length,
        songs: mockSongs,
      });
    });

    it('should throw BadRequestException when no file is provided', async () => {
      // Act & Assert
      await expect(controller.uploadCSV(undefined)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw BadRequestException for invalid file type', async () => {
      // Arrange
      const invalidFile = {
        ...mockFile,
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      // Act & Assert
      await expect(controller.uploadCSV(invalidFile)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should handle service errors during upload', async () => {
      // Arrange
      service.importCSV.mockRejectedValue(new Error('CSV parsing failed'));

      // Act & Assert
      await expect(controller.uploadCSV(mockFile)).rejects.toThrow(
        'CSV parsing failed'
      );
    });

    it('should handle empty CSV file', async () => {
      // Arrange
      const emptyFile = {
        ...mockFile,
        buffer: Buffer.from('band,song,year\n'),
      } as Express.Multer.File;
      service.importCSV.mockResolvedValue([]);

      // Act
      const result = await controller.uploadCSV(emptyFile);

      // Assert
      expect(result).toEqual({
        message: 'Songs uploaded successfully',
        count: 0,
        songs: [],
      });
    });
  });

  describe('importSampleSongs', () => {
    it('should import sample songs successfully', async () => {
      // Arrange
      service.importSampleSongs.mockResolvedValue(mockSongs);

      // Act
      const result = await controller.importSampleSongs();

      // Assert
      expect(service.importSampleSongs).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        message: 'Sample songs imported successfully',
        count: mockSongs.length,
        songs: mockSongs,
      });
    });

    it('should handle service errors during sample import', async () => {
      // Arrange
      service.importSampleSongs.mockRejectedValue(new Error('Sample import failed'));

      // Act & Assert
      await expect(controller.importSampleSongs()).rejects.toThrow(
        'Sample import failed'
      );
    });
  });

  describe('file validation', () => {
    it('should accept valid CSV files', async () => {
      // Arrange
      const validFile = {
        ...mockFile,
        mimetype: 'text/csv',
        originalname: 'songs.csv',
      } as Express.Multer.File;
      service.importCSV.mockResolvedValue(mockSongs);

      // Act
      const result = await controller.uploadCSV(validFile);

      // Assert
      expect(result).toBeDefined();
      expect(result.count).toBe(mockSongs.length);
    });

    it('should accept CSV files with different extensions', async () => {
      // Arrange
      const csvFile = {
        ...mockFile,
        mimetype: 'text/csv',
        originalname: 'songs.txt',
      } as Express.Multer.File;
      service.importCSV.mockResolvedValue(mockSongs);

      // Act
      const result = await controller.uploadCSV(csvFile);

      // Assert
      expect(result).toBeDefined();
    });

    it('should reject non-CSV files', async () => {
      // Arrange
      const invalidFile = {
        ...mockFile,
        mimetype: 'application/json',
        originalname: 'songs.json',
      } as Express.Multer.File;

      // Act & Assert
      await expect(controller.uploadCSV(invalidFile)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('response formatting', () => {
    it('should format upload response correctly', async () => {
      // Arrange
      service.importCSV.mockResolvedValue(mockSongs);

      // Act
      const result = await controller.uploadCSV(mockFile);

      // Assert
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('count');
      expect(result).toHaveProperty('songs');
      expect(result.message).toBe('Songs uploaded successfully');
      expect(result.count).toBe(mockSongs.length);
      expect(result.songs).toEqual(mockSongs);
    });

    it('should format sample import response correctly', async () => {
      // Arrange
      service.importSampleSongs.mockResolvedValue(mockSongs);

      // Act
      const result = await controller.importSampleSongs();

      // Assert
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('count');
      expect(result).toHaveProperty('songs');
      expect(result.message).toBe('Sample songs imported successfully');
      expect(result.count).toBe(mockSongs.length);
      expect(result.songs).toEqual(mockSongs);
    });
  });
});
