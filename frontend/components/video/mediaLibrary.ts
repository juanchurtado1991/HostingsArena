/**
 * Curated Tech Media Library (Generated via API)
 * 4000 images (Pexels) + 4000 video clips (Pexels)
 * All tech-focused, CORS-safe, and verified unique.
 */

export type MediaType = 'image' | 'video';

export interface MediaItem {
    type: MediaType;
    keywords: string[];
    url: string;
}

// ═══════════════════════════════════════════════════════════════
// VISUAL ABSTRACTION ENGINE
// Translates abstract news concepts → concrete English stock terms
// ═══════════════════════════════════════════════════════════════

/** Tech synonym map: concept → visual stock search terms */
const CONCEPT_MAP: Record<string, string[]> = {
    // Hardware / Chips
    nvidia: ['gpu', 'graphics card', 'chip', 'processor', 'circuit', 'gaming', 'technology'],
    amd: ['processor', 'chip', 'cpu', 'circuit', 'computer', 'technology'],
    intel: ['processor', 'chip', 'cpu', 'circuit', 'computer', 'technology', 'silicon'],
    qualcomm: ['chip', 'mobile', 'processor', 'phone', 'wireless', 'technology'],
    arm: ['chip', 'processor', 'mobile', 'circuit', 'technology'],
    chipset: ['chip', 'processor', 'circuit', 'motherboard', 'technology'],
    semiconductor: ['chip', 'circuit', 'silicon', 'factory', 'manufacturing', 'technology'],

    // AI / ML
    openai: ['artificial intelligence', 'robot', 'brain', 'neural', 'code', 'futuristic'],
    chatgpt: ['artificial intelligence', 'chat', 'robot', 'typing', 'screen', 'code'],
    gemini: ['artificial intelligence', 'robot', 'brain', 'neural', 'google', 'technology'],
    copilot: ['code', 'programming', 'screen', 'developer', 'typing', 'artificial intelligence'],
    'machine learning': ['brain', 'neural', 'data', 'code', 'futuristic', 'technology'],
    'deep learning': ['brain', 'neural', 'data', 'code', 'technology', 'futuristic'],
    'inteligencia artificial': ['artificial intelligence', 'robot', 'brain', 'neural', 'futuristic'],
    'ia': ['artificial intelligence', 'robot', 'brain', 'neural', 'futuristic', 'technology'],
    ai: ['artificial intelligence', 'robot', 'brain', 'neural', 'futuristic', 'technology'],
    llm: ['artificial intelligence', 'code', 'brain', 'data', 'neural', 'technology'],

    // Cloud / Infrastructure
    aws: ['cloud', 'server', 'data center', 'infrastructure', 'technology'],
    azure: ['cloud', 'server', 'data center', 'infrastructure', 'technology'],
    gcp: ['cloud', 'server', 'data center', 'infrastructure', 'technology'],
    cloud: ['cloud', 'server', 'data center', 'infrastructure', 'network'],
    nube: ['cloud', 'server', 'data center', 'network', 'infrastructure'],
    kubernetes: ['server', 'code', 'infrastructure', 'container', 'technology'],
    docker: ['server', 'code', 'container', 'infrastructure', 'technology'],
    hosting: ['server', 'data center', 'cloud', 'infrastructure', 'network'],
    servidor: ['server', 'data center', 'cloud', 'infrastructure', 'rack'],
    cdn: ['network', 'globe', 'connection', 'server', 'infrastructure'],

    // Security
    cybersecurity: ['security', 'hacker', 'shield', 'lock', 'code', 'darkness'],
    ciberseguridad: ['security', 'hacker', 'shield', 'lock', 'code', 'darkness'],
    seguridad: ['security', 'lock', 'shield', 'protection', 'code'],
    ransomware: ['security', 'hacker', 'lock', 'code', 'darkness', 'danger'],
    malware: ['security', 'hacker', 'code', 'virus', 'danger', 'darkness'],
    phishing: ['security', 'email', 'hacker', 'fraud', 'code', 'danger'],
    breach: ['security', 'hacker', 'lock', 'code', 'danger', 'screen'],
    vulnerability: ['security', 'code', 'lock', 'bug', 'danger', 'technology'],
    encryption: ['security', 'lock', 'code', 'shield', 'data', 'technology'],
    hack: ['hacker', 'security', 'code', 'darkness', 'screen', 'keyboard'],

    // Big Tech
    google: ['search', 'office', 'technology', 'screen', 'modern', 'corporate'],
    apple: ['phone', 'laptop', 'design', 'modern', 'technology', 'premium'],
    microsoft: ['computer', 'office', 'software', 'technology', 'corporate', 'windows'],
    meta: ['social media', 'virtual reality', 'headset', 'technology', 'futuristic'],
    facebook: ['social media', 'network', 'connection', 'phone', 'technology'],
    amazon: ['ecommerce', 'warehouse', 'delivery', 'cloud', 'technology', 'shopping'],
    tesla: ['electric car', 'vehicle', 'futuristic', 'battery', 'charging', 'innovation'],
    spacex: ['rocket', 'space', 'launch', 'sky', 'technology', 'innovation'],
    samsung: ['phone', 'screen', 'display', 'technology', 'device', 'mobile'],
    tiktok: ['social media', 'phone', 'video', 'app', 'youth', 'entertainment'],
    twitter: ['social media', 'phone', 'network', 'communication', 'technology'],
    x: ['social media', 'phone', 'network', 'communication', 'technology'],
    linkedin: ['business', 'professional', 'office', 'corporate', 'network'],
    spotify: ['music', 'headphones', 'audio', 'streaming', 'phone', 'entertainment'],
    netflix: ['streaming', 'television', 'entertainment', 'screen', 'movie'],
    disney: ['entertainment', 'streaming', 'movie', 'animation', 'family'],
    sony: ['gaming', 'console', 'technology', 'entertainment', 'electronics'],
    nintendo: ['gaming', 'console', 'entertainment', 'fun', 'controller'],
    valve: ['gaming', 'computer', 'entertainment', 'steam', 'technology'],
    uber: ['car', 'ride', 'city', 'mobile', 'transportation', 'app'],
    airbnb: ['travel', 'house', 'accommodation', 'tourism', 'app'],

    // Crypto / Blockchain
    bitcoin: ['cryptocurrency', 'coin', 'mining', 'finance', 'technology', 'blockchain'],
    ethereum: ['cryptocurrency', 'blockchain', 'finance', 'technology', 'code'],
    crypto: ['cryptocurrency', 'coin', 'finance', 'technology', 'blockchain', 'digital'],
    blockchain: ['chain', 'code', 'technology', 'digital', 'finance', 'network'],
    nft: ['digital art', 'token', 'technology', 'creativity', 'blockchain'],
    web3: ['blockchain', 'code', 'technology', 'digital', 'futuristic', 'network'],

    // General tech concepts
    startup: ['office', 'team', 'business', 'modern', 'innovation', 'entrepreneur'],
    app: ['phone', 'mobile', 'screen', 'app', 'technology', 'user'],
    aplicacion: ['phone', 'mobile', 'screen', 'app', 'technology'],
    software: ['code', 'programming', 'screen', 'developer', 'technology'],
    hardware: ['circuit', 'motherboard', 'chip', 'computer', 'technology'],
    robot: ['robot', 'automation', 'futuristic', 'technology', 'mechanical'],
    drone: ['drone', 'aerial', 'sky', 'technology', 'flying'],
    '5g': ['network', 'antenna', 'wireless', 'mobile', 'speed', 'technology'],
    wifi: ['wireless', 'network', 'connection', 'router', 'technology'],
    iot: ['smart home', 'device', 'sensor', 'connection', 'technology'],
    vr: ['virtual reality', 'headset', 'immersive', 'futuristic', 'technology'],
    ar: ['augmented reality', 'technology', 'screen', 'overlay', 'futuristic'],
    quantum: ['physics', 'lab', 'science', 'futuristic', 'technology', 'research'],
    cuantico: ['physics', 'lab', 'science', 'futuristic', 'technology', 'research'],

    // Actions / Events
    launch: ['rocket', 'presentation', 'stage', 'event', 'celebration'],
    lanza: ['rocket', 'presentation', 'stage', 'event', 'news'],
    lanzamiento: ['rocket', 'presentation', 'stage', 'event', 'news'],
    release: ['presentation', 'stage', 'new', 'modern', 'technology'],
    announce: ['presentation', 'stage', 'conference', 'speaker', 'event'],
    anuncia: ['presentation', 'stage', 'conference', 'speaker', 'news'],
    update: ['screen', 'download', 'software', 'technology', 'modern'],
    actualizacion: ['screen', 'download', 'software', 'technology', 'modern'],
    ban: ['law', 'judge', 'government', 'restriction', 'legal'],
    prohibe: ['law', 'judge', 'government', 'restriction', 'legal'],
    regulation: ['law', 'government', 'document', 'legal', 'office'],
    regulacion: ['law', 'government', 'document', 'legal', 'office'],
    acquisition: ['handshake', 'business', 'deal', 'corporate', 'office'],
    adquisicion: ['handshake', 'business', 'deal', 'corporate', 'office'],
    compra: ['handshake', 'business', 'deal', 'corporate', 'money'],
    partnership: ['handshake', 'team', 'collaboration', 'business', 'meeting'],
    alianza: ['handshake', 'team', 'collaboration', 'business', 'meeting'],
    layoff: ['office', 'business', 'corporate', 'sad', 'unemployment'],
    despido: ['office', 'business', 'corporate', 'unemployment'],
    ipo: ['stock market', 'finance', 'business', 'money', 'graph'],
    revenue: ['finance', 'money', 'graph', 'business', 'growth'],
    ingresos: ['finance', 'money', 'graph', 'business', 'growth'],
    profit: ['finance', 'money', 'success', 'business', 'growth'],
    ganancia: ['finance', 'money', 'success', 'business', 'growth'],

    // Spanish general
    tecnologia: ['technology', 'computer', 'modern', 'digital', 'screen'],
    datos: ['data', 'database', 'code', 'screen', 'technology'],
    red: ['network', 'connection', 'globe', 'wire', 'technology'],
    pantalla: ['screen', 'display', 'monitor', 'technology'],
    celular: ['phone', 'mobile', 'screen', 'app', 'technology'],
    computadora: ['computer', 'laptop', 'screen', 'technology', 'work'],
    portatil: ['laptop', 'computer', 'mobile', 'work', 'technology'],
    internet: ['network', 'globe', 'connection', 'wireless', 'technology'],
    privacidad: ['privacy', 'lock', 'security', 'shield', 'data'],
    digital: ['digital', 'technology', 'screen', 'modern', 'code'],
};

