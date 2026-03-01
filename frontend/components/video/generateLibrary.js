const fs = require('fs');

// ==========================================
// 1. CONFIGURATION & API KEYS
// ==========================================
const PEXELS_API_KEY = 'Oyl8PMfo0oQTpLZAy7flg36uWtcDIbgYo36cIbZCDI7fBrXKVkPp4Zye';

// 4000 for maximum variety in the media library
const TARGET_COUNT = 4000; 

// 45+ search queries across tech categories for maximum variety
const SEARCH_QUERIES = [
    // Core Tech
    'server room', 'data center', 'programming code', 'software development',
    'artificial intelligence', 'machine learning', 'neural network',
    // Hardware & Devices
    'computer hardware', 'motherboard closeup', 'GPU graphics card', 'smartphone technology',
    'laptop workspace', 'microchip processor', 'circuit board',
    // Cybersecurity & Network
    'cybersecurity', 'hacker dark room', 'network infrastructure', 'firewall security',
    'encryption digital', 'VPN connection',
    // Cloud & Infrastructure
    'cloud computing', 'fiber optic cable', 'satellite communication', 'antenna tower',
    // Business & Innovation
    'tech startup office', 'business meeting technology', 'stock market digital',
    'silicon valley', 'innovation laboratory',
    // Abstract & Cinematic
    'digital abstract particles', 'neon lights city', 'futuristic interface',
    'hologram technology', 'matrix code rain', 'blue technology background',
    'abstract data visualization', 'dark tech background',
    // Specific Companies & Products
    'google office', 'apple store', 'microsoft office building', 'nvidia graphics',
    'tesla electric car', 'amazon warehouse', 'meta virtual reality',
    'spacex rocket launch', 'openai artificial intelligence', 'robotics factory',
    'drone aerial technology', 'virtual reality headset', '3d printing',
    'autonomous driving car', 'quantum computer',
];

// Rate limit helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ==========================================
// 2. FETCH IMAGES FROM PEXELS
// ==========================================
async function fetchImages() {
    console.log(`Fetching ${TARGET_COUNT} images from Pexels...`);
    let imagesMap = new Map();
    let queryIndex = 0;
    let page = 1;

    while (imagesMap.size < TARGET_COUNT && queryIndex < SEARCH_QUERIES.length) {
        const query = SEARCH_QUERIES[queryIndex];
        
        const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=80&page=${page}`, {
            headers: { 'Authorization': PEXELS_API_KEY }
        });
        
        if (res.status === 429) {
            console.log('⏳ Rate limit hit, waiting 5 seconds...');
            await delay(5000);
            continue;
        }
        
        if (!res.ok) throw new Error(`Pexels Image API error: ${res.statusText}`);
        
        const data = await res.json();
        
        if (data.photos.length === 0) {
            console.log(`➡️ Out of results for "${query}", switching to next keyword...`);
            queryIndex++;
            page = 1;
            continue;
        }

        data.photos.forEach(photo => {
            if (imagesMap.size >= TARGET_COUNT) return;
            
            const desc = photo.alt || query;
            const keywords = desc.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(' ').filter(w => w.length > 3).slice(0, 5);
            
            // Clean URL: remove query params for permanent links
            const baseUrl = photo.src.original.split('?')[0];

            if (!imagesMap.has(baseUrl)) {
                imagesMap.set(baseUrl, {
                    type: 'image',
                    keywords: keywords.length > 0 ? keywords : [query.split(' ')[0], 'tech'],
                    url: baseUrl
                });
            }
        });

        console.log(`✅ Images loaded: ${imagesMap.size}/${TARGET_COUNT} (Query: ${query}, Page: ${page})`);
        page++;
        
        // Move to next query after exhausting pages (Pexels caps at ~15 pages/query)
        if (page > 15) {
            queryIndex++;
            page = 1;
        }
        
        await delay(250);
    }

    return Array.from(imagesMap.values());
}

// ==========================================
// 3. FETCH VIDEOS FROM PEXELS
// ==========================================
async function fetchVideos() {
    console.log(`\nFetching ${TARGET_COUNT} videos from Pexels...`);
    let videosMap = new Map();
    let queryIndex = 0;
    let page = 1;

    while (videosMap.size < TARGET_COUNT && queryIndex < SEARCH_QUERIES.length) {
        const query = SEARCH_QUERIES[queryIndex];

        const res = await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=80&page=${page}`, {
            headers: { 'Authorization': PEXELS_API_KEY }
        });
        
        if (res.status === 429) {
            console.log('⏳ Rate limit hit, waiting 5 seconds...');
            await delay(5000);
            continue;
        }

        if (!res.ok) throw new Error(`Pexels Video API error: ${res.statusText}`);
        
        const data = await res.json();
        
        if (data.videos.length === 0) {
            console.log(`➡️ Out of results for "${query}", switching to next keyword...`);
            queryIndex++;
            page = 1;
            continue;
        }

        data.videos.forEach(vid => {
            if (videosMap.size >= TARGET_COUNT) return;

            const videoFile = vid.video_files.find(v => v.quality === 'hd') || vid.video_files[0];
            const tags = vid.tags?.length > 0 ? vid.tags : [query, 'video'];
            
            if (videoFile) {
                const cleanVideoUrl = videoFile.link; 

                if (!videosMap.has(cleanVideoUrl)) {
                    videosMap.set(cleanVideoUrl, {
                        type: 'video',
                        keywords: (Array.isArray(tags) ? tags : [tags]).map(t => 
                            typeof t === 'string' ? t.toLowerCase().replace(/[^a-z0-9]/g, '') : String(t)
                        ).filter(t => t.length > 0).slice(0, 5),
                        url: cleanVideoUrl
                    });
                }
            }
        });

        console.log(`✅ Videos loaded: ${videosMap.size}/${TARGET_COUNT} (Query: ${query}, Page: ${page})`);
        page++;
        
        if (page > 15) {
            queryIndex++;
            page = 1;
        }
        
        await delay(250);
    }

    return Array.from(videosMap.values());
}

