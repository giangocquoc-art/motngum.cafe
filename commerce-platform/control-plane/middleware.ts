import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/session';

// Do not renew user JWTs on GET requests: doing so makes a stolen session indefinitely reusable.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/dashboard')) return NextResponse.next();
  const token = request.cookies.get('session')?.value;
  if (!token) return NextResponse.redirect(new URL('/sign-in', request.url));
  try {
    await verifyToken(token);
    // Business authorization and DB-backed session revocation are checked in getUser().
    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL('/sign-in', request.url));
    response.cookies.delete('session');
    return response;
  }
}

export const config = { matcher: ['/dashboard/:path*'], runtime: 'nodejs' };
