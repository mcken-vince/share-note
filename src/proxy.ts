import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  const isAuthPage = request.nextUrl.pathname === '/login';
  const isProtectedPage = request.nextUrl.pathname.startsWith('/notes') || 
                          request.nextUrl.pathname.startsWith('/me');
  const isApiAuthRoute = request.nextUrl.pathname.startsWith('/api/auth');

  // If trying to access protected pages without token, redirect to home
  if (isProtectedPage && !token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If logged in and trying to access login page, redirect to notes
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/notes', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/notes/:path*', '/me/:path*', '/login'],
};