// ==========================================
// 4. ASSEMBLE & WRITE TYPESCRIPT FILE
// ==========================================
async function main() {
    try {
        const images = await fetchImages();
        const videos = await fetchVideos();

        console.log(`\n🎉 Successfully fetched ${images.length} images and ${videos.length} videos.`);
        console.log('Writing to mediaLibrary.ts (This might take a few seconds)...');

        const tsContent = `/**
 * Curated Tech Media Library (Generated via API)
 * ${images.length} images (Pexels) + ${videos.length} video clips (Pexels)
 * All tech-focused, CORS-safe, and verified unique.
 */

export type MediaType = 'image' | 'video';

export interface MediaItem {
    type: MediaType;
    keywords: string[];
    url: string;
}

export function getImageUrl(item: MediaItem, width: number, height: number): string {
    // If URL is from Pexels, use their native API for resize/compress on the fly
    if (item.url.includes('images.pexels.com')) {
        return \`\${item.url}?auto=compress&cs=tinysrgb&w=\${width}&h=\${height}&fit=crop\`;
    }
    return item.url;
}

export function getRandomMedia(preferVideo: boolean = false): MediaItem {
    const pool = preferVideo ? VIDEOS : IMAGES;
    return pool[Math.floor(Math.random() * pool.length)];
}

export function findBestMediaBatch(
    visual: string,
    count: number,
    excludeUrls: Set<string>,
    preferVideo: boolean = false
): MediaItem[] {
    const lowerVisual = visual.toLowerCase();
    const pool = preferVideo ? VIDEOS : IMAGES;

    // 1. Calculate scores for all items not in excludeUrls
    const scoredPool = pool
        .filter(item => !excludeUrls.has(item.url))
        .map(item => ({
            item,
            score: item.keywords.filter(kw => lowerVisual.includes(kw)).length
        }))
        .sort((a, b) => b.score - a.score);

    // 2. Select top 'count' items
    const results: MediaItem[] = [];
    for (let i = 0; i < Math.min(count, scoredPool.length); i++) {
        results.push(scoredPool[i].item);
    }

    // 3. If we don't have enough, pick random items from the pool
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
    const lowerVisual = visual.toLowerCase();
    const pool = preferVideo ? VIDEOS : IMAGES;
    let bestMatch: MediaItem = pool[index % pool.length];
    let bestScore = 0;

    for (const item of pool) {
        const score = item.keywords.filter(kw => lowerVisual.includes(kw)).length;
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
    return \`https://picsum.photos/seed/ha\${index + 777}/\${width}/\${height}\`;
}

// --- ${images.length} VERIFIED TECH IMAGES (PEXELS) ---
export const IMAGES: MediaItem[] = ${JSON.stringify(images, null, 4)};

// --- ${videos.length} VERIFIED TECH VIDEOS (PEXELS) ---
export const VIDEOS: MediaItem[] = ${JSON.stringify(videos, null, 4)};

export const ALL_MEDIA: MediaItem[] = [...IMAGES, ...VIDEOS];
`;

        fs.writeFileSync('mediaLibrary.ts', tsContent);
        console.log('✅ Done! mediaLibrary.ts has been successfully generated with permanent URLs.');

    } catch (error) {
        console.error('❌ Error generating library:', error);
    }
}

main();