import { NextResponse } from 'next/server';
import { requestIndexing } from '@/lib/google-indexing';

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const result = await requestIndexing(url);

        return NextResponse.json({ success: true, result });
    } catch (e: any) {
        console.error('SEO Indexing Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
