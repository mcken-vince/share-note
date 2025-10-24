import { renderHook } from '@testing-library/react';
import { useNotes } from './useNotes';
import type { Note } from '@/types';
import { act } from 'react';

// Mock the localStorage hook
jest.mock('./useLocalStorage', () => ({
  useLocalStorage: jest.fn(),
}));

// Mock the utilities
jest.mock('@/lib/generateId', () => ({
  generateId: jest.fn(() => 'mock-id-123'),
}));

// Mock the sample data
jest.mock('@/lib/sampleData', () => ({
  createSampleNotes: jest.fn(() => []),
  shouldLoadSampleData: jest.fn(() => false),
}));

// Mock the data migration
jest.mock('@/lib/dataMigration', () => ({
  safelyMigrateNotes: jest.fn((notes) => notes),
}));

import { useLocalStorage } from './useLocalStorage';
import { generateId } from '@/lib/generateId';

const mockUseLocalStorage = useLocalStorage as jest.MockedFunction<typeof useLocalStorage>;
const mockGenerateId = generateId as jest.MockedFunction<typeof generateId>;

describe('useNotes', () => {
  let mockSetSerializedNotes: jest.Mock;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetSerializedNotes = jest.fn();
    mockUseLocalStorage.mockReturnValue([[], mockSetSerializedNotes]);
  });

  it('should initialize with empty notes array', () => {
    const { result } = renderHook(() => useNotes());
    
    expect(result.current.notes).toEqual([]);
    expect(mockUseLocalStorage).toHaveBeenCalledWith('share-note-app-notes', []);
  });

  it('should create a new note', () => {
    const { result } = renderHook(() => useNotes());
    
    const noteData = {
      title: 'Test Note',
      type: 'note' as const,
      tags: ['test'],
      body: 'Test content',
    };

    act(() => {
      result.current.createNote(noteData);
    });

    expect(mockGenerateId).toHaveBeenCalled();
    expect(mockSetSerializedNotes).toHaveBeenCalled();
    
    // Verify the function passed to setSerializedNotes creates the correct note structure
    const setterFunction = mockSetSerializedNotes.mock.calls[0][0];
    const newNotes = setterFunction([]);
    
    expect(newNotes).toHaveLength(1);
    expect(newNotes[0]).toMatchObject({
      id: 'mock-id-123',
      title: 'Test Note',
      type: 'note',
      tags: ['test'],
      body: 'Test content',
    });
    expect(typeof newNotes[0].createdAt).toBe('string');
    expect(typeof newNotes[0].modifiedAt).toBe('string');
  });

  it('should create a checklist note with empty items', () => {
    const { result } = renderHook(() => useNotes());
    
    const noteData = {
      title: 'Test Checklist',
      type: 'checklist' as const,
      tags: ['test'],
    };

    act(() => {
      result.current.createNote(noteData);
    });

    const setterFunction = mockSetSerializedNotes.mock.calls[0][0];
    const newNotes = setterFunction([]);
    
    expect(newNotes[0]).toMatchObject({
      title: 'Test Checklist',
      type: 'checklist',
      items: [],
    });
  });

  it('should update an existing note', () => {
    // Mock existing notes in localStorage
    const existingNotes = [{
      id: 'note-1',
      title: 'Original Title',
      type: 'note',
      body: 'Original content',
      tags: ['original'],
      createdAt: '2023-01-01T00:00:00.000Z',
      modifiedAt: '2023-01-01T00:00:00.000Z',
    }];
    
    mockUseLocalStorage.mockReturnValue([existingNotes, mockSetSerializedNotes]);
    
    const { result } = renderHook(() => useNotes());
    
    act(() => {
      result.current.updateNote('note-1', { title: 'Updated Title', body: 'Updated content' });
    });

    expect(mockSetSerializedNotes).toHaveBeenCalled();
    
    const setterFunction = mockSetSerializedNotes.mock.calls[0][0];
    const updatedNotes = setterFunction(existingNotes);
    
    expect(updatedNotes).toHaveLength(1);
    expect(updatedNotes[0]).toMatchObject({
      id: 'note-1',
      title: 'Updated Title',
      body: 'Updated content',
      tags: ['original'], // Should preserve unchanged fields
    });
    // modifiedAt should be updated
    expect(updatedNotes[0].modifiedAt).not.toBe('2023-01-01T00:00:00.000Z');
  });

  it('should delete a note', () => {
    const existingNotes = [
      {
        id: 'note-1',
        title: 'Note 1',
        type: 'note',
        body: 'Content 1',
        tags: [],
        createdAt: '2023-01-01T00:00:00.000Z',
        modifiedAt: '2023-01-01T00:00:00.000Z',
      },
      {
        id: 'note-2',
        title: 'Note 2',
        type: 'note',
        body: 'Content 2',
        tags: [],
        createdAt: '2023-01-02T00:00:00.000Z',
        modifiedAt: '2023-01-02T00:00:00.000Z',
      },
    ];
    
    mockUseLocalStorage.mockReturnValue([existingNotes, mockSetSerializedNotes]);
    
    const { result } = renderHook(() => useNotes());
    
    act(() => {
      result.current.deleteNote('note-1');
    });

    expect(mockSetSerializedNotes).toHaveBeenCalled();
    
    const setterFunction = mockSetSerializedNotes.mock.calls[0][0];
    const remainingNotes = setterFunction(existingNotes);
    
    expect(remainingNotes).toHaveLength(1);
    expect(remainingNotes[0].id).toBe('note-2');
  });

  it('should clear all notes', () => {
    const { result } = renderHook(() => useNotes());
    
    act(() => {
      result.current.clearAllNotes();
    });

    expect(mockSetSerializedNotes).toHaveBeenCalledWith([]);
  });

  it('should get note by ID', () => {
    const existingNotes = [{
      id: 'note-1',
      title: 'Test Note',
      type: 'note',
      body: 'Test content',
      tags: ['test'],
      createdAt: '2023-01-01T00:00:00.000Z',
      modifiedAt: '2023-01-01T00:00:00.000Z',
    }];
    
    mockUseLocalStorage.mockReturnValue([existingNotes, mockSetSerializedNotes]);
    
    const { result } = renderHook(() => useNotes());
    
    // Should find the note
    expect(result.current.getNoteById('note-1')).toMatchObject({
      id: 'note-1',
      title: 'Test Note',
    });
    
    // Should return undefined for non-existent note
    expect(result.current.getNoteById('non-existent')).toBeUndefined();
  });

  it('should handle notes with Date objects properly', () => {
    const existingNotes = [{
      id: 'note-1',
      title: 'Test Note',
      type: 'note',
      body: 'Test content',
      tags: ['test'],
      createdAt: '2023-01-01T00:00:00.000Z',
      modifiedAt: '2023-01-01T00:00:00.000Z',
    }];
    
    mockUseLocalStorage.mockReturnValue([existingNotes, mockSetSerializedNotes]);
    
    const { result } = renderHook(() => useNotes());
    
    // Notes should have Date objects
    expect(result.current.notes[0].createdAt).toBeInstanceOf(Date);
    expect(result.current.notes[0].modifiedAt).toBeInstanceOf(Date);
  });
});
