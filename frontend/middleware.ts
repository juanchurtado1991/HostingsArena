import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
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

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const timestamp = new Date().toISOString();

    try {
        console.log(`[Proxy][${timestamp}] Start: ${pathname}`);

        // 0. EXCLUSIONS: Identify static assets, API, and Dashboard (Admin) routes
        const isExcluded =
            pathname.startsWith('/api') && !pathname.startsWith('/api/admin') ||
            pathname.startsWith('/_next') ||
            pathname.startsWith('/auth') ||
            pathname.startsWith('/static') ||
            pathname.includes('.') ||
            pathname === '/favicon.ico';

        if (isExcluded) {
            console.log(`[Proxy] Excluded: ${pathname}`);
            return NextResponse.next();
        }

        // --------------------------------------------------------------------------
        // AUTH LOGIC (Only for protected routes: /dashboard, /api/admin)
        // --------------------------------------------------------------------------
        const isDashboardPath = pathname === '/dashboard' || pathname.startsWith('/dashboard/') ||
            /^\/(en|es)\/dashboard(\/.*)?$/.test(pathname);
        const isAdminApiPath = pathname.startsWith('/api/admin');

        if (isDashboardPath || isAdminApiPath) {
            console.log(`[Proxy] Auth Check for: ${pathname}`);

            if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
                console.error("[Proxy] CRITICAL: Missing Supabase Env Vars");
                if (isAdminApiPath) {
                    return NextResponse.json({ error: 'Configuration Error' }, { status: 500 });
                }
                return NextResponse.redirect(new URL('/', request.url));
            }

            let supabaseResponse = NextResponse.next({ request });

            const supabase = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                {
                    cookies: {
                        getAll() {
                            return request.cookies.getAll();
                        },
                        setAll(cookiesToSet) {
                            cookiesToSet.forEach(({ name, value }) =>
                                request.cookies.set(name, value)
                            );
                            supabaseResponse = NextResponse.next({ request });
                            cookiesToSet.forEach(({ name, value, options }) =>
                                supabaseResponse.cookies.set(name, value, options)
                            );
                        },
                    },
                }
            );

            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                console.log(`[Proxy] Unauthorized access to: ${pathname}`);
                if (pathname.startsWith('/api/admin')) {
                    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
                }
                const url = request.nextUrl.clone();
                url.pathname = '/login';
                return NextResponse.redirect(url);
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile?.role !== 'admin') {
                console.log(`[Proxy] Forbidden access (non-admin) to: ${pathname}`);
                if (pathname.startsWith('/api/admin')) {
                    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
                }
                const url = request.nextUrl.clone();
                url.pathname = '/';
                return NextResponse.redirect(url);
            }

            console.log(`[Proxy] Auth Success: ${pathname}`);
            return supabaseResponse;
        }

        // --------------------------------------------------------------------------
        // I18N LOGIC (For public routes)
        // --------------------------------------------------------------------------
        const pathnameIsMissingLocale = i18n.locales.every(
            (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
        );

        if (pathnameIsMissingLocale) {
            const locale = getLocale(request);
            console.log(`[Proxy] Redirecting to locale [${locale}]: ${pathname}`);
            return NextResponse.redirect(
                new URL(`/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url)
            );
        }

        // IMPORTANT FIX: Return NextResponse.next() for localized paths that passed all checks
        console.log(`[Proxy] Finished: ${pathname} -> Proceeding`);
        return NextResponse.next();

    } catch (error) {
        console.error(`🔥 [Proxy] CRITICAL ERROR [${pathname}]:`, error);
        // Fallback to avoid breaking the site if possible
        return NextResponse.next();
    }
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
