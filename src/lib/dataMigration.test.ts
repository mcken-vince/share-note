import { migrateLegacyNotes, needsMigration, safelyMigrateNotes } from './dataMigration';

// Mock generateId
jest.mock('./generateId', () => ({
  generateId: jest.fn(() => 'mock-id-123'),
}));

describe('dataMigration', () => {
  const legacyNote = {
    title: 'Test Note',
    type: 'note' as const,
    body: 'Test content',
    tags: ['test'],
    createdAt: new Date('2023-01-01'),
    modifiedAt: new Date('2023-01-02'),
  };

  const modernNote = {
    id: 'existing-id',
    title: 'Modern Note',
    type: 'note' as const,
    body: 'Modern content',
    tags: ['modern'],
    createdAt: new Date('2023-01-01'),
    modifiedAt: new Date('2023-01-02'),
  };

  describe('migrateLegacyNotes', () => {
    it('should add ID to legacy notes', () => {
      const result = migrateLegacyNotes([legacyNote]);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        ...legacyNote,
        id: 'mock-id-123',
      });
    });

    it('should handle multiple notes', () => {
      const result = migrateLegacyNotes([legacyNote, legacyNote]);
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('mock-id-123');
      expect(result[1].id).toBe('mock-id-123');
    });

    it('should preserve all original properties', () => {
      const result = migrateLegacyNotes([legacyNote]);
      
      expect(result[0].title).toBe(legacyNote.title);
      expect(result[0].type).toBe(legacyNote.type);
      expect(result[0].body).toBe(legacyNote.body);
      expect(result[0].tags).toEqual(legacyNote.tags);
      expect(result[0].createdAt).toBe(legacyNote.createdAt);
      expect(result[0].modifiedAt).toBe(legacyNote.modifiedAt);
    });
  });

  describe('needsMigration', () => {
    it('should return true for notes without ID', () => {
      const result = needsMigration([legacyNote]);
      expect(result).toBe(true);
    });

    it('should return false for notes with ID', () => {
      const result = needsMigration([modernNote]);
      expect(result).toBe(false);
    });

    it('should return false for empty array', () => {
      const result = needsMigration([]);
      expect(result).toBe(false);
    });

    it('should return false if first note has ID', () => {
      const result = needsMigration([modernNote, legacyNote]);
      expect(result).toBe(false);
    });
  });

  describe('safelyMigrateNotes', () => {
    it('should migrate legacy notes', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const result = safelyMigrateNotes([legacyNote]);
      
      expect(consoleSpy).toHaveBeenCalledWith('Migrating notes to new format...');
      expect(result[0].id).toBe('mock-id-123');
      
      consoleSpy.mockRestore();
    });

    it('should return modern notes unchanged', () => {
      const result = safelyMigrateNotes([modernNote]);
      
      expect(result).toEqual([modernNote]);
    });

    it('should handle empty array', () => {
      const result = safelyMigrateNotes([]);
      
      expect(result).toEqual([]);
    });

    it('should handle mixed arrays (modern format takes precedence)', () => {
      const result = safelyMigrateNotes([modernNote, legacyNote]);
      
      expect(result).toEqual([modernNote, legacyNote]);
    });
  });
});
