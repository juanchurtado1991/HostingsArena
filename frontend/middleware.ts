import { NextResponse, type NextRequest } from 'next/server'
import { i18n } from './i18n-config';

// 1. Get locale function
function getLocale(request: NextRequest): string {
    try {
        const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
        if (cookieLocale && i18n.locales.includes(cookieLocale as any)) {
            return cookieLocale;
        }

        const acceptLanguage = request.headers.get('accept-language');
        if (acceptLanguage) {
            const preferredLocales = acceptLanguage
                .split(',')
                .map(part => part.split(';')[0].trim())
                .map(part => part.split('-')[0]);

            for (const lang of preferredLocales) {
                if (i18n.locales.includes(lang as any)) {
                    return lang;
                }
            }
        }

        return i18n.defaultLocale;
    } catch (error) {
        console.error("[Proxy] getLocale error:", error);
        return i18n.defaultLocale;
    }
}

/**
 * Check if the user has a valid Supabase session cookie.
 * This is a LIGHTWEIGHT check (no Supabase client, no network calls).
 * The real auth validation happens server-side in the dashboard/API routes.
 */
function hasSupabaseSession(request: NextRequest): boolean {
    const cookies = request.cookies.getAll();
    // Supabase stores auth tokens in cookies with names like:
    // sb-<project-ref>-auth-token or sb-<project-ref>-auth-token.0, .1, etc.
    return cookies.some(cookie =>
        cookie.name.includes('-auth-token') && cookie.value.length > 0
    );
}

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    try {
        // 0. EXCLUSIONS: Identify static assets, API (non-admin), and auth routes
        const isExcluded =
            pathname.startsWith('/api') && !pathname.startsWith('/api/admin') ||
            pathname.startsWith('/_next') ||
            pathname.startsWith('/auth') ||
            pathname.startsWith('/static') ||
            pathname.includes('.') ||
            pathname === '/favicon.ico';

        if (isExcluded) {
            return NextResponse.next();
        }

        // --------------------------------------------------------------------------
        // AUTH LOGIC (Only for protected routes: /dashboard, /api/admin)
        // Lightweight cookie check — no Supabase client, no __dirname issues
        // --------------------------------------------------------------------------
        const isDashboardPath = pathname === '/dashboard' || pathname.startsWith('/dashboard/') ||
            /^\/(en|es)\/dashboard(\/.*)?$/.test(pathname);
        const isAdminApiPath = pathname.startsWith('/api/admin');

        if (isDashboardPath || isAdminApiPath) {
            const hasSession = hasSupabaseSession(request);

            if (!hasSession) {
                if (isAdminApiPath) {
                    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
                }
                const url = request.nextUrl.clone();
                url.pathname = '/login';
                return NextResponse.redirect(url);
            }

            // User has a session cookie — let them through.
            // Server-side components/API routes will do full auth validation.
            return NextResponse.next();
        }

        // --------------------------------------------------------------------------
        // I18N LOGIC (For public routes)
        // --------------------------------------------------------------------------
        const pathnameIsMissingLocale = i18n.locales.every(
            (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
        );

        if (pathnameIsMissingLocale) {
            const locale = getLocale(request);
            return NextResponse.redirect(
                new URL(`/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url)
            );
        }

        return NextResponse.next();

    } catch (error) {
        console.error(`🔥 [Proxy] CRITICAL ERROR [${pathname}]:`, error);
        return NextResponse.next();
    }
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
