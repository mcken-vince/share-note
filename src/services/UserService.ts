import { User } from '@/types';
import { BaseService } from './BaseService';

/**
 * Service class for managing user operations via API calls
 */
export class UserService extends BaseService {
  private static readonly ENDPOINT = '/user';
  /**
   * Gets user by ID
   */
  static async getUserById(token: string, userId: string): Promise<User | null> {
    try {
      const response = await fetch(this.buildUrl(this.ENDPOINT, `/${userId}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  /**
   * Updates user profile information
   */
  static async updateUser(
    token: string,
    userId: string,
    updates: { firstName?: string; lastName?: string }
  ): Promise<User> {
    try {
      const response = await fetch(this.buildUrl(this.ENDPOINT, `/${userId}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update user: ${response.statusText}`);
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Updates user password
   */
  static async updatePassword(
    token: string,
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const response = await fetch(this.buildUrl(this.ENDPOINT, `/${userId}/password`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update password: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  /**
   * Pauses user account (deactivates temporarily)
   */
  static async pauseAccount(token: string, userId: string): Promise<void> {
    try {
      const response = await fetch(this.buildUrl(this.ENDPOINT, `/${userId}/pause`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to pause account: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error pausing account:', error);
      throw error;
    }
  }

  /**
   * Deletes user account permanently
   */
  static async deleteAccount(token: string, userId: string, password: string): Promise<void> {
    try {
      const response = await fetch(this.buildUrl(this.ENDPOINT, `/${userId}/delete`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete account: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }
}
