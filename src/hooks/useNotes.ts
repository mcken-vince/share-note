'use client';

import { useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Note } from '@/types';
import { serializeNotes, deserializeNotes } from '@/lib/dateUtils';
import { generateId } from '@/lib/generateId';
import { safelyMigrateNotes } from '@/lib/dataMigration';
import { createSampleNotes, shouldLoadSampleData } from '@/lib/sampleData';

const NOTES_STORAGE_KEY = 'share-note-app-notes';

// Define the serialized note type for localStorage
type SerializedNote = Omit<Note, 'createdAt' | 'modifiedAt' | 'deletedAt'> & {
  createdAt: string;
  modifiedAt: string;
  deletedAt?: string;
};

/**
 * Custom hook for managing notes with localStorage persistence
 */
export function useNotes() {
  // Use localStorage with serialized notes, deserializing on retrieval
  const [serializedNotes, setSerializedNotes] = useLocalStorage<SerializedNote[]>(NOTES_STORAGE_KEY, []);
  
  // Convert serialized notes to actual Notes with Date objects and migrate if needed
  const rawNotes = deserializeNotes(serializedNotes);
  const notes = safelyMigrateNotes(rawNotes);
  
  // If migration happened, update localStorage with migrated data
  useEffect(() => {
    if (rawNotes.length !== notes.length || 
        (notes.length > 0 && rawNotes.length > 0 && rawNotes[0] !== notes[0])) {
      setSerializedNotes(serializeNotes(notes));
    }
  }, [rawNotes, notes, setSerializedNotes]);

  // Load sample data on first run
  useEffect(() => {
    if (shouldLoadSampleData(notes)) {
      setSerializedNotes(serializeNotes(createSampleNotes()));
    }
  }, [notes, setSerializedNotes]);

  const setNotes = useCallback((
    newNotes: Note[] | ((prevNotes: Note[]) => Note[])
  ) => {
    if (typeof newNotes === 'function') {
      setSerializedNotes(prevSerialized => {
        const prevNotes = deserializeNotes(prevSerialized);
        const updatedNotes = newNotes(prevNotes);
        return serializeNotes(updatedNotes);
      });
    } else {
      setSerializedNotes(serializeNotes(newNotes));
    }
  }, [setSerializedNotes]);

  const createNote = useCallback((noteData: {
    title: string;
    type: 'note' | 'checklist';
    tags: string[];
    body?: string;
    items?: Array<{ checked: boolean; body: string }>;
  }) => {
    const newNote: Note = {
      id: generateId(),
      title: noteData.title,
      type: noteData.type,
      items: noteData.items || (noteData.type === 'checklist' ? [] : undefined),
      body: noteData.body || (noteData.type === 'note' ? '' : undefined),
      tags: noteData.tags,
      createdAt: new Date(),
      modifiedAt: new Date(),
    };
    
    setNotes(prevNotes => [...prevNotes, newNote]);
    return newNote;
  }, [setNotes]);

  const updateNote = useCallback((noteId: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === noteId 
          ? { ...note, ...updates, modifiedAt: new Date() }
          : note
      )
    );
  }, [setNotes]);

  const deleteNote = useCallback((noteId: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
  }, [setNotes]);

  const getNoteById = useCallback((noteId: string): Note | undefined => {
    return notes.find(note => note.id === noteId);
  }, [notes]);

  const clearAllNotes = useCallback(() => {
    setNotes([]);
  }, [setNotes]);

  return {
    notes,
    createNote,
    updateNote,
    deleteNote,
    getNoteById,
    clearAllNotes,
  };
}
