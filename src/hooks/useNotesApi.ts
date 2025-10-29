'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Note } from '@/types';
import { NotesService } from '@/services';
import { useAuth } from '@/context';

/**
 * Custom hook for managing notes with JSON file persistence via API
 */
export function useNotesApi() {
  const { user, token } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadNotes = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fetchedNotes = await NotesService.getAllNotes(token);
      console.log('Fetched notes:', fetchedNotes);
      setNotes(fetchedNotes);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load notes';
      setError(errorMessage);
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Load notes on mount
  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const saveNotes = useCallback(async (updatedNotes: Note[]) => {
    if (!token) {
      throw new Error('Authentication token required');
    }

    try {
      setSaveError(null);
      await NotesService.saveAllNotes(token, updatedNotes);
      setNotes(updatedNotes);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save notes';
      setSaveError(errorMessage);
      console.error('Error saving notes:', error);
      throw error;
    }
  }, [token]);

  const createNote = useCallback(async (noteData: {
    title: string;
    type: 'note' | 'checklist';
    tags: string[];
    body?: string;
    items?: Array<{ checked: boolean; body: string }>;
  }) => {
    if (!user || !token) {
      throw new Error('User must be logged in to create notes');
    }

    try {
      setSaveError(null);
      const newNote = await NotesService.createNote(token, noteData);
      // Add the new note to the local state
      setNotes(prevNotes => [...prevNotes, newNote]);
      return newNote;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create note';
      setSaveError(errorMessage);
      console.error('Error creating note:', error);
      throw error;
    }
  }, [user, token]);

  const updateNote = useCallback(async (noteId: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
    if (!token) {
      throw new Error('Authentication token required');
    }

    try {
      setSaveError(null);
      const updatedNote = await NotesService.updateNote(token, noteId, updates);
      // Update the note in the local state
      setNotes(prevNotes => 
        prevNotes.map(note => note.id === noteId ? updatedNote : note)
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update note';
      setSaveError(errorMessage);
      console.error('Error updating note:', error);
      throw error;
    }
  }, [token]);

  const deleteNote = useCallback(async (noteId: string) => {
    if (!token) {
      throw new Error('Authentication token required');
    }

    try {
      setSaveError(null);
      await NotesService.deleteNote(token, noteId);
      // Remove the note from the local state
      setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete note';
      setSaveError(errorMessage);
      console.error('Error deleting note:', error);
      throw error;
    }
  }, [token]);

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
