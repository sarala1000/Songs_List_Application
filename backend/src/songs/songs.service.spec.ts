/**
 * Unit tests for SongsService
 * Tests all business logic and data operations
 */

import { Test, TestingModule } from '@nestjs/testing';
import { SongsService } from './songs.service';
import { SupabaseService } from '../supabase/supabase.service';

describe('SongsService', () => {
  let service: SongsService;
  let supabaseService: jest.Mocked<SupabaseService>;

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

  const mockCsvData = `band,song,year
The Beatles,Hey Jude,1968
Queen,Bohemian Rhapsody,1975`;

  beforeEach(async () => {
    // Create mock SupabaseService
    const mockSupabaseClient = {
      from: jest.fn(),
      select: jest.fn(),
      order: jest.fn(),
      insert: jest.fn(),
    };

    const mockSupabaseService = {
      getClient: jest.fn().mockReturnValue(mockSupabaseClient),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SongsService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<SongsService>(SongsService);
    supabaseService = module.get(SupabaseService);
    
    // Get the mock client for easier access
    mockSupabaseClient.from = jest.fn();
    mockSupabaseClient.select = jest.fn();
    mockSupabaseClient.order = jest.fn();
    mockSupabaseClient.insert = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all songs ordered by band name', async () => {
      // Arrange
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
      };
      const mockClient = supabaseService.getClient() as any;
      mockClient.from.mockReturnValue(mockQuery);
      mockQuery.order.mockResolvedValue({ data: mockSongs, error: null });

      // Act
      const result = await service.findAll();

      // Assert
      expect(mockClient.from).toHaveBeenCalledWith('songs');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.order).toHaveBeenCalledWith('Band', { ascending: true });
      expect(result).toEqual(mockSongs);
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
      };
      const mockClient = supabaseService.getClient() as any;
      mockClient.from.mockReturnValue(mockQuery);
      mockQuery.order.mockResolvedValue({ 
        data: null, 
        error: { message: 'Database connection failed' } 
      });

      // Act & Assert
      await expect(service.findAll()).rejects.toThrow('Database connection failed');
    });
  });

  describe('importCSV', () => {
    it('should parse CSV file and save songs to database', async () => {
      // Arrange
      const mockInsert = jest.fn().mockResolvedValue({ 
        data: mockSongs, 
        error: null 
      });
      const mockQuery = {
        insert: mockInsert,
      };
      const mockClient = supabaseService.getClient() as any;
      mockClient.from.mockReturnValue(mockQuery);

      // Act
      const result = await service.importCSV('test.csv');

      // Assert
      expect(mockClient.from).toHaveBeenCalledWith('songs');
      expect(mockInsert).toHaveBeenCalled();
      expect(result.message).toContain('Successfully imported');
    });

    it('should handle invalid CSV data', async () => {
      // Arrange
      const invalidCsv = 'invalid,csv,data\nwithout,proper,headers';

      // Act & Assert
      await expect(service.importCSV('invalid.csv')).rejects.toThrow();
    });

    it('should handle empty CSV data', async () => {
      // Arrange
      const emptyCsv = 'Song Name,Band,Year\n';

      // Act & Assert
      await expect(service.importCSV('empty.csv')).rejects.toThrow('No valid songs found');
    });

    it('should handle database insertion errors', async () => {
      // Arrange
      const mockInsert = jest.fn().mockResolvedValue({ 
        data: null, 
        error: { message: 'Insert failed' } 
      });
      const mockQuery = {
        insert: mockInsert,
      };
      const mockClient = supabaseService.getClient() as any;
      mockClient.from.mockReturnValue(mockQuery);

      // Act & Assert
      await expect(service.importCSV('test.csv')).rejects.toThrow('Insert failed');
    });
  });

  describe('loadCSV', () => {
    it('should upload CSV file successfully', async () => {
      // Arrange
      const mockFile = {
        buffer: Buffer.from('Song Name,Band,Year\nThe Beatles,Hey Jude,1968'),
        originalname: 'songs.csv',
        mimetype: 'text/csv',
      } as Express.Multer.File;

      const mockInsert = jest.fn().mockResolvedValue({ 
        data: mockSongs, 
        error: null 
      });
      const mockQuery = {
        insert: mockInsert,
      };
      const mockClient = supabaseService.getClient() as any;
      mockClient.from.mockReturnValue(mockQuery);

      // Act
      const result = await service.loadCSV(mockFile);

      // Assert
      expect(mockClient.from).toHaveBeenCalledWith('songs');
      expect(mockInsert).toHaveBeenCalled();
      expect(result.message).toContain('Successfully uploaded');
    });

    it('should handle database errors during upload', async () => {
      // Arrange
      const mockFile = {
        buffer: Buffer.from('Song Name,Band,Year\nThe Beatles,Hey Jude,1968'),
        originalname: 'songs.csv',
        mimetype: 'text/csv',
      } as Express.Multer.File;

      const mockInsert = jest.fn().mockResolvedValue({ 
        data: null, 
        error: { message: 'Upload failed' } 
      });
      const mockQuery = {
        insert: mockInsert,
      };
      const mockClient = supabaseService.getClient() as any;
      mockClient.from.mockReturnValue(mockQuery);

      // Act & Assert
      await expect(service.loadCSV(mockFile)).rejects.toThrow('Upload failed');
    });
  });

  describe('data transformation', () => {
    it('should convert song names to lowercase', async () => {
      // Arrange
      const mockFile = {
        buffer: Buffer.from('Song Name,Band,Year\nTHE BEATLES,Hey Jude,1968'),
        originalname: 'songs.csv',
        mimetype: 'text/csv',
      } as Express.Multer.File;

      const mockInsert = jest.fn().mockResolvedValue({ 
        data: mockSongs, 
        error: null 
      });
      const mockQuery = {
        insert: mockInsert,
      };
      const mockClient = supabaseService.getClient() as any;
      mockClient.from.mockReturnValue(mockQuery);

      // Act
      await service.loadCSV(mockFile);

      // Assert
      expect(mockInsert).toHaveBeenCalledWith([
        {
          'Song Name': 'the beatles',
          Band: 'hey jude',
          Year: 1968,
        },
      ]);
    });

    it('should handle special characters in song names', async () => {
      // Arrange
      const mockFile = {
        buffer: Buffer.from('Song Name,Band,Year\nAC/DC,Highway to Hell,1979'),
        originalname: 'songs.csv',
        mimetype: 'text/csv',
      } as Express.Multer.File;

      const mockInsert = jest.fn().mockResolvedValue({ 
        data: mockSongs, 
        error: null 
      });
      const mockQuery = {
        insert: mockInsert,
      };
      const mockClient = supabaseService.getClient() as any;
      mockClient.from.mockReturnValue(mockQuery);

      // Act
      await service.loadCSV(mockFile);

      // Assert
      expect(mockInsert).toHaveBeenCalledWith([
        {
          'Song Name': 'ac/dc',
          Band: 'highway to hell',
          Year: 1979,
        },
      ]);
    });
  });
});
