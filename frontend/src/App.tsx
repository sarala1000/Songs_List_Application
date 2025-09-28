import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Upload, Sparkles, Wifi, WifiOff, Grid, List, X } from 'lucide-react';
import FileUpload from './components/FileUpload';
import SongsTable from './components/SongsTable';
import LoadingSpinner from './components/LoadingSpinner';
import Notification from './components/Notification';
import { useSongOperations } from './hooks/useSongs';
import { useUIState } from './hooks/useUIState';

const App: React.FC = () => {
  const {
    songs,
    isLoading,
    isError,
    error,
    isBackendConnected,
    isUploading,
    isImporting,
    refetch,
  } = useSongOperations();

  const [notification, setNotification] = React.useState({
    type: 'success' as 'success' | 'error' | 'info',
    message: '',
    isVisible: false,
  });

  const showSuccess = (message: string) => {
    setNotification({ type: 'success', message, isVisible: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, isVisible: false }));
    }, 3000);
  };

  const showError = (error: string) => {
    setNotification({ type: 'error', message: error, isVisible: true });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  const {
    isGridView,
    toggleViewMode,
  } = useUIState();

  const [selectedYears, setSelectedYears] = React.useState<string[]>([]);

  const filteredSongs = React.useMemo(() => {
    if (selectedYears.length === 0) return songs;
    return songs.filter(song => selectedYears.includes(song.Year?.toString() || ''));
  }, [songs, selectedYears]);

  const handleUploadSuccess = (message: string) => {
    showSuccess(message);
  };

  const handleUploadError = (error: string) => {
    showError(error);
  };

  const handleImportSuccess = (message: string) => {
    showSuccess(message);
  };

  const handleImportError = (error: string) => {
    showError(error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 p-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-3"
            >
              <div className="relative">
                <Music className="w-8 h-8 text-purple-400" />
                <Sparkles className="w-4 h-4 text-pink-400 absolute -top-1 -right-1 animate-bounce" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Song List Manager</h1>
                <p className="text-white/60 text-sm">Professional Music Database</p>
              </div>
            </motion.div>

            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center space-x-2"
              >
                {isBackendConnected ? (
                  <>
                    <Wifi className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 text-sm font-medium">Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 text-sm font-medium">Disconnected</span>
                  </>
                )}
              </motion.div>

              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35, duration: 0.2 }}
                onClick={toggleViewMode}
                className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-150 flex items-center space-x-2"
                title={`Switch to ${isGridView ? 'list' : 'grid'} view`}
              >
                {isGridView ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                <span>{isGridView ? 'List' : 'Grid'}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Upload className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Upload Songs</h2>
            </div>
            
            {isBackendConnected ? (
                <FileUpload
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={handleUploadError}
                  onImportSuccess={handleImportSuccess}
                  onImportError={handleImportError}
                  isUploading={isUploading}
                  isImporting={isImporting}
                />
            ) : (
              <div className="text-center py-12">
                <WifiOff className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-red-400">Backend Not Connected</h3>
                <p className="text-white/60">
                  Please start the backend server to upload songs.
                </p>
              </div>
            )}
          </motion.section>

          <AnimatePresence>
            {selectedYears.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-4 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl border border-purple-400/30 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <span className="text-white font-medium">
                      Showing songs from <span className="text-purple-300 font-semibold">
                        {selectedYears.length === 1 ? selectedYears[0] : `${selectedYears.length} years`}
                      </span>
                    </span>
                    <span className="text-purple-200 text-sm">
                      ({filteredSongs.length} of {songs.length} songs)
                    </span>
                  </div>
                  <motion.button
                    onClick={() => setSelectedYears([])}
                    className="text-purple-300 hover:text-white transition-colors duration-150"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
              {isLoading ? (
                <LoadingSpinner message="Loading your music library..." size="lg" />
              ) : isError ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl text-center py-12"
                >
                  <WifiOff className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-red-400">Failed to Load Songs</h3>
                  <p className="text-white/60 mb-4">
                    {error?.message || 'An error occurred while loading songs'}
                  </p>
                  <motion.button
                    onClick={() => refetch()}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                  >
                    Try Again
                  </motion.button>
                </motion.div>
              ) : (
                <SongsTable 
                  songs={filteredSongs} 
                  isLoading={isLoading}
                  viewMode={isGridView ? 'grid' : 'list'}
                  selectedYears={selectedYears}
                  onYearsChange={setSelectedYears}
                />
              )}
          </motion.section>
        </div>
      </main>

      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
        duration={5000}
      />

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="relative z-10 p-6 mt-12"
      >
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/40 text-sm">
            Built with ❤️ using React, TypeScript, NestJS & Supabase
          </p>
        </div>
      </motion.footer>
    </div>
  );
};

export default App;
