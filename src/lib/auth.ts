import { NextRequest } from 'next/server';
import { UserService } from '@/services/UserService';
import { User } from '@/types';

/**
 * Extracts and verifies the user from the request
 */
export function getUserFromRequest(request: NextRequest): User | null {
  const authorization = request.headers.get('authorization');
  
  if (!authorization || !authorization.startsWith('Bearer ')) {
    // Try to get token from cookies as fallback
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return null;
    }
    
    const userService = new UserService();
    return userService.verifyToken(token);
  }

  const token = authorization.substring(7);
  const userService = new UserService();
  return userService.verifyToken(token);
}
