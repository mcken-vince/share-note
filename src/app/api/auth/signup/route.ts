import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/UserService';

/**
 * POST /api/auth/signup - Register a new user and return JWT token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password } = body;

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Basic password validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const userService = new UserService();

    try {
      // Create the user
      const user = await userService.createUser({
        firstName,
        lastName,
        email,
        password,
      });

      // Generate JWT token
      const token = userService.generateToken(user);

      return NextResponse.json({
        token,
        user,
      });
    } catch (error: any) {
      if (error.message.includes('User with this email already exists')) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}