import type { Note } from '@/types';

/**
 * Type for notes that might have string or Date objects for date fields
 */
type MixedNote = Omit<Note, 'createdAt' | 'modifiedAt' | 'deletedAt'> & {
  createdAt: Date | string;
  modifiedAt: Date | string;
  deletedAt?: Date | string;
};

/**
 * Safely serializes a note, handling both Date objects and date strings
 */
export function safeSerializeNote(note: MixedNote): Omit<Note, 'createdAt' | 'modifiedAt' | 'deletedAt'> & {
  createdAt: string;
  modifiedAt: string;
  deletedAt?: string;
} {
  return {
    ...note,
    createdAt: note.createdAt instanceof Date ? note.createdAt.toISOString() : note.createdAt,
    modifiedAt: note.modifiedAt instanceof Date ? note.modifiedAt.toISOString() : note.modifiedAt,
    deletedAt: note.deletedAt 
      ? (note.deletedAt instanceof Date ? note.deletedAt.toISOString() : note.deletedAt)
      : undefined,
  };
}

/**
 * Safely serializes an array of notes
 */
export function safeSerializeNotes(notes: MixedNote[]) {
  return notes.map(safeSerializeNote);
}

/**
 * Ensures a note has proper Date objects (converts strings if necessary)
 */
export function ensureNoteDateObjects(note: MixedNote): Note {
  return {
    ...note,
    createdAt: note.createdAt instanceof Date ? note.createdAt : new Date(note.createdAt),
    modifiedAt: note.modifiedAt instanceof Date ? note.modifiedAt : new Date(note.modifiedAt),
    deletedAt: note.deletedAt 
      ? (note.deletedAt instanceof Date ? note.deletedAt : new Date(note.deletedAt))
      : undefined,
  };
}
