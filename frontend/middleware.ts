import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { match as matchLocale } from '@formatjs/intl-localematcher';
// import Negotiator from 'negotiator';
import { i18n } from './i18n-config';

// 1. Get locale function
function getLocale(request: NextRequest): string {
    try {
        // Simple manual locale detection for Edge Runtime compatibility
        // 1. Check cookies
        const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
        if (cookieLocale && i18n.locales.includes(cookieLocale as any)) {
            return cookieLocale;
        }

        // 2. Check Accept-Language header
        const acceptLanguage = request.headers.get('accept-language');
        if (acceptLanguage) {
            // Very basic parsing: "es-ES,es;q=0.9,en;q=0.8" -> ["es-ES", "es", "en"]
            const preferredLocales = acceptLanguage
                .split(',')
                .map(part => part.split(';')[0].trim())
                .map(part => part.split('-')[0]); // simplified to base language (es-ES -> es)

            for (const lang of preferredLocales) {
                if (i18n.locales.includes(lang as any)) {
                    return lang;
                }
            }
        }

        return i18n.defaultLocale;
    } catch (error) {
        console.error("Middleware getLocale error:", error);
        return i18n.defaultLocale;
    }
}

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // 0. EXCLUSIONS: Identify static assets, API, and Dashboard (Admin) routes
    // These routes should NOT be internationalized.
    const isExcluded =
        pathname.startsWith('/api') && !pathname.startsWith('/api/admin') || // Exclude public APIs, keep admin APIs for auth
        pathname.startsWith('/_next') ||
        pathname.startsWith('/auth') ||
        pathname.startsWith('/static') ||
        pathname.includes('.') || // files (images, favicon, etc)
        pathname === '/favicon.ico';

    // --------------------------------------------------------------------------
    // AUTH LOGIC (Only for protected routes: /dashboard, /api/admin)
    // --------------------------------------------------------------------------
    const isDashboardPath = pathname === '/dashboard' || pathname.startsWith('/dashboard/') ||
        /^\/(en|es)\/dashboard(\/.*)?$/.test(pathname);
    const isAdminApiPath = pathname.startsWith('/api/admin');

    if (isDashboardPath || isAdminApiPath) {
        // SAFEGUARD: Check for Supabase Env Vars
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.error("CRITICAL: Missing Supabase Environment Variables in Middleware");
            // If in admin API, return JSON error
            if (isAdminApiPath) {
                return NextResponse.json({ error: 'Server Configuration Error: Missing Env Vars' }, { status: 500 });
            }
            // If in dashboard, redirect to home or show error (for now redirect to home to avoid loop)
            return NextResponse.redirect(new URL('/', request.url));
        }

        let supabaseResponse = NextResponse.next({
            request,
        });

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            request.cookies.set(name, value)
                        );
                        supabaseResponse = NextResponse.next({
                            request,
                        });
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        );
                    },
                },
            }
        );

        // Very important: Refresh session
        const {
            data: { user },
        } = await supabase.auth.getUser();

        // 1. Check Auth (Must be logged in)
        if (!user) {
            if (pathname.startsWith('/api/admin')) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            const url = request.nextUrl.clone();
            url.pathname = '/login';
            return NextResponse.redirect(url);
        }

        // 2. Check Role (Must be Admin)
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            if (pathname.startsWith('/api/admin')) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
            const url = request.nextUrl.clone();
            url.pathname = '/'; // send non-admins to home
            return NextResponse.redirect(url);
        }

        return supabaseResponse;
    }

    // --------------------------------------------------------------------------
    // I18N LOGIC (For public routes)
    // --------------------------------------------------------------------------
    if (isExcluded) {
        return NextResponse.next();
    }

    // Check if there is any supported locale in the pathname
    const pathnameIsMissingLocale = i18n.locales.every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );

    // Redirect if there is no locale
    if (pathnameIsMissingLocale) {
        const locale = getLocale(request);

        // e.g. incoming request is /products
        // The new URL is now /en/products
        return NextResponse.redirect(
            new URL(
                `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
                request.url
            )
        );
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
