import type { Note } from '@/types';

/**
 * Service class for managing notes via API calls
 */
export class NotesService {
  private static readonly API_BASE_URL = '/api/notes';

  /**
   * Fetches all notes from the server
   */
  static async getAllNotes(): Promise<Note[]> {
    try {
      const response = await fetch(this.API_BASE_URL);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch notes: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Notes are already deserialized by the API route
      return data.notes;
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  }

  /**
   * Saves all notes to the server
   */
  static async saveAllNotes(notes: Note[]): Promise<void> {
    try {
      const response = await fetch(this.API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
}
