import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { Song, UploadResponse } from '../types/song';

/**
 * Query keys for consistent cache management
 */
export const songKeys = {
  all: ['songs'] as const,
  lists: () => [...songKeys.all, 'list'] as const,
  list: (filters: string) => [...songKeys.lists(), { filters }] as const,
} as const;

/**
 * 🚀 Custom hook for fetching songs with React Query
 * Features:
 * - Automatic caching
 * - Background refetching
 * - Error handling
 * - Loading states
 */
export const useSongs = () => {
  return useQuery({
    queryKey: songKeys.lists(),
    queryFn: () => apiService.getSongs(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * 🔥 Custom hook for backend health check
 * Features:
 * - Automatic retry with exponential backoff
 * - Short stale time for real-time status
 */
export const useBackendHealth = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiService.healthCheck(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount) => failureCount < 5,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    refetchInterval: 30 * 1000, // Check every 30 seconds
  });
};

/**
 * 🎵 Custom hook for CSV upload with optimistic updates
 * Features:
 * - Optimistic updates
 * - Automatic cache invalidation
 * - Error rollback
 */
export const useUploadCSV = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => apiService.uploadCSV(file),
    onMutate: async (file) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: songKeys.lists() });
      
      // Snapshot the previous value
      const previousSongs = queryClient.getQueryData<Song[]>(songKeys.lists());
      
      // Optimistically update the cache
      queryClient.setQueryData<Song[]>(songKeys.lists(), (old) => {
        // Add a temporary optimistic song entry
        const optimisticSong: Song = {
          id: Date.now(), // Temporary ID
          'Song Name': file.name.replace('.csv', ''),
          Band: 'Uploading...',
          Year: new Date().getFullYear(),
        };
        return old ? [...old, optimisticSong] : [optimisticSong];
      });

      return { previousSongs };
    },
    onError: (err, file, context) => {
      // Rollback on error
      if (context?.previousSongs) {
        queryClient.setQueryData(songKeys.lists(), context.previousSongs);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch songs after successful upload
      queryClient.invalidateQueries({ queryKey: songKeys.lists() });
    },
  });
};

/**
 * 📥 Custom hook for importing sample songs
 * Features:
 * - Optimistic updates
 * - Cache invalidation
 * - Loading states
 */
export const useImportSampleSongs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiService.importCSV(),
    onSuccess: () => {
      // Invalidate and refetch songs after successful import
      queryClient.invalidateQueries({ queryKey: songKeys.lists() });
    },
  });
};

/**
 * 🔄 Custom hook for manual refresh
 * Features:
 * - Force refresh
 * - Loading states
 * - Error handling
 */
export const useRefreshSongs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiService.getSongs(),
    onSuccess: (data) => {
      // Update cache with fresh data
      queryClient.setQueryData(songKeys.lists(), data);
    },
  });
};

/**
 * 🎯 Combined hook for all song operations
 * This is the main hook that components should use
 */
export const useSongOperations = () => {
  const songsQuery = useSongs();
  const healthQuery = useBackendHealth();
  const uploadMutation = useUploadCSV();
  const importMutation = useImportSampleSongs();
  const refreshMutation = useRefreshSongs();

  return {
    // Songs data
    songs: songsQuery.data || [],
    isLoading: songsQuery.isLoading,
    isError: songsQuery.isError,
    error: songsQuery.error,
    
    // Backend status
    isBackendConnected: healthQuery.data || false,
    isHealthLoading: healthQuery.isLoading,
    
    // Upload operations
    uploadCSV: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    uploadError: uploadMutation.error,
    
    // Import operations
    importSampleSongs: importMutation.mutate,
    isImporting: importMutation.isPending,
    importError: importMutation.error,
    
    // Refresh operations
    refreshSongs: refreshMutation.mutate,
    isRefreshing: refreshMutation.isPending,
    refreshError: refreshMutation.error,
    
    // Utility functions
    refetch: songsQuery.refetch,
    invalidate: () => queryClient.invalidateQueries({ queryKey: songKeys.lists() }),
  };
};
