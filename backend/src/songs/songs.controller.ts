import { 
  Controller, 
  Get, 
  Post, 
  UploadedFile, 
  UseInterceptors,
  HttpException,
  HttpStatus,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SongsService, Song } from './songs.service';

@Controller('songs')
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  /**
   * Get all songs sorted by band name
   * @returns Promise<Song[]> - Array of songs
   */
  @Get()
  async getAll(): Promise<Song[]> {
    try {
      return await this.songsService.findAll();
    } catch (error) {
      console.error('Error fetching songs:', error);
      throw new HttpException(
        `Failed to fetch songs: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Import CSV from static file path
   * @returns Promise<{message: string}> - Success message
   */
  @Post('import')
  async importCSV(): Promise<{ message: string }> {
    try {
      // Default CSV file path - you can change this
      const filePath = require('path').join(process.cwd(), 'src', 'song_list.csv');
      return await this.songsService.importCSV(filePath);
    } catch (error) {
      console.error('Error importing CSV:', error);
      throw new HttpException(
        `Failed to import CSV file: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Upload CSV file with songs data
   * @param file - CSV file to upload
   * @returns Promise<{message: string}> - Success message
   */
  @Post('upload-csv')
  @UseInterceptors(FileInterceptor('file', {
    storage: undefined, // Use memory storage
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  }))
  async uploadCSV(@UploadedFile() file: Express.Multer.File): Promise<{ message: string }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.mimetype.includes('csv')) {
      throw new BadRequestException('File must be a CSV');
    }

    try {
      return await this.songsService.loadCSV(file);
    } catch (error) {
      console.error('Error processing CSV:', error);
      throw new HttpException(
        `Failed to process CSV file: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
