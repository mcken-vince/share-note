import { UserService } from './UserService';
import { User } from '@/types';

// Mock fetch globally
global.fetch = jest.fn();

describe('UserService', () => {
  const mockToken = 'mock-jwt-token';
  const mockUser: User = {
    id: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  describe('getUserById', () => {
    it('should fetch a user by ID', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ user: mockUser }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await UserService.getUserById(mockToken, 'user-123');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/user/user-123',
        {
          headers: {
            'Authorization': `Bearer ${mockToken}`,
          },
        }
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found (404)', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await UserService.getUserById(mockToken, 'nonexistent');

      expect(result).toBeNull();
    });

    it('should throw error for other failed requests', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(UserService.getUserById(mockToken, 'user-123')).rejects.toThrow(
        'Failed to fetch user: Internal Server Error'
      );
    });
  });

  describe('updateUser', () => {
    it('should update user profile', async () => {
      const updates = { firstName: 'Jane', lastName: 'Smith' };
      const updatedUser = { ...mockUser, ...updates };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ user: updatedUser }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await UserService.updateUser(mockToken, 'user-123', updates);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/user/user-123',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`,
          },
          body: JSON.stringify(updates),
        }
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw error if update fails', async () => {
      const mockResponse = {
        ok: false,
        statusText: 'Bad Request',
        json: jest.fn().mockResolvedValue({ error: 'Invalid data' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(
        UserService.updateUser(mockToken, 'user-123', { firstName: 'Jane' })
      ).rejects.toThrow('Invalid data');
    });
  });

  describe('updatePassword', () => {
    it('should update user password', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await UserService.updatePassword(
        mockToken,
        'user-123',
        'currentPass123',
        'newPass456'
      );

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/user/user-123/password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`,
          },
          body: JSON.stringify({
            currentPassword: 'currentPass123',
            newPassword: 'newPass456',
          }),
        }
      );
    });

    it('should throw error if password update fails', async () => {
      const mockResponse = {
        ok: false,
        statusText: 'Unauthorized',
        json: jest.fn().mockResolvedValue({ error: 'Current password is incorrect' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(
        UserService.updatePassword(mockToken, 'user-123', 'wrongPass', 'newPass')
      ).rejects.toThrow('Current password is incorrect');
    });
  });

  describe('pauseAccount', () => {
    it('should pause user account', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await UserService.pauseAccount(mockToken, 'user-123');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/user/user-123/pause',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mockToken}`,
          },
        }
      );
    });

    it('should throw error if pause fails', async () => {
      const mockResponse = {
        ok: false,
        statusText: 'Bad Request',
        json: jest.fn().mockResolvedValue({ error: 'Cannot pause account' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(UserService.pauseAccount(mockToken, 'user-123')).rejects.toThrow(
        'Cannot pause account'
      );
    });
  });

  describe('deleteAccount', () => {
    it('should delete user account', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await UserService.deleteAccount(mockToken, 'user-123', 'password123');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/user/user-123/delete',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`,
          },
          body: JSON.stringify({ password: 'password123' }),
        }
      );
    });

    it('should throw error if deletion fails', async () => {
      const mockResponse = {
        ok: false,
        statusText: 'Unauthorized',
        json: jest.fn().mockResolvedValue({ error: 'Incorrect password' }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(
        UserService.deleteAccount(mockToken, 'user-123', 'wrongpass')
      ).rejects.toThrow('Incorrect password');
    });
  });
});
