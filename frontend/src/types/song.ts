/**
 * Song interface matching the backend API structure
 * Using snake_case to match PostgreSQL conventions
 */
export interface Song {
  id?: number;
  song_name: string;
  band_name: string;
  year?: number;
}

/**
 * API response types
 */
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Upload response type
 */
export interface UploadResponse {
  message: string;
}
