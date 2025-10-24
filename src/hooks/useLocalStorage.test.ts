import { renderHook } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';
import { act } from 'react';
describe('useLocalStorage', () => {
  let mockLocalStorage: any;

  beforeEach(() => {
    // Ensure window exists (in case previous tests affected it)
    if (typeof window === 'undefined') {
      (global as any).window = {};
    }
    
    // Create a fresh mock for each test
    let store: Record<string, string> = {};
    mockLocalStorage = {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        store = {};
      }),
    };

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      configurable: true,
    });
  });

  afterEach(() => {
    // Clean up any module mocks
    jest.clearAllMocks();
  });

  it('should return initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'));
    
    expect(result.current[0]).toBe('initial-value');
  });

  it('should return stored value from localStorage', () => {
    mockLocalStorage.setItem('test-key', JSON.stringify('stored-value'));
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'));
    
    expect(result.current[0]).toBe('stored-value');
  });

  it('should update localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'));
    
    act(() => {
      result.current[1]('new-value');
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('new-value'));
    expect(result.current[0]).toBe('new-value');
  });

  it('should handle function updates', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 10));
    
    act(() => {
      result.current[1](prev => prev + 5);
    });

    expect(result.current[0]).toBe(15);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(15));
  });

  it('should handle complex objects', () => {
    const initialValue = { name: 'John', age: 30 };
    const { result } = renderHook(() => useLocalStorage('user', initialValue));
    
    const updatedValue = { name: 'Jane', age: 25 };
    
    act(() => {
      result.current[1](updatedValue);
    });

    expect(result.current[0]).toEqual(updatedValue);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(updatedValue));
  });

  it('should handle localStorage errors gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'));
    
    expect(result.current[0]).toBe('fallback');
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it('should handle setItem errors gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('localStorage setItem error');
    });
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    act(() => {
      result.current[1]('new-value');
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should handle SSR scenario gracefully', () => {
    // This test verifies that the hook works in browser environment
    // SSR-specific testing is done in useLocalStorage.ssr.test.ts
    const { result } = renderHook(() => useLocalStorage('test-key', 'ssr-initial'));
    
    expect(result.current[0]).toBe('ssr-initial');
    expect(typeof result.current[1]).toBe('function');
  });

  it('should handle invalid JSON in localStorage', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockLocalStorage.getItem.mockReturnValue('invalid-json{');
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'));
    
    expect(result.current[0]).toBe('fallback');
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
});
