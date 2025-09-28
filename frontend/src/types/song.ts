/**
 * Song interface matching the backend API structure
 */
export interface Song {
  id?: number;
  'Song Name': string;
  Band: string;
  Year?: number;
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
