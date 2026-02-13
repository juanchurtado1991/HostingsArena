import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { i18n } from './i18n-config';

// 1. Get locale function
function getLocale(request: NextRequest): string {
    // Negotiator expects plain object so we need to transform headers
    const negotiatorHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

    // @ts-ignore locales are readonly
    const locales: string[] = i18n.locales;

    // Use negotiator and intl-localematcher to get best locale
    let languages = new Negotiator({ headers: negotiatorHeaders }).languages(
        locales
    );

    const locale = matchLocale(languages, locales, i18n.defaultLocale);

    return locale;
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
        let supabaseResponse = NextResponse.next({
            request,
        });

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
