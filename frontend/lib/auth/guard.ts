import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Validates that the current request has an authenticated Supabase session.
 * Use this at the top of any protected API route handler.
 * 
 * @returns null if authenticated, or a NextResponse with 401 if not.
 * 
 * Usage:
 *   const authError = await requireAuth();
 *   if (authError) return authError;
 */
export async function requireAuth(): Promise<NextResponse | null> {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        return null; // Authenticated
    } catch {
        return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
}
