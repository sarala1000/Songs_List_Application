import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown, Sparkles, Check, Filter } from 'lucide-react';
import { Song } from '../types/song';

interface YearFilterProps {
  songs: Song[];
  selectedYears: string[];
  onYearsChange: (years: string[]) => void;
  className?: string;
}

const YearFilter: React.FC<YearFilterProps> = ({
  songs,
  selectedYears,
  onYearsChange,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempSelectedYears, setTempSelectedYears] = useState<string[]>(selectedYears);


  // Extract unique years from songs and create filter options
  const yearOptions = useMemo(() => {
    const years = songs
      .map(song => song.year)
      .filter((year): year is number => year !== undefined && year > 0)
      .sort((a, b) => b - a); // Sort descending (newest first)

    const uniqueYears = Array.from(new Set(years));
    
    // Create options with counts
    return uniqueYears.map(year => ({
      value: year.toString(),
      label: year.toString(),
      count: songs.filter(song => song.year === year).length
    }));
  }, [songs]);

  const displayText = selectedYears.length === 0 
    ? 'All Years' 
    : selectedYears.length === 1 
      ? selectedYears[0]
      : `${selectedYears.length} Years Selected`;

  const handleToggleYear = (value: string) => {
    setTempSelectedYears(prev => 
      prev.includes(value) 
        ? prev.filter(year => year !== value)
        : [...prev, value]
    );
  };

  const handleApplyFilter = () => {
    onYearsChange(tempSelectedYears);
    setIsOpen(false);
  };

  const handleClearAll = () => {
    setTempSelectedYears([]);
    onYearsChange([]);
    setIsOpen(false);
  };

  const handleSelectAll = () => {
    const allYears = yearOptions.map(option => option.value);
    setTempSelectedYears(allYears);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="input-field flex items-center justify-between space-x-3 w-full min-w-[160px]"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
      >
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4" />
          <span className="truncate font-semibold">{displayText}</span>
          {selectedYears.length > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-2 h-2 bg-white rounded-full"
            />
          )}
        </div>
        
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-2 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 rounded-xl shadow-2xl border border-purple-400/30 overflow-hidden z-50 backdrop-blur-sm ring-1 ring-purple-500/20 shadow-purple-500/20"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-purple-800 to-purple-900 border-b border-purple-400/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-purple-200">
                  {yearOptions.length} year{yearOptions.length !== 1 ? 's' : ''} available
                </p>
                <motion.div
                  className="flex items-center space-x-1 text-purple-300"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-3 h-3" />
                  <span className="text-xs font-medium">Multi-Select</span>
                </motion.div>
              </div>
              
              
              {/* Action Buttons */}
              <div className="flex space-x-2">
                <motion.button
                  onClick={handleSelectAll}
                  className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Select All
                </motion.button>
                <motion.button
                  onClick={handleClearAll}
                  className="px-3 py-1 text-xs bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Clear All
                </motion.button>
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-track-purple-800 scrollbar-thumb-purple-500 hover:scrollbar-thumb-purple-400 bg-gradient-to-b from-purple-900/80 to-purple-800/90">
              {yearOptions.map((option, index) => {
                const isSelected = tempSelectedYears.includes(option.value);
                return (
                  <motion.button
                    key={option.value}
                    onClick={() => handleToggleYear(option.value)}
                    className={`w-full px-4 py-3 text-left transition-all duration-150 flex items-center justify-between hover:bg-purple-500/20 group relative ${
                      isSelected 
                        ? 'bg-purple-500/30 text-purple-200 border-r-3 border-purple-400 shadow-lg shadow-purple-500/20 ring-1 ring-purple-400/30' 
                        : 'text-gray-200 hover:text-purple-300 hover:shadow-md hover:shadow-purple-500/10 hover:ring-1 hover:ring-purple-500/20'
                    }`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.2 }}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center space-x-3">
                      <motion.div 
                        className={`w-4 h-4 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                          isSelected 
                            ? 'bg-purple-400 border-purple-400 shadow-lg shadow-purple-400/60' 
                            : 'border-gray-400 group-hover:border-purple-400 group-hover:shadow-md group-hover:shadow-purple-400/30'
                        }`}
                        whileHover={{ scale: 1.1 }}
                      >
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Check className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                      </motion.div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <span className="font-medium">{option.label}</span>
                      </div>
                    </div>
                    <motion.span 
                      className={`text-xs px-2 py-1 rounded-full transition-all duration-200 ${
                        isSelected 
                          ? 'bg-purple-500 text-white shadow-md shadow-purple-500/40' 
                          : 'bg-purple-800/50 text-purple-200 group-hover:bg-purple-500 group-hover:text-white group-hover:shadow-md group-hover:shadow-purple-500/30'
                      }`}
                      whileHover={{ scale: 1.05 }}
                    >
                      {option.count}
                    </motion.span>
                  </motion.button>
                );
              })}
            </div>

            {/* Apply Filter Button */}
            <div className="px-4 py-4 bg-gradient-to-r from-purple-800 to-purple-900 border-t border-purple-400/30">
              <motion.button
                onClick={handleApplyFilter}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded-md transition-all duration-200 flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Filter className="w-3 h-3" />
                <span className="text-xs">
                  Apply Filter ({tempSelectedYears.length} selected)
                </span>
              </motion.button>
              
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default YearFilter;
