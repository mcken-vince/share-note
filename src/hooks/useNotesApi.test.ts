import { renderHook, waitFor } from '@testing-library/react';
import { useNotesApi } from './useNotesApi';
import type { Note } from '@/types';
import { act } from 'react';

// Mock the NotesService
const mockGetAllNotes = jest.fn();
const mockSaveAllNotes = jest.fn();

jest.mock('@/services/NotesService', () => ({
  NotesService: {
    getAllNotes: () => mockGetAllNotes(),
    saveAllNotes: () => mockSaveAllNotes(),
  },
}));

// Mock generateId
jest.mock('@/lib/generateId', () => ({
  generateId: jest.fn(() => 'mock-id-123'),
}));

describe('useNotesApi', () => {
  const mockNote: Note = {
    id: '1',
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
    mockSaveAllNotes.mockResolvedValue();

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

    expect(mockSaveAllNotes).toHaveBeenCalled();
    const savedNotes = mockSaveAllNotes.mock.calls[0][0];
    expect(savedNotes).toHaveLength(1);
    expect(savedNotes[0]).toMatchObject({
      id: 'mock-id-123',
      title: 'New Note',
      type: 'note',
      tags: ['new'],
    });
  });

  it('should update an existing note', async () => {
    mockGetAllNotes.mockResolvedValue([mockNote]);
    mockSaveAllNotes.mockResolvedValue();

    const { result } = renderHook(() => useNotesApi());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const updates = { title: 'Updated Title', body: 'Updated content' };

    await act(async () => {
      await result.current.updateNote('1', updates);
    });

    expect(mockSaveAllNotes).toHaveBeenCalled();
    const savedNotes = mockSaveAllNotes.mock.calls[0][0];
    expect(savedNotes[0]).toMatchObject({
      id: '1',
      title: 'Updated Title',
      body: 'Updated content',
    });
    expect(savedNotes[0].modifiedAt).not.toEqual(mockNote.modifiedAt);
  });

  it('should delete a note', async () => {
    mockGetAllNotes.mockResolvedValue([mockNote]);
    mockSaveAllNotes.mockResolvedValue();

    const { result } = renderHook(() => useNotesApi());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteNote('1');
    });

    expect(mockSaveAllNotes).toHaveBeenCalledWith([]);
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
    mockSaveAllNotes.mockResolvedValue();

    const { result } = renderHook(() => useNotesApi());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.clearAllNotes();
    });

    expect(mockSaveAllNotes).toHaveBeenCalledWith([]);
  });

  it('should handle save errors', async () => {
    mockGetAllNotes.mockResolvedValue([]);
    mockSaveAllNotes.mockRejectedValue(new Error('Save failed'));

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
