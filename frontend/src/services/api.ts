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
    } catch (error) {
      throw new Error('Failed to fetch songs from server');
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
    } catch (error) {
      throw new Error('Failed to import CSV file');
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
    } catch (error) {
      throw new Error('Failed to upload CSV file');
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
