import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionCookie = getSessionCookie(req);
  const isAuthenticated = !!sessionCookie;

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/settings'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.gif$).*)',
  ],
};
