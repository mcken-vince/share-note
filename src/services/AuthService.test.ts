import { AuthService } from './AuthService';
import type { LoginCredentials, AuthResponse, User } from '@/types';

// Mock fetch globally
global.fetch = jest.fn();

describe('AuthService', () => {
  const mockUser: User = {
    id: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  };

  const mockAuthResponse: AuthResponse = {
    token: 'mock-jwt-token',
    user: mockUser,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  describe('login', () => {
    const credentials: LoginCredentials = {
      email: 'john@example.com',
      password: 'password123',
    };

    it('should login successfully with valid credentials', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockAuthResponse),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await AuthService.login(credentials);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        }
      );
      expect(result).toEqual(mockAuthResponse);
      expect(result.token).toBe('mock-jwt-token');
      expect(result.user.email).toBe('john@example.com');
    });

    it('should throw error with invalid credentials', async () => {
      const mockResponse = {
        ok: false,
        statusText: 'Unauthorized',
        json: jest.fn().mockResolvedValue({ error: 'Invalid email or password' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(AuthService.login(credentials)).rejects.toThrow(
        'Invalid email or password'
      );
    });

    it('should throw error when response json parsing fails', async () => {
      const mockResponse = {
        ok: false,
        statusText: 'Bad Request',
        json: jest.fn().mockRejectedValue(new Error('JSON parse error')),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(AuthService.login(credentials)).rejects.toThrow(
        'Login failed: Bad Request'
      );
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(AuthService.login(credentials)).rejects.toThrow('Network error');
    });
  });

  describe('signup', () => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    it('should signup successfully with valid data', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockAuthResponse),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await AuthService.signup(userData);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/auth/signup',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        }
      );
      expect(result).toEqual(mockAuthResponse);
      expect(result.token).toBe('mock-jwt-token');
      expect(result.user).toEqual(mockUser);
    });

    it('should throw error when email already exists', async () => {
      const mockResponse = {
        ok: false,
        statusText: 'Conflict',
        json: jest.fn().mockResolvedValue({ error: 'Email already registered' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(AuthService.signup(userData)).rejects.toThrow(
        'Email already registered'
      );
    });

    it('should throw error with invalid data', async () => {
      const mockResponse = {
        ok: false,
        statusText: 'Bad Request',
        json: jest.fn().mockResolvedValue({ error: 'Invalid user data' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(AuthService.signup(userData)).rejects.toThrow('Invalid user data');
    });

    it('should handle network errors during signup', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(AuthService.signup(userData)).rejects.toThrow('Network error');
    });
  });

  describe('verifyToken', () => {
    const token = 'valid-jwt-token';

    it('should verify valid token successfully', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockAuthResponse),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await AuthService.verifyToken(token);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/auth/verify',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      expect(result).toEqual(mockAuthResponse);
      expect(result.user).toEqual(mockUser);
    });

    it('should throw error with invalid token', async () => {
      const mockResponse = {
        ok: false,
        statusText: 'Unauthorized',
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(AuthService.verifyToken('invalid-token')).rejects.toThrow(
        'Token verification failed: Unauthorized'
      );
    });

    it('should throw error with expired token', async () => {
      const mockResponse = {
        ok: false,
        statusText: 'Unauthorized',
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(AuthService.verifyToken('expired-token')).rejects.toThrow(
        'Token verification failed'
      );
    });

    it('should handle network errors during verification', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(AuthService.verifyToken(token)).rejects.toThrow('Network error');
    });
  });

  describe('updateProfile', () => {
    const token = 'valid-jwt-token';
    const updates = { firstName: 'Jane', lastName: 'Smith' };

    it('should update profile successfully', async () => {
      const updatedUser = { ...mockUser, ...updates };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ user: updatedUser }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await AuthService.updateProfile(token, updates);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/auth/profile',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        }
      );
      expect(result).toEqual(updatedUser);
      expect(result.firstName).toBe('Jane');
      expect(result.lastName).toBe('Smith');
    });

    it('should throw error with invalid token', async () => {
      const mockResponse = {
        ok: false,
        statusText: 'Unauthorized',
        json: jest.fn().mockResolvedValue({ error: 'Invalid token' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(AuthService.updateProfile('invalid-token', updates)).rejects.toThrow(
        'Invalid token'
      );
    });

    it('should throw error with invalid update data', async () => {
      const mockResponse = {
        ok: false,
        statusText: 'Bad Request',
        json: jest.fn().mockResolvedValue({ error: 'Invalid profile data' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(AuthService.updateProfile(token, updates)).rejects.toThrow(
        'Invalid profile data'
      );
    });

    it('should handle partial updates', async () => {
      const partialUpdate = { firstName: 'Jane' };
      const updatedUser = { ...mockUser, firstName: 'Jane' };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ user: updatedUser }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await AuthService.updateProfile(token, partialUpdate);

      expect(result.firstName).toBe('Jane');
      expect(result.lastName).toBe('Doe'); // unchanged
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(AuthService.updateProfile(token, updates)).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('changePassword', () => {
    const token = 'valid-jwt-token';
    const newPassword = 'newPassword456';

    it('should change password successfully', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await AuthService.changePassword(token, newPassword);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/auth/change-password',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ password: newPassword }),
        }
      );
    });

    it('should throw error with invalid token', async () => {
      const mockResponse = {
        ok: false,
        statusText: 'Unauthorized',
        json: jest.fn().mockResolvedValue({ error: 'Invalid token' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(
        AuthService.changePassword('invalid-token', newPassword)
      ).rejects.toThrow('Invalid token');
    });

    it('should throw error with weak password', async () => {
      const mockResponse = {
        ok: false,
        statusText: 'Bad Request',
        json: jest.fn().mockResolvedValue({ error: 'Password too weak' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(AuthService.changePassword(token, '123')).rejects.toThrow(
        'Password too weak'
      );
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(AuthService.changePassword(token, newPassword)).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle error when json parsing fails', async () => {
      const mockResponse = {
        ok: false,
        statusText: 'Internal Server Error',
        json: jest.fn().mockRejectedValue(new Error('JSON parse error')),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(AuthService.changePassword(token, newPassword)).rejects.toThrow(
        'Password change failed: Internal Server Error'
      );
    });
  });

  describe('API URL configuration', () => {
    it('should use default API URL when env var not set', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_API_URL;
      delete process.env.NEXT_PUBLIC_API_URL;

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockAuthResponse),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await AuthService.login({ email: 'test@test.com', password: 'test' });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/auth/login',
        expect.any(Object)
      );

      // Restore
      if (originalEnv) process.env.NEXT_PUBLIC_API_URL = originalEnv;
    });
  });

  describe('error handling consistency', () => {
    it('should log errors to console', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockResponse = {
        ok: false,
        statusText: 'Bad Request',
        json: jest.fn().mockResolvedValue({ error: 'Test error' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      try {
        await AuthService.login({ email: 'test@test.com', password: 'test' });
      } catch (error) {
        // Expected to throw
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error during login:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});
