import { NextResponse } from "next/server";
import { detectBrand as detectBrandLocal, expandKeywords as expandKeywordsLocal } from "../../../../../components/video/mediaLibrary";

const PEXELS_API_KEY = 'Oyl8PMfo0oQTpLZAy7flg36uWtcDIbgYo36cIbZCDI7fBrXKVkPp4Zye';
// Pixabay free API key (public, no auth needed for basic tier)
const PIXABAY_API_KEY = '49413693-e432b97f8ded0cf6a2e7cb8eb';

/**
 * Live Pexels + Pixabay contextual media search per scene.
 * POST /api/admin/video/assets
 * Body: { query: string, type: 'image' | 'video' | 'both', count?: number }
 * Returns: { results: Array<{ type, keywords, url, source? }> }
 *
 * Strategy (ordered by specificity):
 *  1. Brand logo → Clearbit + icon.horse (if brand detected)
 *  2. Wikipedia page image (if entity detected)
 *  3. Pexels (primary stock provider) — with AI-expanded contextual query
 *  4. Pixabay (free fallback) — if Pexels yields fewer results than requested
 */
export async function POST(request: Request) {
    try {
        const { query, type = 'both', count = 4 } = await request.json();

        if (!query || typeof query !== 'string') {
            return NextResponse.json({ error: "Search query is required" }, { status: 400 });
        }

        const results: { type: string; keywords: string[]; url: string; source?: string }[] = [];
        const lowerQuery = query.toLowerCase();

        // ------------------------------------------------------------------
        // LEVEL 1: BRAND LOGO DETECTION (Clearbit / icon.horse)
        // ------------------------------------------------------------------
        const brandMatch = detectBrandLocal(lowerQuery);

        if (brandMatch && (type === 'image' || type === 'both')) {
            console.log(`[Assets API] Brand detected: ${brandMatch.name} → ${brandMatch.domain}`);
            results.push({
                type: 'image',
                keywords: [brandMatch.name.toLowerCase(), 'logo', 'brand'],
                url: `https://logo.clearbit.com/${brandMatch.domain}?size=800`,
                source: 'logo'
            });
            results.push({
                type: 'image',
                keywords: [brandMatch.name.toLowerCase(), 'logo', 'icon'],
                url: `https://icon.horse/icon/${brandMatch.domain}`,
                source: 'icon'
            });
        }

        // ------------------------------------------------------------------
        // LEVEL 2: WIKIPEDIA ENTITY IMAGE
        // ------------------------------------------------------------------
        if (type === 'image' || type === 'both') {
            try {
                const wikiQuery = query.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join('_');
                const wikiRes = await fetch(
                    `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(wikiQuery)}`,
                    { headers: { 'User-Agent': 'HostingArena/1.0 (juan@hostingarena.app)' } }
                );

                if (wikiRes.ok) {
                    const wikiData = await wikiRes.json();
                    const pages = wikiData.query?.pages;
                    if (pages) {
                        const pageId = Object.keys(pages)[0];
                        if (pageId !== '-1' && pages[pageId].original?.source) {
                            console.log(`[Assets API] Wikipedia exact match: ${wikiQuery}`);
                            results.push({
                                type: 'image',
                                keywords: [query.toLowerCase(), 'wikipedia', 'profile', 'entity'],
                                url: pages[pageId].original.source,
                                source: 'wikipedia'
                            });
                        }
                    }
                }
            } catch (e) {
                console.warn('[Assets API] Wikipedia fetch failed:', (e as Error).message);
            }
        }

        // ------------------------------------------------------------------
        // LEVEL 3: BUILD A SMART SEARCH QUERY
        // Strategy: use expanded keywords from the concept map.
        // If a brand was detected, filter out competitor brand names so we
        // search for the concept (e.g. "chip processor silicon") not the brand
        // (avoiding AMD/Intel when talking about Apple M5).
        // ------------------------------------------------------------------
        const expandedTerms = expandKeywordsLocal(query);

        // Remove direct brand name tokens to avoid fetching competitor visuals
        // e.g. for "Apple M5 chip", expandedTerms might include "amd" or "intel" → strip those.
        const BRAND_TERMS_TO_AVOID = [
            'amd', 'intel', 'nvidia', 'qualcomm', 'samsung', 'huawei', 'xiaomi',
            'google', 'microsoft', 'meta', 'facebook', 'amazon', 'tesla', 'spacex',
        ];
        const safeBrand = brandMatch?.name.toLowerCase();
        const filteredTerms = expandedTerms.filter(term => {
            // Keep the detected brand's own terms; strip all others to avoid wrong logos
            if (safeBrand && BRAND_TERMS_TO_AVOID.includes(term) && term !== safeBrand) return false;
            return true;
        });

        // Build Pexels query: take top 3 most descriptive expanded terms + original query words
        const pexelsQuery = filteredTerms.slice(0, 3).join(' ') || query;
        const perType = type === 'both' ? Math.ceil(count / 2) : count;

        // ------------------------------------------------------------------
        // LEVEL 4: PEXELS (primary — landscape, best quality)
        // ------------------------------------------------------------------
        let pexelsImageCount = 0;
        let pexelsVideoCount = 0;

        if (type === 'image' || type === 'both') {
            try {
                const res = await fetch(
                    `https://api.pexels.com/v1/search?query=${encodeURIComponent(pexelsQuery)}&per_page=${perType}&orientation=landscape`,
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
                            source: 'pexels'
                        });
                        pexelsImageCount++;
                    });
                }
            } catch (e) {
                console.warn('[Assets] Pexels image fetch failed:', (e as Error).message);
            }
        }

        if (type === 'video' || type === 'both') {
            try {
                const res = await fetch(
                    `https://api.pexels.com/videos/search?query=${encodeURIComponent(pexelsQuery)}&per_page=${perType}&orientation=landscape`,
                    { headers: { 'Authorization': PEXELS_API_KEY } }
                );

                if (res.ok) {
                    const data = await res.json();
                    data.videos?.forEach((vid: any) => {
                        const videoFile = vid.video_files?.find((v: any) => v.quality === 'hd') || vid.video_files?.[0];
                        if (videoFile) {
                            const tags = vid.tags?.length > 0
                                ? vid.tags.map((t: string) => t.toLowerCase().replace(/[^a-z0-9]/g, '')).slice(0, 5)
                                : [pexelsQuery];
                            results.push({
                                type: 'video',
                                keywords: tags,
                                url: videoFile.link,
                                source: 'pexels'
                            });
                            pexelsVideoCount++;
                        }
                    });
                }
            } catch (e) {
                console.warn('[Assets] Pexels video fetch failed:', (e as Error).message);
            }
        }

        // ------------------------------------------------------------------
        // LEVEL 5: PIXABAY FALLBACK (free, no attribution required for API)
        // Only fetch if Pexels didn't fill the quota.
        // ------------------------------------------------------------------
        const pixabayQuery = encodeURIComponent(pexelsQuery);

        const needMoreImages = (type === 'image' || type === 'both') && pexelsImageCount < perType;
        const needMoreVideos = (type === 'video' || type === 'both') && pexelsVideoCount < perType;

        if (needMoreImages) {
            try {
                const missingCount = perType - pexelsImageCount;
                const res = await fetch(
                    `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${pixabayQuery}&image_type=photo&orientation=horizontal&per_page=${missingCount + 2}&safesearch=true`,
                );

                if (res.ok) {
                    const data = await res.json();
                    data.hits?.slice(0, missingCount).forEach((hit: any) => {
                        const kws = hit.tags?.split(',').map((t: string) => t.trim().toLowerCase()).slice(0, 5) || [query];
                        results.push({
                            type: 'image',
                            keywords: kws,
                            url: hit.largeImageURL || hit.webformatURL,
                            source: 'pixabay'
                        });
                    });
                    console.log(`[Assets] Pixabay filled ${Math.min(missingCount, data.hits?.length || 0)} missing images.`);
                }
            } catch (e) {
                console.warn('[Assets] Pixabay image fetch failed:', (e as Error).message);
            }
        }

        if (needMoreVideos) {
            try {
                const missingCount = perType - pexelsVideoCount;
                const res = await fetch(
                    `https://pixabay.com/api/videos/?key=${PIXABAY_API_KEY}&q=${pixabayQuery}&per_page=${missingCount + 2}`,
                );

                if (res.ok) {
                    const data = await res.json();
                    data.hits?.slice(0, missingCount).forEach((hit: any) => {
                        // Prefer 'large' or 'medium' quality
                        const videoUrl = hit.videos?.large?.url || hit.videos?.medium?.url || hit.videos?.small?.url;
                        if (videoUrl) {
                            const kws = hit.tags?.split(',').map((t: string) => t.trim().toLowerCase()).slice(0, 5) || [query];
                            results.push({
                                type: 'video',
                                keywords: kws,
                                url: videoUrl,
                                source: 'pixabay'
                            });
                        }
                    });
                    console.log(`[Assets] Pixabay filled missing videos.`);
                }
            } catch (e) {
                console.warn('[Assets] Pixabay video fetch failed:', (e as Error).message);
            }
        }

        return NextResponse.json({ results, query, pexelsQuery, count: results.length });

    } catch (error: any) {
        console.error("[Assets] Error:", error);
        return NextResponse.json({ error: "Failed to fetch assets", details: error.message }, { status: 500 });
    }
}
