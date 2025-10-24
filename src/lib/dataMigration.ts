import type { Note } from '@/types';
import { generateId } from './generateId';

/**
 * Legacy note interface without ID field
 */
interface LegacyNote {
  title: string;
  type: 'note' | 'checklist';
  items?: Array<{ checked: boolean; body: string }>;
  body?: string;
  tags: string[];
  createdAt: Date;
  modifiedAt: Date;
  deletedAt?: Date;
}

/**
 * Migrates legacy notes (without ID) to the new format (with ID)
 */
export function migrateLegacyNotes(legacyNotes: LegacyNote[]): Note[] {
  return legacyNotes.map(note => ({
    ...note,
    id: generateId(),
  }));
}

/**
 * Checks if notes need migration (don't have ID field)
 */
export function needsMigration(notes: any[]): notes is LegacyNote[] {
  return notes.length > 0 && !notes[0].hasOwnProperty('id');
}

/**
 * Safely migrates notes if needed
 */
export function safelyMigrateNotes(notes: any[]): Note[] {
  if (needsMigration(notes)) {
    console.log('Migrating notes to new format...');
    return migrateLegacyNotes(notes);
  }
  return notes as Note[];
}
