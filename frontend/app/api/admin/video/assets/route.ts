import { NextResponse } from "next/server";

const PEXELS_API_KEY = 'Oyl8PMfo0oQTpLZAy7flg36uWtcDIbgYo36cIbZCDI7fBrXKVkPp4Zye';

/**
 * Live Pexels search endpoint for contextual media per scene.
 * POST /api/admin/video/assets
 * Body: { query: string, type: 'image' | 'video' | 'both', count?: number }
 * Returns: { results: Array<{ type, keywords, url }> }
 */
export async function POST(request: Request) {
    try {
        const { query, type = 'both', count = 4 } = await request.json();

        if (!query || typeof query !== 'string') {
            return NextResponse.json({ error: "Search query is required" }, { status: 400 });
        }

        const perType = type === 'both' ? Math.ceil(count / 2) : count;
        const results: { type: string; keywords: string[]; url: string }[] = [];

        // Fetch Images
        if (type === 'image' || type === 'both') {
            try {
                const res = await fetch(
                    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perType}&orientation=landscape`,
                    { headers: { 'Authorization': PEXELS_API_KEY } }
                );

                if (res.ok) {
                    const data = await res.json();
                    data.photos?.forEach((photo: any) => {
                        const desc = photo.alt || query;
                        const keywords = desc.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(' ').filter((w: string) => w.length > 3).slice(0, 5);
                        const baseUrl = photo.src.original.split('?')[0];
                        results.push({
                            type: 'image',
                            keywords: keywords.length > 0 ? keywords : [query],
                            url: baseUrl,
                        });
                    });
                }
            } catch (e) {
                console.warn('[Assets] Image fetch failed:', (e as Error).message);
            }
        }

        // Fetch Videos
        if (type === 'video' || type === 'both') {
            try {
                const res = await fetch(
                    `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${perType}&orientation=landscape`,
                    { headers: { 'Authorization': PEXELS_API_KEY } }
                );

                if (res.ok) {
                    const data = await res.json();
                    data.videos?.forEach((vid: any) => {
                        const videoFile = vid.video_files?.find((v: any) => v.quality === 'hd') || vid.video_files?.[0];
                        if (videoFile) {
                            const tags = vid.tags?.length > 0
                                ? vid.tags.map((t: string) => t.toLowerCase().replace(/[^a-z0-9]/g, '')).slice(0, 5)
                                : [query];
                            results.push({
                                type: 'video',
                                keywords: tags,
                                url: videoFile.link,
                            });
                        }
                    });
                }
            } catch (e) {
                console.warn('[Assets] Video fetch failed:', (e as Error).message);
            }
        }

        return NextResponse.json({ results, query, count: results.length });

    } catch (error: any) {
        console.error("[Assets] Error:", error);
        return NextResponse.json({ error: "Failed to fetch assets", details: error.message }, { status: 500 });
    }
}
