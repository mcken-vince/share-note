'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Note } from '@/types';
import { generateId } from '@/lib/generateId';
import { NotesService } from '@/services';

/**
 * Custom hook for managing notes with JSON file persistence via API
 */
export function useNotesApi() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Load notes on mount
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedNotes = await NotesService.getAllNotes();
      setNotes(fetchedNotes);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load notes';
      setError(errorMessage);
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveNotes = useCallback(async (updatedNotes: Note[]) => {
    try {
      setSaveError(null);
      await NotesService.saveAllNotes(updatedNotes);
      setNotes(updatedNotes);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save notes';
      setSaveError(errorMessage);
      console.error('Error saving notes:', error);
      throw error;
    }
  }, []);

  const createNote = useCallback(async (noteData: {
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
    
    const updatedNotes = [...notes, newNote];
    await saveNotes(updatedNotes);
    return newNote;
  }, [notes, saveNotes]);

  const updateNote = useCallback(async (noteId: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    const updatedNotes = notes.map(note => 
      note.id === noteId 
        ? { ...note, ...updates, modifiedAt: new Date() }
        : note
    );
    await saveNotes(updatedNotes);
  }, [notes, saveNotes]);

  const deleteNote = useCallback(async (noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    await saveNotes(updatedNotes);
  }, [notes, saveNotes]);

  const getNoteById = useCallback((noteId: string): Note | undefined => {
    return notes.find(note => note.id === noteId);
  }, [notes]);

  const clearAllNotes = useCallback(async () => {
    await saveNotes([]);
  }, [saveNotes]);

  const refetch = useCallback(() => {
    return loadNotes();
  }, [loadNotes]);

  return {
    notes,
    loading,
    error,
    saveError,
    createNote,
    updateNote,
    deleteNote,
    getNoteById,
    clearAllNotes,
    refetch,
  };
}
