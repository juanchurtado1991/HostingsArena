export type AudioType = 'music' | 'sfx';

export interface AudioItem {
    id: string;
    type: AudioType;
    label: string;
    keywords: string[];
    url: string;
    duration?: number;
}

export const MUSIC_LIBRARY: AudioItem[] = [];
export const SFX_LIBRARY: AudioItem[] = [];
export const ALL_AUDIO: AudioItem[] = [];

let isLoaded = false;
let isLoading = false;

export async function loadAudioData(): Promise<void> {
    if (isLoaded || isLoading) return;
    isLoading = true;

    try {
        console.log("AudioLibrary: Fetching data...");
        const [musicRes, sfxRes] = await Promise.all([
            fetch('/data/music.json'),
            fetch('/data/sfx.json')
        ]);

        if (!musicRes.ok || !sfxRes.ok) {
            throw new Error(`Failed to fetch audio data: ${musicRes.status} / ${sfxRes.status}`);
        }

        const musicData = await musicRes.json() as AudioItem[];
        const sfxData = await sfxRes.json() as AudioItem[];

        // Runtime Deduplication by ID
        const musicMap = new Map<string, AudioItem>();
        musicData.forEach(item => musicMap.set(item.id, item));
        
        const sfxMap = new Map<string, AudioItem>();
        sfxData.forEach(item => sfxMap.set(item.id, item));

        console.log(`AudioLibrary: Loaded ${musicData.length} music (Unique: ${musicMap.size}) and ${sfxData.length} sfx (Unique: ${sfxMap.size}).`);

        MUSIC_LIBRARY.length = 0;
        MUSIC_LIBRARY.push(...Array.from(musicMap.values()));
        
        SFX_LIBRARY.length = 0;
        SFX_LIBRARY.push(...Array.from(sfxMap.values()));
        
        ALL_AUDIO.length = 0;
        // Final deduplication for the combined list
        const allMap = new Map<string, AudioItem>();
        MUSIC_LIBRARY.forEach(item => allMap.set(item.id, item));
        SFX_LIBRARY.forEach(item => allMap.set(item.id, item));
        
        ALL_AUDIO.push(...Array.from(allMap.values()));

        isLoaded = true;

    } catch (error) {
        console.error("AudioLibrary: Error loading audio library:", error);
    } finally {
        isLoading = false;
    }
}

export function isAudioLibraryLoaded(): boolean {
    return isLoaded;
}

export function findBestAudio(context: string, type: AudioType = 'music'): AudioItem {
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

