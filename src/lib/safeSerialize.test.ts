import { safeSerializeNote, safeSerializeNotes, ensureNoteDateObjects } from './safeSerialize';

describe('safeSerialize', () => {
  const mockDate = new Date('2023-01-01T00:00:00.000Z');
  const mockDateString = '2023-01-01T00:00:00.000Z';

  describe('safeSerializeNote', () => {
    it('should serialize note with Date objects', () => {
      const note = {
        id: '1',
        title: 'Test Note',
        type: 'note' as const,
        body: 'Test content',
        tags: ['test'],
        createdAt: mockDate,
        modifiedAt: mockDate,
      };

      const result = safeSerializeNote(note);

      expect(result.createdAt).toBe(mockDateString);
      expect(result.modifiedAt).toBe(mockDateString);
      expect(typeof result.createdAt).toBe('string');
      expect(typeof result.modifiedAt).toBe('string');
    });

    it('should handle note with string dates', () => {
      const note = {
        id: '1',
        title: 'Test Note',
        type: 'note' as const,
        body: 'Test content',
        tags: ['test'],
        createdAt: mockDateString,
        modifiedAt: mockDateString,
      };

      const result = safeSerializeNote(note);

      expect(result.createdAt).toBe(mockDateString);
      expect(result.modifiedAt).toBe(mockDateString);
    });

    it('should handle optional deletedAt with Date object', () => {
      const note = {
        id: '1',
        title: 'Test Note',
        type: 'note' as const,
        body: 'Test content',
        tags: ['test'],
        createdAt: mockDate,
        modifiedAt: mockDate,
        deletedAt: mockDate,
      };

      const result = safeSerializeNote(note);

      expect(result.deletedAt).toBe(mockDateString);
    });

    it('should handle optional deletedAt with string', () => {
      const note = {
        id: '1',
        title: 'Test Note',
        type: 'note' as const,
        body: 'Test content',
        tags: ['test'],
        createdAt: mockDate,
        modifiedAt: mockDate,
        deletedAt: mockDateString,
      };

      const result = safeSerializeNote(note);

      expect(result.deletedAt).toBe(mockDateString);
    });

    it('should handle missing deletedAt', () => {
      const note = {
        id: '1',
        title: 'Test Note',
        type: 'note' as const,
        body: 'Test content',
        tags: ['test'],
        createdAt: mockDate,
        modifiedAt: mockDate,
      };

      const result = safeSerializeNote(note);

      expect(result.deletedAt).toBeUndefined();
    });
  });

  describe('safeSerializeNotes', () => {
    it('should serialize array of notes', () => {
      const notes = [
        {
          id: '1',
          title: 'Note 1',
          type: 'note' as const,
          body: 'Content 1',
          tags: ['test1'],
          createdAt: mockDate,
          modifiedAt: mockDate,
        },
        {
          id: '2',
          title: 'Note 2',
          type: 'checklist' as const,
          items: [],
          tags: ['test2'],
          createdAt: mockDateString,
          modifiedAt: mockDateString,
        },
      ];

      const result = safeSerializeNotes(notes);

      expect(result).toHaveLength(2);
      expect(result[0].createdAt).toBe(mockDateString);
      expect(result[1].createdAt).toBe(mockDateString);
    });
  });

  describe('ensureNoteDateObjects', () => {
    it('should convert string dates to Date objects', () => {
      const note = {
        id: '1',
        title: 'Test Note',
        type: 'note' as const,
        body: 'Test content',
        tags: ['test'],
        createdAt: mockDateString,
        modifiedAt: mockDateString,
        deletedAt: mockDateString,
      };

      const result = ensureNoteDateObjects(note);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.modifiedAt).toBeInstanceOf(Date);
      expect(result.deletedAt).toBeInstanceOf(Date);
      expect(result.createdAt.toISOString()).toBe(mockDateString);
    });

    it('should preserve Date objects', () => {
      const note = {
        id: '1',
        title: 'Test Note',
        type: 'note' as const,
        body: 'Test content',
        tags: ['test'],
        createdAt: mockDate,
        modifiedAt: mockDate,
      };

      const result = ensureNoteDateObjects(note);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.modifiedAt).toBeInstanceOf(Date);
      expect(result.createdAt).toBe(mockDate);
    });
  });
});
