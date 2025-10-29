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

      const result = await NotesService.getAllNotes('test-token');
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/notes', {
        headers: {
          'Authorization': 'Bearer test-token',
        },
      });
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

      await expect(NotesService.getAllNotes('test-token')).rejects.toThrow(
        'Failed to fetch notes: Internal Server Error'
      );
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(NotesService.getAllNotes('test-token')).rejects.toThrow('Network error');
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

      const result = await NotesService.getAllNotes('test-token');
      expect(new Date(result[0].deletedAt!).toISOString()).toBe('2023-01-03T00:00:00.000Z');
    });
  });

  describe('saveAllNotes', () => {
    it('should save notes successfully', async () => {
      const mockNotes = [
        {
          id: '1',
          userId: 'user-1',
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

      await NotesService.saveAllNotes('test-token', mockNotes);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify({ notes: mockNotes }),
      });
    });

    it('should handle save errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      });

      await expect(NotesService.saveAllNotes('test-token', [])).rejects.toThrow(
        'Failed to save notes: Bad Request'
      );
    });

    it('should handle server errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false }),
      });

      await expect(NotesService.saveAllNotes('test-token', [])).rejects.toThrow(
        'Server reported save failure'
      );
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(NotesService.saveAllNotes('test-token', [])).rejects.toThrow('Network error');
    });
  });

  describe('createNote', () => {
    it('should create a note successfully', async () => {
      const noteData = {
        title: 'New Note',
        type: 'note' as const,
        tags: ['tag1'],
        body: 'Note body',
      };

      const createdNote = {
        id: 'generated-id',
        userId: 'user-1',
        ...noteData,
        createdAt: '2023-01-01T00:00:00.000Z',
        modifiedAt: '2023-01-01T00:00:00.000Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ note: createdNote }),
      });

      const result = await NotesService.createNote('test-token', noteData);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/notes/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify(noteData),
      });
      expect(result.id).toBe('generated-id');
      expect(result.title).toBe('New Note');
    });

    it('should handle create errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      });

      await expect(
        NotesService.createNote('test-token', {
          title: 'Test',
          type: 'note',
          tags: [],
        })
      ).rejects.toThrow('Failed to create note: Bad Request');
    });
  });

  describe('updateNote', () => {
    it('should update a note successfully', async () => {
      const updates = {
        title: 'Updated Title',
        body: 'Updated body',
      };

      const updatedNote = {
        id: 'note-1',
        userId: 'user-1',
        type: 'note' as const,
        tags: [],
        createdAt: '2023-01-01T00:00:00.000Z',
        modifiedAt: '2023-01-02T00:00:00.000Z',
        ...updates,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ note: updatedNote }),
      });

      const result = await NotesService.updateNote('test-token', 'note-1', updates);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/notes/note-1', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify(updates),
      });
      expect(result.title).toBe('Updated Title');
      expect(result.body).toBe('Updated body');
    });

    it('should handle update errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(
        NotesService.updateNote('test-token', 'note-1', { title: 'Test' })
      ).rejects.toThrow('Failed to update note: Not Found');
    });
  });

  describe('deleteNote', () => {
    it('should delete a note successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await NotesService.deleteNote('test-token', 'note-1');

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/notes/note-1', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer test-token',
        },
      });
    });

    it('should handle delete errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(NotesService.deleteNote('test-token', 'note-1')).rejects.toThrow(
        'Failed to delete note: Not Found'
      );
    });
  });
});
