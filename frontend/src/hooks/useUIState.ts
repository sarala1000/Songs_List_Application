import { useState, useCallback, useMemo } from 'react';

/**
 * 🎯 UI State interface for global UI management
 */
interface UIState {
  isUploadModalOpen: boolean;
  isSettingsOpen: boolean;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark' | 'auto';
  viewMode: 'grid' | 'list';
}

/**
 * 🚀 Custom hook for managing global UI state
 * Features:
 * - Centralized UI state management
 * - Persistent settings (localStorage)
 * - Type-safe state updates
 * - Optimized re-renders
 */
export const useUIState = () => {
  // Initialize state with localStorage values
  const [uiState, setUIState] = useState<UIState>(() => {
    const saved = localStorage.getItem('song-app-ui-state');
    if (saved) {
      try {
        return { ...JSON.parse(saved) };
      } catch {
        // Fallback to defaults if parsing fails
      }
    }
    return {
      isUploadModalOpen: false,
      isSettingsOpen: false,
      sidebarCollapsed: false,
      theme: 'dark',
      viewMode: 'list',
    };
  });

  /**
   * Update UI state with persistence
   */
  const updateUIState = useCallback((updates: Partial<UIState>) => {
    setUIState(prev => {
      const newState = { ...prev, ...updates };
      // Persist to localStorage
      localStorage.setItem('song-app-ui-state', JSON.stringify(newState));
      return newState;
    });
  }, []);

  /**
   * Toggle specific UI states
   */
  const toggleUploadModal = useCallback(() => {
    updateUIState({ isUploadModalOpen: !uiState.isUploadModalOpen });
  }, [uiState.isUploadModalOpen, updateUIState]);

  const toggleSettings = useCallback(() => {
    updateUIState({ isSettingsOpen: !uiState.isSettingsOpen });
  }, [uiState.isSettingsOpen, updateUIState]);

  const toggleSidebar = useCallback(() => {
    updateUIState({ sidebarCollapsed: !uiState.sidebarCollapsed });
  }, [uiState.sidebarCollapsed, updateUIState]);

  const toggleViewMode = useCallback(() => {
    updateUIState({ 
      viewMode: uiState.viewMode === 'grid' ? 'list' : 'grid' 
    });
  }, [uiState.viewMode, updateUIState]);

  /**
   * Set theme with system preference detection
   */
  const setTheme = useCallback((theme: UIState['theme']) => {
    updateUIState({ theme });
    
    // Apply theme to document
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [updateUIState]);

  /**
   * Reset UI state to defaults
   */
  const resetUIState = useCallback(() => {
    const defaults: UIState = {
      isUploadModalOpen: false,
      isSettingsOpen: false,
      sidebarCollapsed: false,
      theme: 'dark',
      viewMode: 'list',
    };
    setUIState(defaults);
    localStorage.removeItem('song-app-ui-state');
  }, []);

  /**
   * Memoized computed values
   */
  const computedState = useMemo(() => ({
    isDarkMode: uiState.theme === 'dark' || 
      (uiState.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches),
    isLightMode: uiState.theme === 'light' || 
      (uiState.theme === 'auto' && !window.matchMedia('(prefers-color-scheme: dark)').matches),
    isGridView: uiState.viewMode === 'grid',
    isListView: uiState.viewMode === 'list',
  }), [uiState.theme, uiState.viewMode]);

  return {
    // State
    ...uiState,
    ...computedState,
    
    // Actions
    updateUIState,
    toggleUploadModal,
    toggleSettings,
    toggleSidebar,
    toggleViewMode,
    setTheme,
    resetUIState,
  };
};
