import { renderHook, waitFor } from '@testing-library/react';
import { useNotesApi } from './useNotesApi';
import type { Note } from '@/types';
import { act } from 'react';

// Mock the NotesService
const mockGetAllNotes = jest.fn();
const mockSaveAllNotes = jest.fn();
const mockCreateNote = jest.fn();
const mockUpdateNote = jest.fn();
const mockDeleteNote = jest.fn();

jest.mock('@/services', () => ({
  NotesService: {
    getAllNotes: (...args: any[]) => mockGetAllNotes(...args),
    saveAllNotes: (...args: any[]) => mockSaveAllNotes(...args),
    createNote: (...args: any[]) => mockCreateNote(...args),
    updateNote: (...args: any[]) => mockUpdateNote(...args),
    deleteNote: (...args: any[]) => mockDeleteNote(...args),
  },
}));

// Mock the Auth Context
const mockUser = { id: 'user-1', firstName: 'Test', lastName: 'User', email: 'test@example.com' };
const mockToken = 'test-token';

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    token: mockToken,
  }),
}));

// Mock generateId
jest.mock('@/lib/generateId', () => ({
  generateId: jest.fn(() => 'mock-id-123'),
}));

describe('useNotesApi', () => {
  const mockNote: Note = {
    id: '1',
    userId: 'user-1',
    title: 'Test Note',
    type: 'note',
    body: 'Test content',
    tags: ['test'],
    createdAt: new Date('2023-01-01'),
    modifiedAt: new Date('2023-01-02'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllNotes.mockClear();
    mockSaveAllNotes.mockClear();
    mockCreateNote.mockClear();
    mockUpdateNote.mockClear();
    mockDeleteNote.mockClear();
  });

  it('should load notes on mount', async () => {
    mockGetAllNotes.mockResolvedValue([mockNote]);

    const { result } = renderHook(() => useNotesApi());

    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.notes).toEqual([mockNote]);
    expect(result.current.error).toBe(null);
    expect(mockGetAllNotes).toHaveBeenCalledTimes(1);
    expect(mockGetAllNotes).toHaveBeenCalledWith('test-token');
  });

  it('should handle loading errors', async () => {
    const errorMessage = 'Failed to load notes';
    mockGetAllNotes.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useNotesApi());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.notes).toEqual([]);
  });

  it('should create a new note', async () => {
    mockGetAllNotes.mockResolvedValue([]);
    const newNote = { ...mockNote, id: 'new-id', title: 'New Note', tags: ['new'] };
    mockCreateNote.mockResolvedValue(newNote);

    const { result } = renderHook(() => useNotesApi());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const noteData = {
      title: 'New Note',
      type: 'note' as const,
      tags: ['new'],
    };

    await act(async () => {
      await result.current.createNote(noteData);
    });

    expect(mockCreateNote).toHaveBeenCalledWith('test-token', noteData);
    expect(result.current.notes).toContainEqual(newNote);
  });

  it('should update an existing note', async () => {
    mockGetAllNotes.mockResolvedValue([mockNote]);
    const updatedNote = { ...mockNote, title: 'Updated Title', body: 'Updated content' };
    mockUpdateNote.mockResolvedValue(updatedNote);

    const { result } = renderHook(() => useNotesApi());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const updates = { title: 'Updated Title', body: 'Updated content' };

    await act(async () => {
      await result.current.updateNote('1', updates);
    });

    expect(mockUpdateNote).toHaveBeenCalledWith('test-token', '1', updates);
    expect(result.current.notes[0]).toMatchObject({
      id: '1',
      title: 'Updated Title',
      body: 'Updated content',
    });
  });

  it('should delete a note', async () => {
    mockGetAllNotes.mockResolvedValue([mockNote]);
    mockDeleteNote.mockResolvedValue(undefined);

    const { result } = renderHook(() => useNotesApi());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteNote('1');
    });

    expect(mockDeleteNote).toHaveBeenCalledWith('test-token', '1');
    expect(result.current.notes).toEqual([]);
  });

  it('should get note by ID', async () => {
    mockGetAllNotes.mockResolvedValue([mockNote]);

    const { result } = renderHook(() => useNotesApi());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.getNoteById('1')).toEqual(mockNote);
    expect(result.current.getNoteById('non-existent')).toBeUndefined();
  });

  it('should clear all notes', async () => {
    mockGetAllNotes.mockResolvedValue([mockNote]);
    mockSaveAllNotes.mockResolvedValue(undefined);

    const { result } = renderHook(() => useNotesApi());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.clearAllNotes();
    });

    expect(mockSaveAllNotes).toHaveBeenCalledWith('test-token', []);
  });

  it('should handle save errors', async () => {
    mockGetAllNotes.mockResolvedValue([]);
    mockCreateNote.mockRejectedValue(new Error('Save failed'));

    const { result } = renderHook(() => useNotesApi());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const noteData = {
      title: 'New Note',
      type: 'note' as const,
      tags: [],
    };

    await act(async () => {
      await expect(result.current.createNote(noteData)).rejects.toThrow('Save failed');
    });

    expect(result.current.saveError).toBe('Save failed');
  });

  it('should refetch notes', async () => {
    mockGetAllNotes.mockResolvedValue([mockNote]);

    const { result } = renderHook(() => useNotesApi());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetAllNotes).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockGetAllNotes).toHaveBeenCalledTimes(2);
  });
});
