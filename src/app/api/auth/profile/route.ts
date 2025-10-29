import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { UserService } from '@/services/UserService';

/**
 * PUT /api/auth/profile - Update user profile information
 */
export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { firstName, lastName } = body;

    // Validate input
    if (!firstName && !lastName) {
      return NextResponse.json(
        { error: 'At least one field (firstName or lastName) is required' },
        { status: 400 }
      );
    }

    const userService = new UserService();

    // Update user profile
    const updatedUser = await userService.updateUser(user.id, {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
    });

    return NextResponse.json({
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    
    if (error.message === 'User not found') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}