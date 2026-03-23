export type MediaType = 'image' | 'video';

export interface MediaItem {
    type: MediaType;
    keywords: string[];
    url: string;
}

let CONCEPT_MAP: Record<string, string[]> = {};

export function expandKeywords(visual: string): string[] {
    const lower = visual.toLowerCase();
    const expanded = new Set<string>();

    for (const [concept, terms] of Object.entries(CONCEPT_MAP)) {
        if (concept.length <= 2) {
            const regex = new RegExp(`\\b${concept}\\b`, 'i');
            if (regex.test(lower)) {
                terms.forEach(t => expanded.add(t));
            }
        } else if (lower.includes(concept)) {
            terms.forEach(t => expanded.add(t));
        }
    }

    lower.split(/[\s,;.!?()[\]{}'"]+/).forEach(word => {
        if (word.length >= 4) expanded.add(word);
    });

    if (expanded.size === 0) {
        ['technology', 'computer', 'screen', 'modern', 'digital', 'office'].forEach(t => expanded.add(t));
    }

    return Array.from(expanded);
}

let BRAND_MAP: Record<string, string> = {};

export function detectBrand(visual: string): { name: string; domain: string } | null {
    const lower = visual.toLowerCase();

    const sortedBrands = Object.entries(BRAND_MAP).sort((a, b) => b[0].length - a[0].length);

    for (const [brand, domain] of sortedBrands) {
        if (brand.length <= 3) {
            const regex = new RegExp(`\\b${brand}\\b`, 'i');
            if (regex.test(lower)) {
                return { name: brand.charAt(0).toUpperCase() + brand.slice(1), domain };
            }
        } else if (lower.includes(brand)) {
            return { name: brand.charAt(0).toUpperCase() + brand.slice(1), domain };
        }
    }
    return null;
}

export function getImageUrl(item: MediaItem, width: number = 800, height: number = 600): string {
    if (item.url.includes('images.pexels.com')) {
        return `${item.url.split('?')[0]}?auto=compress&cs=tinysrgb&w=${width}&h=${height}&fit=crop`;
    }
    return item.url;
}

export function getMediaThumbnail(item: MediaItem): string {
    if (item.type === 'image') return getImageUrl(item, 480, 270);
    
    if (item.url.includes('pexels.com/video-files/')) {
        const parts = item.url.split('/');
        const id = parts[parts.length - 2];
        if (id && /^\d+$/.test(id)) {
            return `https://images.pexels.com/videos/${id}/free-video-${id}.jpg?auto=compress&cs=tinysrgb&w=480&h=270&fit=crop`;
        }
    }
    return item.url;
}

export function getRandomMedia(preferVideo: boolean = false): MediaItem {
    const pool = preferVideo ? VIDEOS : IMAGES;
    if (pool.length === 0) {
        return {
            type: 'image',
            url: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg',
            keywords: ['technology', 'server']
        };
    }
    return pool[Math.floor(Math.random() * pool.length)];
}

export function findBestMediaBatch(
    visual: string,
    count: number,
    excludeUrls: Set<string>,
    preferVideo: boolean = false
): MediaItem[] {
    const expandedTerms = expandKeywords(visual);
    const pool = preferVideo ? VIDEOS : IMAGES;

    if (pool.length === 0) {
        return [getRandomMedia(preferVideo)];
    }

    const scoredPool = pool
        .filter(item => !excludeUrls.has(item.url))
        .map(item => ({
            item,
            score: item.keywords.filter(kw =>
                expandedTerms.some(term => term.includes(kw) || kw.includes(term))
            ).length
        }))
        .sort((a, b) => b.score - a.score);

    const results: MediaItem[] = [];
    for (let i = 0; i < Math.min(count, scoredPool.length); i++) {
        results.push(scoredPool[i].item);
    }

    if (results.length < count) {
        const remainingPool = pool.filter(item => !excludeUrls.has(item.url) && !results.some(r => r.url === item.url));
        while (results.length < count && remainingPool.length > 0) {
            const randomIndex = Math.floor(Math.random() * remainingPool.length);
            results.push(remainingPool.splice(randomIndex, 1)[0]);
        }
    }

    return results;
}

export function findBestMixedMediaBatch(
    visual: string,
    imageCount: number,
    videoCount: number,
    excludeUrls: Set<string>
): MediaItem[] {
    const images = findBestMediaBatch(visual, imageCount, excludeUrls, false);
    const tempExclusions = new Set(excludeUrls);
    images.forEach(img => tempExclusions.add(img.url));
    
    const videos = findBestMediaBatch(visual, videoCount, tempExclusions, true);
    
    return [...images, ...videos];
}

export function findBestMedia(visual: string, index: number, preferVideo: boolean = false): MediaItem {
    const expandedTerms = expandKeywords(visual);
    const pool = preferVideo ? VIDEOS : IMAGES;
    let bestMatch: MediaItem = pool[index % pool.length];
    let bestScore = 0;

    for (const item of pool) {
        const score = item.keywords.filter(kw =>
            expandedTerms.some(term => term.includes(kw) || kw.includes(term))
        ).length;
        if (score > bestScore) {
            bestScore = score;
            bestMatch = item;
        }
    }
    return bestMatch;
}

export function resolveMediaUrl(item: MediaItem, width: number = 1920, height: number = 1080): string {
    if (item.type === 'video') return item.url;
    return getImageUrl(item, width, height);
}

export function getFallbackUrl(index: number, width: number, height: number): string {
    return `https://picsum.photos/seed/ha${index + 777}/${width}/${height}`;
}

export const IMAGES: MediaItem[] = [];
export const VIDEOS: MediaItem[] = [];
export const ALL_MEDIA: MediaItem[] = [];

let isLoaded = false;

export async function loadMediaData(): Promise<void> {
    if (isLoaded) return;

    try {
        const [imagesRes, videosRes, constantsRes] = await Promise.all([
            fetch('/data/images.json'),
            fetch('/data/videos.json'),
            fetch('/data/media_constants.json')
        ]);

        if (!imagesRes.ok || !videosRes.ok || !constantsRes.ok) {
            throw new Error(`Failed to fetch media data: ${imagesRes.status} / ${videosRes.status} / ${constantsRes.status}`);
        }

        const imagesData = await imagesRes.json() as MediaItem[];
        const videosData = await videosRes.json() as MediaItem[];
        const constantsData = await constantsRes.json() as { CONCEPT_MAP: Record<string, string[]>, BRAND_MAP: Record<string, string> };

        CONCEPT_MAP = constantsData.CONCEPT_MAP;
        BRAND_MAP = constantsData.BRAND_MAP;

        const imagesMap = new Map<string, MediaItem>();
        imagesData.forEach(item => imagesMap.set(item.url, item));
        
        const videosMap = new Map<string, MediaItem>();
        videosData.forEach(item => videosMap.set(item.url, item));

        console.log(`MediaLibrary: Loaded ${imagesData.length} images (Unique: ${imagesMap.size}) and ${videosData.length} videos (Unique: ${videosMap.size}).`);

        IMAGES.length = 0;
        IMAGES.push(...Array.from(imagesMap.values()));
        
        VIDEOS.length = 0;
        VIDEOS.push(...Array.from(videosMap.values()));
        
        ALL_MEDIA.length = 0;
        ALL_MEDIA.push(...IMAGES, ...VIDEOS);

        isLoaded = true;

    } catch (error) {
        console.error("Error loading media library:", error);
    }
}

export function isMediaLibraryLoaded(): boolean {
    return isLoaded;
}
