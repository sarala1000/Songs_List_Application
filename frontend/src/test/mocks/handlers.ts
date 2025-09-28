/**
 * Mock API handlers for testing
 * Uses MSW (Mock Service Worker) to intercept API calls
 */

import { http, HttpResponse } from 'msw';

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
  {
    id: '3',
    band: 'Led Zeppelin',
    song: 'Stairway to Heaven',
    year: 1971,
    created_at: '2024-01-01T00:00:00Z',
  },
];

const mockHealthResponse = {
  status: 'ok',
  timestamp: new Date().toISOString(),
  uptime: 12345,
};

// API handlers
export const handlers = [
  // Health check endpoint
  http.get('http://localhost:3000/health', () => {
    return HttpResponse.json(mockHealthResponse);
  }),

  // Get all songs
  http.get('http://localhost:3000/songs', () => {
    return HttpResponse.json(mockSongs);
  }),

  // Upload CSV file
  http.post('http://localhost:3000/songs/upload', async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return HttpResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Simulate successful upload
    return HttpResponse.json({
      message: 'Songs uploaded successfully',
      count: 3,
    });
  }),

  // Import sample songs
  http.post('http://localhost:3000/songs/import-sample', () => {
    return HttpResponse.json({
      message: 'Sample songs imported successfully',
      count: 3,
    });
  }),

  // Error handlers for testing error scenarios
  http.get('http://localhost:3000/songs/error', () => {
    return HttpResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }),

  http.post('http://localhost:3000/songs/upload/error', () => {
    return HttpResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }),
];
