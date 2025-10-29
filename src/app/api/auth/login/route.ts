import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/UserService';
import type { LoginCredentials } from '@/types';

/**
 * POST /api/auth/login - Authenticate user and return JWT token
 */
export async function POST(request: NextRequest) {
  try {
    const body: LoginCredentials = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const userService = new UserService();

    // Validate user credentials
    const user = await userService.validateUser({ email, password });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = userService.generateToken(user);

    return NextResponse.json({
      token,
      user,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}