import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, Music } from 'lucide-react';
import { useUploadCSV, useImportSampleSongs } from '../hooks/useSongs';

interface FileUploadProps {
  onUploadSuccess: (message: string) => void;
  onUploadError: (error: string) => void;
  onImportSuccess?: (message: string) => void;
  onImportError?: (error: string) => void;
  isUploading?: boolean;
  isImporting?: boolean;
}

/**
 * 🚀 Advanced file upload component with React Query optimization
 * Features:
 * - Drag & drop functionality
 * - Optimistic updates
 * - Error handling
 * - Loading states
 */
const FileUpload: React.FC<FileUploadProps> = ({ 
  onUploadSuccess, 
  onUploadError,
  onImportSuccess,
  onImportError,
  isUploading: externalIsUploading = false,
  isImporting: externalIsImporting = false
}) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // 🎯 React Query hooks
  const uploadMutation = useUploadCSV();
  const importMutation = useImportSampleSongs();

  // 🎵 Handle file drop with React Query
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      onUploadError('Please upload a CSV file');
      return;
    }

    setUploadStatus('idle');
    
    // Use React Query mutation
    uploadMutation.mutate(file, {
      onSuccess: (response) => {
        setUploadStatus('success');
        onUploadSuccess(response.message);
      },
      onError: (error) => {
        setUploadStatus('error');
        onUploadError(error instanceof Error ? error.message : 'Upload failed');
      }
    });
  }, [onUploadSuccess, onUploadError, uploadMutation]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    multiple: false,
    disabled: uploadMutation.isPending || externalIsUploading
  });

  // 🎯 Handle import sample songs with React Query
  const handleImportStatic = useCallback(() => {
    setUploadStatus('idle');
    
    importMutation.mutate(undefined, {
      onSuccess: (response) => {
        setUploadStatus('success');
        onImportSuccess?.(response.message);
      },
      onError: (error) => {
        setUploadStatus('error');
        onImportError?.(error instanceof Error ? error.message : 'Import failed');
      }
    });
  }, [importMutation, onImportSuccess, onImportError]);

  // 🎯 Combined loading states
  const isUploading = uploadMutation.isPending || externalIsUploading;
  const isImporting = importMutation.isPending || externalIsImporting;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Drag & Drop Area */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95
          ${isDragActive && !isDragReject 
            ? 'border-primary-400 bg-primary-500/20 scale-105' 
            : isDragReject 
            ? 'border-red-400 bg-red-500/20' 
            : 'border-white/30 hover:border-primary-400 hover:bg-white/5'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="animate-spin w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-lg font-medium">
                {uploadMutation.isPending ? 'Uploading your songs...' : 'Processing...'}
              </p>
            </motion.div>
          ) : uploadStatus === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="space-y-4"
            >
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
              <p className="text-lg font-medium text-green-400">Upload Successful!</p>
            </motion.div>
          ) : uploadStatus === 'error' ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="space-y-4"
            >
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
              <p className="text-lg font-medium text-red-400">Upload Failed</p>
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="relative">
                <Upload className="w-16 h-16 text-primary-400 mx-auto" />
                <Music className="w-8 h-8 text-secondary-400 absolute -top-2 -right-2 animate-bounce-gentle" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold gradient-text">
                  {isDragActive ? 'Drop your CSV file here!' : 'Upload Your Song List'}
                </h3>
                <p className="text-white/70">
                  {isDragActive 
                    ? 'Release to upload' 
                    : 'Drag & drop a CSV file here, or click to browse'
                  }
                </p>
              </div>
              
              <div className="flex items-center justify-center space-x-2 text-sm text-white/50">
                <FileText className="w-4 h-4" />
                <span>CSV files only</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Import Static File Button */}
      <motion.button
        onClick={handleImportStatic}
        disabled={isUploading || isImporting}
        className="btn-secondary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: (isUploading || isImporting) ? 1 : 1.05 }}
        whileTap={{ scale: (isUploading || isImporting) ? 1 : 0.95 }}
      >
        {isImporting ? (
          <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
        ) : (
          <Music className="w-5 h-5" />
        )}
        <span>
          {isImporting ? 'Importing Sample Songs...' : 'Import Sample Songs'}
        </span>
      </motion.button>
    </div>
  );
};

export default FileUpload;
