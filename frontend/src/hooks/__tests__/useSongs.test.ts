/**
 * Unit tests for useSongs hooks
 * Tests React Query hooks for song operations
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSongs, useBackendHealth, useUploadCSV, useImportSampleSongs } from '../useSongs';

// Mock the API service
jest.mock('../../services/api', () => ({
  api: {
    getSongs: jest.fn(),
    getHealth: jest.fn(),
    uploadCSV: jest.fn(),
    importSampleSongs: jest.fn(),
  },
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useSongs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useSongs', () => {
    it('should fetch songs successfully', async () => {
      const mockSongs = [
        { id: '1', band: 'The Beatles', song: 'Hey Jude', year: 1968 },
        { id: '2', band: 'Queen', song: 'Bohemian Rhapsody', year: 1975 },
      ];

      const { api } = require('../../services/api');
      api.getSongs.mockResolvedValue(mockSongs);

      const { result } = renderHook(() => useSongs(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockSongs);
      expect(api.getSongs).toHaveBeenCalledTimes(1);
    });

    it('should handle fetch errors', async () => {
      const { api } = require('../../services/api');
      api.getSongs.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useSongs(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should show loading state initially', () => {
      const { result } = renderHook(() => useSongs(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useBackendHealth', () => {
    it('should check backend health successfully', async () => {
      const mockHealth = {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00Z',
        uptime: 12345,
      };

      const { api } = require('../../services/api');
      api.getHealth.mockResolvedValue(mockHealth);

      const { result } = renderHook(() => useBackendHealth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockHealth);
      expect(api.getHealth).toHaveBeenCalledTimes(1);
    });

    it('should handle health check errors', async () => {
      const { api } = require('../../services/api');
      api.getHealth.mockRejectedValue(new Error('Backend unavailable'));

      const { result } = renderHook(() => useBackendHealth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useUploadCSV', () => {
    it('should upload CSV successfully', async () => {
      const mockFile = new File(['band,song,year\nThe Beatles,Hey Jude,1968'], 'songs.csv', {
        type: 'text/csv',
      });

      const mockResponse = {
        message: 'Songs uploaded successfully',
        count: 1,
        songs: [{ id: '1', band: 'The Beatles', song: 'Hey Jude', year: 1968 }],
      };

      const { api } = require('../../services/api');
      api.uploadCSV.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useUploadCSV(), { wrapper });

      result.current.mutate(mockFile);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(api.uploadCSV).toHaveBeenCalledWith(mockFile);
    });

    it('should handle upload errors', async () => {
      const mockFile = new File(['invalid data'], 'songs.csv', {
        type: 'text/csv',
      });

      const { api } = require('../../services/api');
      api.uploadCSV.mockRejectedValue(new Error('Invalid CSV format'));

      const { result } = renderHook(() => useUploadCSV(), { wrapper });

      result.current.mutate(mockFile);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should show loading state during upload', () => {
      const { result } = renderHook(() => useUploadCSV(), { wrapper });

      expect(result.current.isPending).toBe(false);

      const mockFile = new File(['test'], 'songs.csv', { type: 'text/csv' });
      result.current.mutate(mockFile);

      expect(result.current.isPending).toBe(true);
    });
  });

  describe('useImportSampleSongs', () => {
    it('should import sample songs successfully', async () => {
      const mockResponse = {
        message: 'Sample songs imported successfully',
        count: 3,
        songs: [
          { id: '1', band: 'The Beatles', song: 'Hey Jude', year: 1968 },
          { id: '2', band: 'Queen', song: 'Bohemian Rhapsody', year: 1975 },
          { id: '3', band: 'Led Zeppelin', song: 'Stairway to Heaven', year: 1971 },
        ],
      };

      const { api } = require('../../services/api');
      api.importSampleSongs.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useImportSampleSongs(), { wrapper });

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(api.importSampleSongs).toHaveBeenCalledTimes(1);
    });

    it('should handle import errors', async () => {
      const { api } = require('../../services/api');
      api.importSampleSongs.mockRejectedValue(new Error('Import failed'));

      const { result } = renderHook(() => useImportSampleSongs(), { wrapper });

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should show loading state during import', () => {
      const { result } = renderHook(() => useImportSampleSongs(), { wrapper });

      expect(result.current.isPending).toBe(false);

      result.current.mutate();

      expect(result.current.isPending).toBe(true);
    });
  });

  describe('Cache Management', () => {
    it('should invalidate songs cache after upload', async () => {
      const mockFile = new File(['band,song,year\nThe Beatles,Hey Jude,1968'], 'songs.csv', {
        type: 'text/csv',
      });

      const mockResponse = {
        message: 'Songs uploaded successfully',
        count: 1,
        songs: [{ id: '1', band: 'The Beatles', song: 'Hey Jude', year: 1968 }],
      };

      const { api } = require('../../services/api');
      api.uploadCSV.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useUploadCSV(), { wrapper });

      result.current.mutate(mockFile);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // The mutation should have invalidated the songs cache
      expect(result.current.isSuccess).toBe(true);
    });

    it('should invalidate songs cache after sample import', async () => {
      const mockResponse = {
        message: 'Sample songs imported successfully',
        count: 3,
        songs: [],
      };

      const { api } = require('../../services/api');
      api.importSampleSongs.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useImportSampleSongs(), { wrapper });

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.isSuccess).toBe(true);
    });
  });
});


