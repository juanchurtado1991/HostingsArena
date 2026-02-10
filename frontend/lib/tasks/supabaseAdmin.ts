import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase admin client for server-side operations.
 * Uses service role key for full access (bypasses RLS).
 * 
 * ⚠️ ONLY use this in API routes and server actions, NEVER in client code.
 */
export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase admin credentials');
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
