export type AudioType = 'music' | 'sfx';

export interface AudioItem {
    id: string;
    type: AudioType;
    label: string;
    keywords: string[];
    url: string;
    duration?: number;
}

import musicData from '../../public/data/music.json';
import sfxData from '../../public/data/sfx.json';

export const MUSIC_LIBRARY: AudioItem[] = musicData as AudioItem[];
export const SFX_LIBRARY: AudioItem[] = sfxData as AudioItem[];
export const ALL_AUDIO: AudioItem[] = [...MUSIC_LIBRARY, ...SFX_LIBRARY];

/**
 * Find the best audio match based on context keywords
 */
export function findBestAudio(context: string, type: AudioType = 'music'): AudioItem {
    const pool = type === 'music' ? MUSIC_LIBRARY : SFX_LIBRARY;
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
    return pool[Math.floor(Math.random() * pool.length)];
}

