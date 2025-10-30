import type { LoginCredentials, AuthResponse, User } from '@/types';
import { BaseService } from './BaseService';

/**
 * Service class for handling authentication via API calls
 */
export class AuthService extends BaseService {
  private static readonly ENDPOINT = '/auth';
  /**
   * Logs in a user with email and password
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(this.buildUrl(this.ENDPOINT, '/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Login failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }

  /**
   * Signs up a new user
   */
  static async signup(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    try {
      const response = await fetch(this.buildUrl(this.ENDPOINT, '/signup'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Signup failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error during signup:', error);
      throw error;
    }
  }

  /**
   * Verifies a JWT token and returns user data
   */
  static async verifyToken(token: string): Promise<AuthResponse> {
    try {
      const response = await fetch(this.buildUrl(this.ENDPOINT, '/verify'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Token verification failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error verifying token:', error);
      throw error;
    }
  }

  /**
   * Updates user profile information
   */
  static async updateProfile(token: string, updates: { firstName?: string; lastName?: string }): Promise<User> {
    try {
      const response = await fetch(this.buildUrl(this.ENDPOINT, '/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Profile update failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Changes user password
   */
  static async changePassword(token: string, newPassword: string): Promise<void> {
    try {
      const response = await fetch(this.buildUrl(this.ENDPOINT, '/change-password'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Password change failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
}
