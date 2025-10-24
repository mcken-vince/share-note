import { generateId } from './generateId';

describe('generateId', () => {
  let originalCrypto: any;

  beforeEach(() => {
    originalCrypto = global.crypto;
  });

  afterEach(() => {
    global.crypto = originalCrypto;
  });

  it('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    
    expect(id1).not.toBe(id2);
    expect(typeof id1).toBe('string');
    expect(typeof id2).toBe('string');
    expect(id1.length).toBeGreaterThan(0);
    expect(id2.length).toBeGreaterThan(0);
  });

  it('should use crypto.randomUUID when available', () => {
    const mockRandomUUID = jest.fn(() => 'mock-uuid-123');
    
    // Mock the global crypto object
    Object.defineProperty(global, 'crypto', {
      value: {
        randomUUID: mockRandomUUID,
      },
      writable: true,
      configurable: true,
    });

    const id = generateId();
    
    expect(mockRandomUUID).toHaveBeenCalled();
    expect(id).toBe('mock-uuid-123');
  });

  it('should use fallback when crypto.randomUUID is not available', () => {
    // Remove crypto entirely
    Object.defineProperty(global, 'crypto', {
      value: undefined,
      writable: true,
      configurable: true,
    });
    
    const id = generateId();
    
    expect(typeof id).toBe('string');
    expect(id).toMatch(/^\d+-[a-z0-9]+$/);
  });

  it('should generate different IDs when using fallback', () => {
    // Remove crypto entirely
    Object.defineProperty(global, 'crypto', {
      value: undefined,
      writable: true,
      configurable: true,
    });
    
    const id1 = generateId();
    const id2 = generateId();
    
    expect(id1).not.toBe(id2);
  });

  it('should handle case where crypto exists but randomUUID does not', () => {
    // Provide crypto object without randomUUID
    Object.defineProperty(global, 'crypto', {
      value: {},
      writable: true,
      configurable: true,
    });
    
    const id = generateId();
    
    expect(typeof id).toBe('string');
    expect(id).toMatch(/^\d+-[a-z0-9]+$/);
  });
});
