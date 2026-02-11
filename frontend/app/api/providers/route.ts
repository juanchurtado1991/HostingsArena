import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'hosting' | 'vpn';
    const search = searchParams.get('search');

    if (!type || (type !== 'hosting' && type !== 'vpn')) {
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({ error: 'Server misconfiguration: Missing Env Vars' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        const table = type === 'hosting' ? 'hosting_providers' : 'vpn_providers';

        let query = supabase
            .from(table)
            .select('*')
            .order('provider_name', { ascending: true });

        if (search) {
            query = query.ilike('provider_name', `%${search}%`);
        } else {
            query = query.limit(50);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Supabase Proxy Error:', error);
            return NextResponse.json({ error: error.message, details: error }, { status: 502 });
        }

        return NextResponse.json(data, {
            status: 200,
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
        });

    } catch (err: any) {
        return NextResponse.json({ error: 'Internal Server Error', message: err.message }, { status: 500 });
    }
}
