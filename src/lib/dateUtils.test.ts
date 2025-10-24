import { serializeNote, deserializeNote, serializeNotes, deserializeNotes } from './dateUtils';

describe('dateUtils', () => {
  const mockNote = {
    id: '1',
    title: 'Test Note',
    type: 'note' as const,
    body: 'Test body',
    tags: ['test'],
    createdAt: new Date('2023-01-01T00:00:00.000Z'),
    modifiedAt: new Date('2023-01-02T00:00:00.000Z'),
  };

  const mockNoteWithDeletedAt = {
    ...mockNote,
    deletedAt: new Date('2023-01-03T00:00:00.000Z'),
  };

  const serializedNote = {
    id: '1',
    title: 'Test Note',
    type: 'note' as const,
    body: 'Test body',
    tags: ['test'],
    createdAt: '2023-01-01T00:00:00.000Z',
    modifiedAt: '2023-01-02T00:00:00.000Z',
  };

  const serializedNoteWithDeletedAt = {
    ...serializedNote,
    deletedAt: '2023-01-03T00:00:00.000Z',
  };

  describe('serializeNote', () => {
    it('should convert Date objects to ISO strings', () => {
      const result = serializeNote(mockNote);
      
      expect(result).toEqual(serializedNote);
      expect(typeof result.createdAt).toBe('string');
      expect(typeof result.modifiedAt).toBe('string');
    });

    it('should handle optional deletedAt field', () => {
      const result = serializeNote(mockNoteWithDeletedAt);
      
      expect(result).toEqual(serializedNoteWithDeletedAt);
      expect(typeof result.deletedAt).toBe('string');
    });

    it('should preserve all other properties', () => {
      const result = serializeNote(mockNote);
      
      expect(result.id).toBe(mockNote.id);
      expect(result.title).toBe(mockNote.title);
      expect(result.type).toBe(mockNote.type);
      expect(result.body).toBe(mockNote.body);
      expect(result.tags).toEqual(mockNote.tags);
    });
  });

  describe('deserializeNote', () => {
    it('should convert ISO strings back to Date objects', () => {
      const result = deserializeNote(serializedNote);
      
      expect(result).toEqual(mockNote);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.modifiedAt).toBeInstanceOf(Date);
    });

    it('should handle optional deletedAt field', () => {
      const result = deserializeNote(serializedNoteWithDeletedAt);
      
      expect(result).toEqual(mockNoteWithDeletedAt);
      expect(result.deletedAt).toBeInstanceOf(Date);
    });

    it('should preserve all other properties', () => {
      const result = deserializeNote(serializedNote);
      
      expect(result.id).toBe(serializedNote.id);
      expect(result.title).toBe(serializedNote.title);
      expect(result.type).toBe(serializedNote.type);
      expect(result.body).toBe(serializedNote.body);
      expect(result.tags).toEqual(serializedNote.tags);
    });
  });

  describe('serializeNotes', () => {
    it('should serialize an array of notes', () => {
      const notes = [mockNote, mockNoteWithDeletedAt];
      const result = serializeNotes(notes);
      
      expect(result).toEqual([serializedNote, serializedNoteWithDeletedAt]);
      expect(result).toHaveLength(2);
    });

    it('should handle empty array', () => {
      const result = serializeNotes([]);
      expect(result).toEqual([]);
    });
  });

  describe('deserializeNotes', () => {
    it('should deserialize an array of notes', () => {
      const serializedNotes = [serializedNote, serializedNoteWithDeletedAt];
      const result = deserializeNotes(serializedNotes);
      
      expect(result).toEqual([mockNote, mockNoteWithDeletedAt]);
      expect(result).toHaveLength(2);
      expect(result[0].createdAt).toBeInstanceOf(Date);
      expect(result[1].deletedAt).toBeInstanceOf(Date);
    });

    it('should handle empty array', () => {
      const result = deserializeNotes([]);
      expect(result).toEqual([]);
    });
  });

  describe('round trip conversion', () => {
    it('should maintain data integrity through serialize/deserialize cycle', () => {
      const original = mockNoteWithDeletedAt;
      const serialized = serializeNote(original);
      const deserialized = deserializeNote(serialized);
      
      expect(deserialized).toEqual(original);
    });

    it('should work with arrays', () => {
      const original = [mockNote, mockNoteWithDeletedAt];
      const serialized = serializeNotes(original);
      const deserialized = deserializeNotes(serialized);
      
      expect(deserialized).toEqual(original);
    });
  });
});
