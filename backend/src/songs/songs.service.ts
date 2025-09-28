import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import csv from 'csv-parser';
import * as fs from 'fs';

// Song interface for Supabase (matching the actual table structure)
export interface Song {
  id?: number;
  'Song Name': string;
  Band: string;
  Year?: number;
}

@Injectable()
export class SongsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Retrieve all songs from the database
   * @returns Promise<Song[]> - Array of songs sorted by band name
   */
  async findAll(): Promise<Song[]> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('songs')
        .select('*')
        .order('Band', { ascending: true });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      throw new Error(`Failed to fetch songs: ${error.message}`);
    }
  }

  /**
   * Import CSV from file path (for static files)
   * @param filePath - Path to CSV file
   * @returns Promise<{message: string}> - Success message with count
   */
  async importCSV(filePath: string): Promise<{ message: string }> {
    return new Promise((resolve, reject) => {
      const songs: Song[] = [];

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          // Process CSV with exact column names: Song Name, Band, Year
          // Handle both comma and semicolon delimited files
          const song: Song = {
            'Song Name': (row['Song Name'] || row['Song Name;Band;Year']?.split(';')[0])?.toLowerCase().trim() || '',
            Band: (row['Band'] || row['Song Name;Band;Year']?.split(';')[1])?.toLowerCase().trim() || '',
            Year: parseInt(row['Year'] || row['Song Name;Band;Year']?.split(';')[2]) || new Date().getFullYear(),
          };

          // Only add if required fields are present
          if (song['Song Name'] && song.Band) {
            songs.push(song);
          }
        })
        .on('end', async () => {
          try {
            if (songs.length === 0) {
              reject(new Error('No valid songs found in CSV file'));
              return;
            }

            const { error } = await this.supabaseService
              .getClient()
              .from('songs')
              .insert(songs);

            if (error) {
              reject(new Error(`Database error: ${error.message}`));
            } else {
              resolve({ 
                message: `Successfully imported ${songs.length} songs from file` 
              });
            }
          } catch (err) {
            reject(new Error(`Failed to save songs: ${err.message}`));
          }
        })
        .on('error', (err) => {
          reject(new Error(`CSV parsing error: ${err.message}`));
        });
    });
  }

  /**
   * Process and upload CSV file with songs data
   * @param file - CSV file to process
   * @returns Promise<{message: string}> - Success message with count
   */
  async loadCSV(file: Express.Multer.File): Promise<{ message: string }> {
    return new Promise((resolve, reject) => {
      const songs: Song[] = [];

      try {
        // Parse CSV from buffer instead of file path
        const csvData = file.buffer.toString('utf-8');
        const lines = csvData.split('\n');
        
        // Detect delimiter - try semicolon first, then comma
        const delimiter = lines[0].includes(';') ? ';' : ',';
        const headers = lines[0].split(delimiter).map(h => h.trim().replace(/"/g, ''));
      
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(delimiter).map(v => v.trim().replace(/"/g, ''));
            
            if (values.length >= 3) {
              const song: Song = {
                'Song Name': values[0]?.toLowerCase().trim() || '',
                Band: values[1]?.toLowerCase().trim() || '',
                Year: parseInt(values[2]) || new Date().getFullYear(),
              };

              // Only add if required fields are present
              if (song['Song Name'] && song.Band) {
                songs.push(song);
              }
            }
          }
        }
      } catch (parseError) {
        reject(new Error(`CSV parsing error: ${parseError.message}`));
        return;
      }

      // Process the songs
      if (songs.length === 0) {
        reject(new Error('No valid songs found in CSV file'));
        return;
      }

      // Save to database
      (async () => {
        try {
          const { error } = await this.supabaseService
            .getClient()
            .from('songs')
            .insert(songs);

          if (error) {
            reject(new Error(`Database error: ${error.message}`));
          } else {
            resolve({ 
              message: `Successfully uploaded ${songs.length} songs` 
            });
          }
        } catch (err) {
          reject(new Error(`Failed to save songs: ${err.message}`));
        }
      })();
    });
  }
}