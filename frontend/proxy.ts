import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    // Only handle root path '/' manually
    if (request.nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL('/en', request.url));
    }

    // Pass everything else through to Next.js router
    return NextResponse.next();
}

export const config = {
    matcher: '/',
};
