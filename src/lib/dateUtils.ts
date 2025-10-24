/**
 * Converts a Note object with Date objects to a serializable format
 */
export function serializeNote<T extends { createdAt: Date; modifiedAt: Date; deletedAt?: Date }>(
  note: T
): Omit<T, 'createdAt' | 'modifiedAt' | 'deletedAt'> & {
  createdAt: string;
  modifiedAt: string;
  deletedAt?: string;
} {
  return {
    ...note,
    createdAt: new Date(note.createdAt).toISOString(),
    modifiedAt: new Date(note.modifiedAt).toISOString(),
    deletedAt: note.deletedAt ? new Date(note.deletedAt).toISOString() : undefined,
  };
}

/**
 * Converts a serialized Note object back to one with Date objects
 */
export function deserializeNote<T extends { createdAt: string; modifiedAt: string; deletedAt?: string }>(
  serializedNote: T
): Omit<T, 'createdAt' | 'modifiedAt' | 'deletedAt'> & {
  createdAt: Date;
  modifiedAt: Date;
  deletedAt?: Date;
} {
  return {
    ...serializedNote,
    createdAt: new Date(serializedNote.createdAt),
    modifiedAt: new Date(serializedNote.modifiedAt),
    deletedAt: serializedNote.deletedAt ? new Date(serializedNote.deletedAt) : undefined,
  };
}

/**
 * Serializes an array of notes
 */
export function serializeNotes<T extends { createdAt: Date; modifiedAt: Date; deletedAt?: Date }>(
  notes: T[]
): Array<Omit<T, 'createdAt' | 'modifiedAt' | 'deletedAt'> & {
  createdAt: string;
  modifiedAt: string;
  deletedAt?: string;
}> {
  return notes.map(serializeNote);
}

/**
 * Deserializes an array of notes
 */
export function deserializeNotes<T extends { createdAt: string; modifiedAt: string; deletedAt?: string }>(
  serializedNotes: T[]
): Array<Omit<T, 'createdAt' | 'modifiedAt' | 'deletedAt'> & {
  createdAt: Date;
  modifiedAt: Date;
  deletedAt?: Date;
}> {
  return serializedNotes.map(deserializeNote);
}
