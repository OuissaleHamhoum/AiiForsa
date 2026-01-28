import { auth } from '@/auth';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Middleware for route protection and authentication
 *
 * Route Groups:
 * - (auth): Public authentication routes - redirects to "/" if already logged in
 * - (app): Protected app routes - redirects to "/login" if not authenticated
 */
export async function middleware(request: NextRequest) {
    let session;
    try {
        session = await auth();
    } catch {
        // If auth fails (e.g., API server down), treat as no session
        session = null;
    }
    const { pathname } = request.nextUrl;

    // Define auth routes (public - should redirect to "/" if logged in)
    const authRoutes = [
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
        '/error',
    ];
    const isAuthRoute = authRoutes.some(
        route => pathname === route || pathname.startsWith(`${route}/`),
    );

    // Define protected routes (all routes except auth routes require authentication)
    // This ensures users must be logged in to access any part of the app
    const isProtectedRoute = !isAuthRoute;

    // Check if user is authenticated (session exists and has user data)
    const isAuthenticated = session && session.user && session.user.email;

    // If user is authenticated and trying to access auth pages, redirect to home
    if (isAuthenticated && isAuthRoute) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // If user is not authenticated and trying to access protected routes, redirect to login
    if (!isAuthenticated && isProtectedRoute) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }
}

/**
 * Matcher configuration for middleware
 * Applies to all routes except API, static files, and public assets
 */
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public assets (svg, png, jpg, etc.)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
