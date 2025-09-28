/**
 * Unit tests for SongsTable component
 * Tests table rendering, data display, and view modes
 */

import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SongsTable } from '../SongsTable';

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

describe('SongsTable', () => {
  const defaultProps = {
    songs: mockSongs,
    isLoading: false,
    viewMode: 'list' as const,
  };

  describe('Rendering', () => {
    it('should render songs table with data', () => {
      renderWithQueryClient(<SongsTable {...defaultProps} />);
      
      expect(screen.getByText('The Beatles')).toBeInTheDocument();
      expect(screen.getByText('Hey Jude')).toBeInTheDocument();
      expect(screen.getByText('1968')).toBeInTheDocument();
    });

    it('should render all songs in the table', () => {
      renderWithQueryClient(<SongsTable {...defaultProps} />);
      
      expect(screen.getByText('Queen')).toBeInTheDocument();
      expect(screen.getByText('Bohemian Rhapsody')).toBeInTheDocument();
      expect(screen.getByText('Led Zeppelin')).toBeInTheDocument();
      expect(screen.getByText('Stairway to Heaven')).toBeInTheDocument();
    });

    it('should render table headers', () => {
      renderWithQueryClient(<SongsTable {...defaultProps} />);
      
      expect(screen.getByText('Band')).toBeInTheDocument();
      expect(screen.getByText('Song')).toBeInTheDocument();
      expect(screen.getByText('Year')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when loading', () => {
      renderWithQueryClient(
        <SongsTable {...defaultProps} isLoading={true} />
      );
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should not show table content when loading', () => {
      renderWithQueryClient(
        <SongsTable {...defaultProps} isLoading={true} />
      );
      
      expect(screen.queryByText('The Beatles')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty message when no songs', () => {
      renderWithQueryClient(
        <SongsTable {...defaultProps} songs={[]} />
      );
      
      expect(screen.getByText('No songs found')).toBeInTheDocument();
    });

    it('should not show table headers when empty', () => {
      renderWithQueryClient(
        <SongsTable {...defaultProps} songs={[]} />
      );
      
      expect(screen.queryByText('Band')).not.toBeInTheDocument();
    });
  });

  describe('View Modes', () => {
    it('should render list view by default', () => {
      renderWithQueryClient(<SongsTable {...defaultProps} />);
      
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });

    it('should render grid view when specified', () => {
      renderWithQueryClient(
        <SongsTable {...defaultProps} viewMode="grid" />
      );
      
      // In grid view, we expect cards instead of table
      expect(screen.getByText('The Beatles')).toBeInTheDocument();
      expect(screen.getByText('Hey Jude')).toBeInTheDocument();
    });

    it('should apply correct CSS classes for list view', () => {
      renderWithQueryClient(<SongsTable {...defaultProps} />);
      
      const table = screen.getByRole('table');
      expect(table).toHaveClass('min-w-full');
    });

    it('should apply correct CSS classes for grid view', () => {
      renderWithQueryClient(
        <SongsTable {...defaultProps} viewMode="grid" />
      );
      
      // Grid view should have grid classes
      const container = screen.getByTestId('songs-grid');
      expect(container).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
    });
  });

  describe('Data Display', () => {
    it('should display band names correctly', () => {
      renderWithQueryClient(<SongsTable {...defaultProps} />);
      
      expect(screen.getByText('The Beatles')).toBeInTheDocument();
      expect(screen.getByText('Queen')).toBeInTheDocument();
      expect(screen.getByText('Led Zeppelin')).toBeInTheDocument();
    });

    it('should display song titles correctly', () => {
      renderWithQueryClient(<SongsTable {...defaultProps} />);
      
      expect(screen.getByText('Hey Jude')).toBeInTheDocument();
      expect(screen.getByText('Bohemian Rhapsody')).toBeInTheDocument();
      expect(screen.getByText('Stairway to Heaven')).toBeInTheDocument();
    });

    it('should display years correctly', () => {
      renderWithQueryClient(<SongsTable {...defaultProps} />);
      
      expect(screen.getByText('1968')).toBeInTheDocument();
      expect(screen.getByText('1975')).toBeInTheDocument();
      expect(screen.getByText('1971')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper table structure', () => {
      renderWithQueryClient(<SongsTable {...defaultProps} />);
      
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      
      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(3); // Band, Song, Year
    });

    it('should have proper ARIA labels', () => {
      renderWithQueryClient(<SongsTable {...defaultProps} />);
      
      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('aria-label', 'Songs list');
    });
  });

  describe('Error Handling', () => {
    it('should handle undefined songs gracefully', () => {
      renderWithQueryClient(
        <SongsTable {...defaultProps} songs={undefined as any} />
      );
      
      expect(screen.getByText('No songs found')).toBeInTheDocument();
    });

    it('should handle null songs gracefully', () => {
      renderWithQueryClient(
        <SongsTable {...defaultProps} songs={null as any} />
      );
      
      expect(screen.getByText('No songs found')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render efficiently with many songs', () => {
      const manySongs = Array.from({ length: 100 }, (_, i) => ({
        id: i.toString(),
        band: `Band ${i}`,
        song: `Song ${i}`,
        year: 1960 + i,
        created_at: '2024-01-01T00:00:00Z',
      }));

      renderWithQueryClient(
        <SongsTable {...defaultProps} songs={manySongs} />
      );
      
      expect(screen.getByText('Band 0')).toBeInTheDocument();
      expect(screen.getByText('Band 99')).toBeInTheDocument();
    });
  });
});

