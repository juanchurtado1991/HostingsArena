import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return new NextResponse('Missing url parameter', { status: 400 });
    }

    try {
        // Forward Range header if present (crucial for video streaming/seeking)
        const fetchHeaders = new Headers();
        
        // Comprehensive anti-bot impersonation for Cloudflare/Pexels
        fetchHeaders.set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
        fetchHeaders.set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7');
        fetchHeaders.set('Accept-Language', 'en-US,en;q=0.9,es;q=0.8');
        fetchHeaders.set('Sec-Ch-Ua', '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"');
        fetchHeaders.set('Sec-Ch-Ua-Mobile', '?0');
        fetchHeaders.set('Sec-Ch-Ua-Platform', '"macOS"');
        fetchHeaders.set('Sec-Fetch-Dest', 'document');
        fetchHeaders.set('Sec-Fetch-Mode', 'navigate');
        fetchHeaders.set('Sec-Fetch-Site', 'none');
        fetchHeaders.set('Sec-Fetch-User', '?1');
        fetchHeaders.set('Upgrade-Insecure-Requests', '1');

        const range = request.headers.get('range');
        if (range) {
            fetchHeaders.set('Range', range);
        }

        const response = await fetch(url, { headers: fetchHeaders });
        
        if (!response.ok) {
            return new NextResponse(`Failed to fetch: ${response.statusText}`, { status: response.status });
        }

        // Forward headers primarily Content-Type and Range-related headers
        const responseHeaders = new Headers({
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=3600',
        });

        const contentType = response.headers.get('Content-Type');
        if (contentType) responseHeaders.set('Content-Type', contentType);

        const contentLength = response.headers.get('Content-Length');
        if (contentLength) responseHeaders.set('Content-Length', contentLength);

        const contentRange = response.headers.get('Content-Range');
        if (contentRange) responseHeaders.set('Content-Range', contentRange);

        const acceptRanges = response.headers.get('Accept-Ranges');
        if (acceptRanges) responseHeaders.set('Accept-Ranges', acceptRanges);
        
        // Return as a stream for efficiency, preserving the HTTP status (e.g., 206 Partial Content)
        return new NextResponse(response.body, {
            status: response.status,
            headers: responseHeaders,
        });
    } catch (error: any) {
        console.error('Audio Proxy Error:', error);
        return new NextResponse('Internal Proxy Error', { status: 500 });
    }
}
