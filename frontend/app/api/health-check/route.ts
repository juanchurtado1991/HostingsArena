import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({
            status: 'error',
            message: 'Missing Env Vars on Server',
            env: {
                hasUrl: !!supabaseUrl,
                hasKey: !!supabaseKey
            }
        }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        const start = Date.now();
        // Try to fetch 1 row from hosting_providers
        const { data, error } = await supabase
            .from('hosting_providers')
            .select('id, provider_name')
            .limit(1)
            .single();

        const duration = Date.now() - start;

        if (error) {
            return NextResponse.json({
                status: 'db_error',
                message: error.message,
                details: error
            }, { status: 502 });
        }

        return NextResponse.json({
            status: 'ok',
            message: 'Supabase reachable from Vercel Server',
            duration: `${duration}ms`,
            data_sample: data
        }, { status: 200 });

    } catch (err: any) {
        return NextResponse.json({
            status: 'exception',
            message: err.message
        }, { status: 500 });
    }
}
