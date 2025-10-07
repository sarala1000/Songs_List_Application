import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Music, Users, Search, Calendar } from 'lucide-react';
import { Song } from '../types/song';
import YearFilter from './YearFilter';

interface SongsTableProps {
  songs: Song[];
  isLoading?: boolean;
  viewMode?: 'grid' | 'list';
  selectedYears?: string[];
  onYearsChange?: (years: string[]) => void;
}

type SortField = 'song_name' | 'band_name' | 'year';
type SortDirection = 'asc' | 'desc';

/**
 * Advanced songs table with React Query optimization
 * Features:
 * - Sorting and filtering
 * - Grid/List view modes
 * - Optimized animations
 * - Performance optimizations
 */
const SongsTable: React.FC<SongsTableProps> = ({ 
  songs, 
  isLoading = false,
  viewMode = 'list',
  selectedYears = [],
  onYearsChange = () => {}
}) => {
  const [sortField, setSortField] = useState<SortField>('band_name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  // Sort and filter songs
  const processedSongs = useMemo(() => {
    let filtered = songs.filter(song => {
      // Safe access with fallbacks for undefined values
      const songName = song.song_name || '';
      const bandName = song.band_name || '';
      
      const matchesSearch = 
        songName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bandName.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });

    // Sort songs
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

    return filtered;
  }, [songs, sortField, sortDirection, searchTerm]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortButton: React.FC<{ field: SortField; children: React.ReactNode }> = ({ field, children }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 hover:text-primary-400 transition-colors duration-200"
    >
      <span>{children}</span>
      {sortField === field && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {sortDirection === 'asc' ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </motion.div>
      )}
    </button>
  );

  if (isLoading) {
    return (
      <div className="card">
        <div className="space-y-4">
          <div className="h-8 bg-white/10 rounded shimmer"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-white/10 rounded shimmer"></div>
          ))}
        </div>
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card text-center py-12"
      >
        <Music className="w-16 h-16 text-white/30 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Songs Found</h3>
        <p className="text-white/60">
          Upload a CSV file or import sample songs to get started!
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      {/* Header with search and filters */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold gradient-text flex items-center space-x-2">
            <Music className="w-6 h-6" />
            <span>Song Library</span>
            <span className="text-sm font-normal text-white/60">({processedSongs.length} songs)</span>
          </h2>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search songs or bands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          <YearFilter
            songs={songs}
            selectedYears={selectedYears}
            onYearsChange={onYearsChange}
            className="min-w-[160px]"
          />
        </div>
      </div>

      {/* Table/Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {processedSongs.map((song, index) => (
              <motion.div
                key={song.id || index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.003, duration: 0.03 }}
                className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors duration-200 border border-white/10"
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Music className="w-4 h-4 text-primary-400" />
                    <h3 className="font-medium text-white truncate">
                      {song.song_name || 'Unknown'}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2 text-white/80">
                    <Users className="w-4 h-4" />
                    <span className="text-sm truncate">{song.band_name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-white/60">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{song.year || 'N/A'}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-4 px-2 font-semibold text-white/80">
                  <SortButton field="song_name">
                    <div className="flex items-center space-x-2">
                      <Music className="w-4 h-4" />
                      <span>Song Name</span>
                    </div>
                  </SortButton>
                </th>
                <th className="text-left py-4 px-2 font-semibold text-white/80">
                  <SortButton field="band_name">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>Band</span>
                    </div>
                  </SortButton>
                </th>
                <th className="text-left py-4 px-2 font-semibold text-white/80">
                  <SortButton field="year">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Year</span>
                    </div>
                  </SortButton>
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {processedSongs.map((song, index) => (
                  <motion.tr
                    key={song.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.003, duration: 0.03 }}
                    className="border-b border-white/10 hover:bg-white/5 transition-colors duration-200"
                  >
                    <td className="py-4 px-2">
                      <div className="font-medium text-white">
                        {song.song_name || 'Unknown'}
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="text-white/80">
                        {song.band_name || 'Unknown'}
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="text-white/60">
                        {song.year || 'N/A'}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* Results summary */}
      {processedSongs.length !== songs.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-center text-sm text-white/60"
        >
          Showing {processedSongs.length} of {songs.length} songs
        </motion.div>
      )}
    </motion.div>
  );
};

export default SongsTable;
