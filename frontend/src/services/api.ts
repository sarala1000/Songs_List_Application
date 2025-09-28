import axios from 'axios';
import { Song, UploadResponse } from '../types/song';

/**
 * API service for communicating with the backend
 */
class ApiService {
  private baseURL = 'http://localhost:3000';

  constructor() {
    axios.defaults.baseURL = this.baseURL;
    axios.defaults.timeout = 10000;
  }

  /**
   * Fetch all songs from the database
   * @returns Promise<Song[]> - Array of songs sorted by band name
   */
  async getSongs(): Promise<Song[]> {
    try {
      const response = await axios.get<Song[]>('/songs');
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Songs endpoint not found');
        } else if (error.response && error.response.status >= 500) {
          throw new Error('Server error occurred while fetching songs');
        } else if (error.code === 'ECONNREFUSED') {
          throw new Error('Cannot connect to server. Please check if backend is running');
        }
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch songs: ${errorMessage}`);
    }
  }

  /**
   * Import CSV from static file
   * @returns Promise<UploadResponse> - Success message
   */
  async importCSV(): Promise<UploadResponse> {
    try {
      const response = await axios.post<UploadResponse>('/songs/import');
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Import endpoint not found');
        } else if (error.response && error.response.status >= 500) {
          throw new Error('Server error occurred during import');
        } else if (error.code === 'ECONNREFUSED') {
          throw new Error('Cannot connect to server. Please check if backend is running');
        }
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to import CSV file: ${errorMessage}`);
    }
  }

  /**
   * Upload CSV file
   * @param file - CSV file to upload
   * @returns Promise<UploadResponse> - Success message
   */
  async uploadCSV(file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post<UploadResponse>('/songs/upload-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new Error('Invalid CSV file format');
        } else if (error.response?.status === 413) {
          throw new Error('File too large. Please choose a smaller file');
        } else if (error.response && error.response.status >= 500) {
          throw new Error('Server error occurred during upload');
        } else if (error.code === 'ECONNREFUSED') {
          throw new Error('Cannot connect to server. Please check if backend is running');
        }
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to upload CSV file: ${errorMessage}`);
    }
  }

  /**
   * Check if backend is running
   * @returns Promise<boolean> - True if backend is accessible
   */
  async healthCheck(): Promise<boolean> {
    try {
      await axios.get('/');
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
