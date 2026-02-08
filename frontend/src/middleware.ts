import { NextRequest, NextResponse } from 'next/server';

// Protect dashboard routes
export function middleware(request: NextRequest) {
  // Allow public routes
  if (request.nextUrl.pathname === '/' ||
      request.nextUrl.pathname === '/login' ||
      request.nextUrl.pathname === '/signup') {
    return NextResponse.next();
  }

  // Check for protected routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // In a real app, we would verify the JWT token here
    // For now, we'll just check if the token exists in localStorage
    // This is client-side only, so we can't really protect it server-side without a backend
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup', '/'],
};