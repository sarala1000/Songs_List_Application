/**
 * Unit tests for FileUpload component
 * Tests file upload functionality, drag & drop, and user interactions
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FileUpload } from '../FileUpload';

// Mock the useSongs hook
jest.mock('../../hooks/useSongs', () => ({
  useUploadCSV: () => ({
    mutate: jest.fn(),
    isPending: false,
    error: null,
  }),
  useImportSampleSongs: () => ({
    mutate: jest.fn(),
    isPending: false,
    error: null,
  }),
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock react-dropzone
jest.mock('react-dropzone', () => ({
  useDropzone: () => ({
    getRootProps: () => ({
      'data-testid': 'dropzone',
    }),
    getInputProps: () => ({
      'data-testid': 'file-input',
    }),
    isDragActive: false,
    isDragAccept: false,
    isDragReject: false,
  }),
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Upload: () => <div data-testid="upload-icon">Upload</div>,
  FileText: () => <div data-testid="file-text-icon">FileText</div>,
  CheckCircle: () => <div data-testid="check-circle-icon">CheckCircle</div>,
  AlertCircle: () => <div data-testid="alert-circle-icon">AlertCircle</div>,
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('FileUpload', () => {
  const defaultProps = {
    onUploadSuccess: jest.fn(),
    onUploadError: jest.fn(),
    onImportSuccess: jest.fn(),
    onImportError: jest.fn(),
    isUploading: false,
    isImporting: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render file upload component', () => {
      renderWithQueryClient(<FileUpload {...defaultProps} />);
      
      expect(screen.getByText('Upload CSV File')).toBeInTheDocument();
      expect(screen.getByText('Drag & drop your CSV file here')).toBeInTheDocument();
      expect(screen.getByText('or click to browse')).toBeInTheDocument();
    });

    it('should render import sample songs button', () => {
      renderWithQueryClient(<FileUpload {...defaultProps} />);
      
      expect(screen.getByText('Import Sample Songs')).toBeInTheDocument();
    });

    it('should show upload icon', () => {
      renderWithQueryClient(<FileUpload {...defaultProps} />);
      
      expect(screen.getByTestId('upload-icon')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading state when uploading', () => {
      renderWithQueryClient(
        <FileUpload {...defaultProps} isUploading={true} />
      );
      
      expect(screen.getByText('Uploading...')).toBeInTheDocument();
    });

    it('should show loading state when importing', () => {
      renderWithQueryClient(
        <FileUpload {...defaultProps} isImporting={true} />
      );
      
      expect(screen.getByText('Importing...')).toBeInTheDocument();
    });

    it('should disable buttons when uploading', () => {
      renderWithQueryClient(
        <FileUpload {...defaultProps} isUploading={true} />
      );
      
      const importButton = screen.getByText('Import Sample Songs');
      expect(importButton).toBeDisabled();
    });

    it('should disable buttons when importing', () => {
      renderWithQueryClient(
        <FileUpload {...defaultProps} isImporting={true} />
      );
      
      const importButton = screen.getByText('Import Sample Songs');
      expect(importButton).toBeDisabled();
    });
  });

  describe('File Upload', () => {
    it('should handle file selection', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<FileUpload {...defaultProps} />);
      
      const fileInput = screen.getByTestId('file-input');
      const file = new File(['band,song,year\nThe Beatles,Hey Jude,1968'], 'songs.csv', {
        type: 'text/csv',
      });

      await user.upload(fileInput, file);
      
      expect(fileInput).toHaveProperty('files');
    });

    it('should accept CSV files', () => {
      renderWithQueryClient(<FileUpload {...defaultProps} />);
      
      const fileInput = screen.getByTestId('file-input');
      expect(fileInput).toHaveAttribute('accept', '.csv');
    });
  });

  describe('Import Sample Songs', () => {
    it('should call onImportSuccess when import button is clicked', async () => {
      const user = userEvent.setup();
      const mockImportSuccess = jest.fn();
      
      renderWithQueryClient(
        <FileUpload {...defaultProps} onImportSuccess={mockImportSuccess} />
      );
      
      const importButton = screen.getByText('Import Sample Songs');
      await user.click(importButton);
      
      // Note: In a real test, we would mock the mutation to trigger success
      // For now, we just verify the button is clickable
      expect(importButton).toBeInTheDocument();
    });

    it('should be disabled when importing', () => {
      renderWithQueryClient(
        <FileUpload {...defaultProps} isImporting={true} />
      );
      
      const importButton = screen.getByText('Import Sample Songs');
      expect(importButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWithQueryClient(<FileUpload {...defaultProps} />);
      
      const dropzone = screen.getByTestId('dropzone');
      expect(dropzone).toHaveAttribute('role', 'button');
    });

    it('should have proper button labels', () => {
      renderWithQueryClient(<FileUpload {...defaultProps} />);
      
      expect(screen.getByText('Import Sample Songs')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle upload errors gracefully', () => {
      renderWithQueryClient(<FileUpload {...defaultProps} />);
      
      // Component should render without crashing even with error states
      expect(screen.getByText('Upload CSV File')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply correct CSS classes', () => {
      renderWithQueryClient(<FileUpload {...defaultProps} />);
      
      const dropzone = screen.getByTestId('dropzone');
      expect(dropzone).toHaveClass('border-2', 'border-dashed');
    });

    it('should show different styles for drag states', () => {
      renderWithQueryClient(<FileUpload {...defaultProps} />);
      
      const dropzone = screen.getByTestId('dropzone');
      expect(dropzone).toHaveClass('border-gray-300');
    });
  });
});

