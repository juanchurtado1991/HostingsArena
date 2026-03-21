export type AudioType = 'music' | 'sfx';

export interface AudioItem {
    id: string;
    type: AudioType;
    label: string;
    keywords: string[];
    url: string;
    duration?: number;
}

// ═══════════════════════════════════════════════════════════════
// DATA STORAGE & DYNAMIC LOADING
// ═══════════════════════════════════════════════════════════════

export const MUSIC_LIBRARY: AudioItem[] = [];
export const SFX_LIBRARY: AudioItem[] = [];
export const ALL_AUDIO: AudioItem[] = [];

let isLoaded = false;

/**
 * Dynamically loads audio data from JSON files.
 * Mutates the exported arrays to ensure references remain stable.
 */
export async function loadAudioData(): Promise<void> {
    if (isLoaded) return;

    try {
        const [musicRes, sfxRes] = await Promise.all([
            fetch('/data/music.json'),
            fetch('/data/sfx.json')
        ]);

        if (!musicRes.ok || !sfxRes.ok) {
            throw new Error(`Failed to fetch audio data: ${musicRes.status} / ${sfxRes.status}`);
        }

        const musicData = await musicRes.json();
        const sfxData = await sfxRes.json();

        // Mutate existing arrays to preserve references
        MUSIC_LIBRARY.length = 0;
        MUSIC_LIBRARY.push(...(musicData as AudioItem[]));
        
        SFX_LIBRARY.length = 0;
        SFX_LIBRARY.push(...(sfxData as AudioItem[]));
        
        ALL_AUDIO.length = 0;
        ALL_AUDIO.push(...MUSIC_LIBRARY, ...SFX_LIBRARY);

        isLoaded = true;
    } catch (error) {
        console.error("Error loading audio library:", error);
    }
}

/**
 * Returns whether the audio library has been loaded.
 */
export function isAudioLibraryLoaded(): boolean {
    return isLoaded;
}

/**
 * Find the best audio match based on context keywords
 */
export function findBestAudio(context: string, type: AudioType = 'music'): AudioItem {
    const pool = type === 'music' ? MUSIC_LIBRARY : SFX_LIBRARY;
    
    // Fallback if pool is empty
    if (pool.length === 0) {
        return {
            id: 'fallback',
            type,
            label: 'Fallback Audio',
            keywords: [],
            url: ''
        };
    }

    const lowerContext = context.toLowerCase();
    
    let bestMatch = pool[0];
    let maxScore = 0;

    pool.forEach(item => {
        const score = item.keywords.filter(k => lowerContext.includes(k)).length;
        if (score > maxScore) {
            maxScore = score;
            bestMatch = item;
        }
    });

    return bestMatch;
}

/**
 * Get a random audio item from the library
 */
export function getRandomAudio(type: AudioType = 'music'): AudioItem {
    const pool = type === 'music' ? MUSIC_LIBRARY : SFX_LIBRARY;
    if (pool.length === 0) {
        return {
            id: 'fallback',
            type,
            label: 'Fallback Audio',
            keywords: [],
            url: ''
        };
    }
    return pool[Math.floor(Math.random() * pool.length)];
}

