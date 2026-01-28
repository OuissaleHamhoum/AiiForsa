import { auth } from '@/auth';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Middleware for route protection and authentication
 *
 * Route Groups:
 * - (auth): Public authentication routes - redirects to "/dashboard" if already logged in
 * - (business): Protected business routes - redirects to "/login" if not authenticated or not a business user
 *
 * This application is restricted to BUSINESS users only
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

    // Check if user has business role
    const isBusinessUser = session?.user?.role === 'BUSINESS';

    // If user is authenticated and trying to access auth pages, redirect to business dashboard
    if (isAuthenticated && isAuthRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If authenticated but not a business user, redirect to login with error
    if (isAuthenticated && !isBusinessUser && isProtectedRoute) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(loginUrl);
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
