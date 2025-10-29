import type { Note } from '@/types';

/**
 * Service class for managing notes via API calls
 */
export class NotesService {
  private static readonly API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL  || 'http://localhost:3000/api') + '/notes';

  /**
   * Fetches all notes from the server
   */
  static async getAllNotes(token: string): Promise<Note[]> {
    try {
      const response = await fetch(this.API_BASE_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch notes: ${response.statusText}`);
      }

      const data = await response.json();
      // Notes are already deserialized by the API
      return data;
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  }

  /**
   * Saves all notes to the server
   * @deprecated Use createNote or updateNote instead for individual note operations
   */
  static async saveAllNotes(token: string, notes: Note[]): Promise<void> {
    try {
      const response = await fetch(this.API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save notes: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error('Server reported save failure');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      throw error;
    }
  }

  /**
   * Creates a new note
   */
  static async createNote(
    token: string,
    noteData: {
      title: string;
      type: 'note' | 'checklist';
      tags?: string[];
      body?: string;
      items?: Array<{ checked: boolean; body: string }>;
    }
  ): Promise<Note> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(noteData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create note: ${response.statusText}`);
      }

      const data = await response.json();
      return data.note;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  }

  /**
   * Updates an existing note
   */
  static async updateNote(
    token: string,
    noteId: string,
    updates: Partial<Omit<Note, 'id' | 'userId' | 'createdAt'>>
  ): Promise<Note> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/${noteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update note: ${response.statusText}`);
      }

      const data = await response.json();
      return data.note;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }

  /**
   * Deletes a note
   */
  static async deleteNote(token: string, noteId: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete note: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }
}
