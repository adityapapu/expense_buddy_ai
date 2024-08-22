import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { env } from "@/env";

export async function middleware(req: NextRequest) {
    // Retrieve the authentication token
    const token = await getToken({
        req,
        salt: env.NODE_ENV === 'production' ? '__Secure-authjs.session-token' : 'authjs.session-token',
        secret: env.AUTH_SECRET,
        secureCookie: env.NODE_ENV === 'production',
    });

    // Get the current pathname from the request URL
    const { pathname } = req.nextUrl;

    // Redirect unauthenticated users to the login page
    // Exception: Don't redirect if already on login or logout page
    if (!token && pathname !== '/login' && pathname !== "/logout") {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    // Redirect authenticated users trying to access the logout page to the home page
    if (token && pathname === '/logout') {
        return NextResponse.redirect(new URL('/', req.url));
    }

    // For all other cases, continue with the request as normal
    return NextResponse.next();
}

// Configuration for the middleware
export const config = {
    // Apply this middleware to all routes except those starting with api, _next/static, _next/image, or favicon.ico
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
