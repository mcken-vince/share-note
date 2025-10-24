import { NotesService } from './NotesService';

// Mock fetch
const mockFetch = jest.fn();

describe('NotesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = mockFetch;
  });

  describe('getAllNotes', () => {
    it('should fetch and return notes successfully', async () => {
      const mockNotes = [
        {
          id: '1',
          title: 'Test Note',
          type: 'note',
          body: 'Test content',
          tags: ['test'],
          createdAt: '2023-01-01T00:00:00.000Z',
          modifiedAt: '2023-01-02T00:00:00.000Z',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ notes: mockNotes }),
      });

      const result = await NotesService.getAllNotes();
      expect(mockFetch).toHaveBeenCalledWith('/api/notes');
      expect(result).toHaveLength(1);
      expect(new Date(result[0].createdAt)).toBeInstanceOf(Date);
      expect(new Date(result[0].modifiedAt)).toBeInstanceOf(Date);
      expect(result[0].title).toBe('Test Note');
    });

    it('should handle fetch errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(NotesService.getAllNotes()).rejects.toThrow(
        'Failed to fetch notes: Internal Server Error'
      );
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(NotesService.getAllNotes()).rejects.toThrow('Network error');
    });

    it('should handle notes with deletedAt field', async () => {
      const mockNotes = [
        {
          id: '1',
          title: 'Deleted Note',
          type: 'note',
          body: 'Content',
          tags: [],
          createdAt: '2023-01-01T00:00:00.000Z',
          modifiedAt: '2023-01-02T00:00:00.000Z',
          deletedAt: '2023-01-03T00:00:00.000Z',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ notes: mockNotes }),
      });

      const result = await NotesService.getAllNotes();
      expect(new Date(result[0].deletedAt!).toISOString()).toBe('2023-01-03T00:00:00.000Z');
    });
  });

  describe('saveAllNotes', () => {
    it('should save notes successfully', async () => {
      const mockNotes = [
        {
          id: '1',
          title: 'Test Note',
          type: 'note' as const,
          body: 'Content',
          tags: ['test'],
          createdAt: new Date('2023-01-01'),
          modifiedAt: new Date('2023-01-02'),
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await NotesService.saveAllNotes(mockNotes);

      expect(mockFetch).toHaveBeenCalledWith('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: mockNotes }),
      });
    });

    it('should handle save errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      });

      await expect(NotesService.saveAllNotes([])).rejects.toThrow(
        'Failed to save notes: Bad Request'
      );
    });

    it('should handle server errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false }),
      });

      await expect(NotesService.saveAllNotes([])).rejects.toThrow(
        'Server reported save failure'
      );
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(NotesService.saveAllNotes([])).rejects.toThrow('Network error');
    });
  });
});
