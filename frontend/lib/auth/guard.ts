import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function requireAuth(): Promise<NextResponse | null> {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        console.log(`[AuthGuard] User: ${user.email}, Role: ${profile?.role}`);

        if (profile?.role !== 'admin') {
            console.warn(`[AuthGuard] Forbidden access attempt by ${user.email} (role: ${profile?.role})`);
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return null; 
    } catch {
        return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
}
