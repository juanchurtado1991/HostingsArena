import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Validates that the current request has an authenticated admin session.
 * Checks both authentication (valid session) and authorization (admin role).
 * Use this at the top of any protected API route handler.
 * 
 * @returns null if authenticated admin, or a NextResponse with 401/403 if not.
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

        // Verify admin role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return null; // Authenticated admin
    } catch {
        return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
}