/**
 * Expands an abstract visual/headline string into concrete English stock search terms.
 * E.g. "NVIDIA lanza nuevo chipset" → ["gpu", "graphics card", "chip", "processor", "rocket", "presentation", ...]
 */
export function expandKeywords(visual: string): string[] {
    const lower = visual.toLowerCase();
    const expanded = new Set<string>();

    // 1. Match against concept map (check if concept appears anywhere in the text)
    for (const [concept, terms] of Object.entries(CONCEPT_MAP)) {
        // For short concepts (≤2 chars like "ai", "x"), require word boundary
        if (concept.length <= 2) {
            const regex = new RegExp(`\\b${concept}\\b`, 'i');
            if (regex.test(lower)) {
                terms.forEach(t => expanded.add(t));
            }
        } else if (lower.includes(concept)) {
            terms.forEach(t => expanded.add(t));
        }
    }

    // 2. Also include original words ≥4 chars as-is (they might match library keywords directly)
    lower.split(/[\s,;.!?()[\]{}'"]+/).forEach(word => {
        if (word.length >= 4) expanded.add(word);
    });

    // 3. Fallback: if nothing matched, add generic tech terms
    if (expanded.size === 0) {
        ['technology', 'computer', 'screen', 'modern', 'digital', 'office'].forEach(t => expanded.add(t));
    }

    return Array.from(expanded);
}

