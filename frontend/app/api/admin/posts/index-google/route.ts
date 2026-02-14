import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/tasks';
import { requestIndexing } from '@/lib/google-indexing';
import { requireAuth } from '@/lib/auth/guard';

export async function POST(request: NextRequest) {
    try {
        const authError = await requireAuth();
        if (authError) return authError;
        const supabase = createAdminClient();
        const body = await request.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Force www.hostingsarena.com to match Search Console Property
        let finalUrl = url;
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname === 'hostingsarena.com') {
                urlObj.hostname = 'www.hostingsarena.com';
                finalUrl = urlObj.toString();
            }
        } catch (e) {
            // If invalid URL, let it fail downstream or handle here
            console.error('Invalid URL parsing:', url);
        }

        console.log(`[Google Indexing] Request for: ${url} -> Normalized: ${finalUrl}`);

        const result = await requestIndexing(finalUrl);

        if (!result) {
            console.log(`[Google Indexing] SKIPPED: No credentials for ${finalUrl}`);
            return NextResponse.json({
                success: false,
                message: 'Indexing skipped (No credentials configured)',
                normalizedUrl: finalUrl
            });
        }

        console.log(`[Google Indexing] SUCCESS for: ${finalUrl}`);
        return NextResponse.json({
            success: true,
            message: 'Indexing request submitted successfully',
            normalizedUrl: finalUrl,
            data: result
        });

    } catch (error: any) {
        console.error('[Google Indexing API] ERROR:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to submit indexing request',
            message: error.message,
            details: error.stack
        }, { status: 500 });
    }
}