// ═══════════════════════════════════════════════════════════════
// BRAND DETECTION ENGINE
// Maps company names → domains for logo fetching via Logo.dev
// ═══════════════════════════════════════════════════════════════

const BRAND_MAP: Record<string, string> = {
    google: 'google.com', alphabet: 'google.com',
    apple: 'apple.com',
    microsoft: 'microsoft.com',
    amazon: 'amazon.com',
    meta: 'meta.com', facebook: 'facebook.com',
    nvidia: 'nvidia.com',
    amd: 'amd.com',
    intel: 'intel.com',
    tesla: 'tesla.com',
    spacex: 'spacex.com',
    openai: 'openai.com', chatgpt: 'openai.com',
    samsung: 'samsung.com',
    sony: 'sony.com',
    nintendo: 'nintendo.com',
    valve: 'valvesoftware.com',
    netflix: 'netflix.com',
    spotify: 'spotify.com',
    tiktok: 'tiktok.com',
    twitter: 'twitter.com',
    linkedin: 'linkedin.com',
    uber: 'uber.com',
    airbnb: 'airbnb.com',
    disney: 'disney.com',
    qualcomm: 'qualcomm.com',
    ibm: 'ibm.com',
    oracle: 'oracle.com',
    salesforce: 'salesforce.com',
    adobe: 'adobe.com',
    cisco: 'cisco.com',
    cloudflare: 'cloudflare.com',
    github: 'github.com',
    gitlab: 'gitlab.com',
    docker: 'docker.com',
    stripe: 'stripe.com',
    paypal: 'paypal.com',
    shopify: 'shopify.com',
    slack: 'slack.com',
    zoom: 'zoom.us',
    twitch: 'twitch.tv',
    reddit: 'reddit.com',
    snapchat: 'snapchat.com',
    pinterest: 'pinterest.com',
    dell: 'dell.com',
    hp: 'hp.com', 'hewlett packard': 'hp.com',
    lenovo: 'lenovo.com',
    huawei: 'huawei.com',
    xiaomi: 'xiaomi.com',
    oneplus: 'oneplus.com',
    motorola: 'motorola.com',
    epic: 'epicgames.com', 'epic games': 'epicgames.com',
    unity: 'unity.com',
    'unreal engine': 'unrealengine.com',
    mozilla: 'mozilla.org', firefox: 'mozilla.org',
    brave: 'brave.com',
    notion: 'notion.so',
    figma: 'figma.com',
    canva: 'canva.com',
    vercel: 'vercel.com',
    supabase: 'supabase.com',
    heroku: 'heroku.com',
    digitalocean: 'digitalocean.com',
    aws: 'aws.amazon.com',
    anthropic: 'anthropic.com', claude: 'anthropic.com',
    midjourney: 'midjourney.com',
    stability: 'stability.ai',
    perplexity: 'perplexity.ai',
};

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

export function getImageUrl(item: MediaItem, width: number, height: number): string {
    if (item.url.includes('images.pexels.com')) {
        return `${item.url}?auto=compress&cs=tinysrgb&w=${width}&h=${height}&fit=crop`;
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
    const expandedTerms = expandKeywords(visual);
    const pool = preferVideo ? VIDEOS : IMAGES;

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

    // Fill with random if needed
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

import imagesData from '../../public/data/images.json';
import videosData from '../../public/data/videos.json';

export const IMAGES: MediaItem[] = imagesData as MediaItem[];
export const VIDEOS: MediaItem[] = videosData as MediaItem[];
export const ALL_MEDIA: MediaItem[] = [...IMAGES, ...VIDEOS];
