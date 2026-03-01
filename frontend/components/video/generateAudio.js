const fs = require('fs');

// ==========================================
// 1. CONFIGURATION
// ==========================================
const JAMENDO_CLIENT_ID = '1e0313af'; 

const MUSIC_TARGET = 2000;
const SFX_TARGET = 2000;

// 25+ music queries for maximum variety across moods and genres
const MUSIC_QUERIES = [
    // News & Broadcast
    'news broadcast', 'breaking news', 'news theme', 'news report',
    'tv news', 'broadcast intro',
    // Tech & Electronic
    'technology electronic', 'tech background', 'digital ambient',
    'synthwave', 'retrowave', 'electronic beat',
    // Corporate & Professional
    'corporate upbeat', 'business presentation', 'corporate motivational',
    'inspiring corporate',
    // Cinematic & Dramatic
    'cinematic tension', 'epic trailer', 'dramatic orchestral',
    'suspense thriller', 'action cinematic',
    // Ambient & Minimal
    'cyberpunk ambient', 'minimalist tech', 'dark ambient',
    'lo-fi background', 'chill electronic',
];

// 15+ SFX queries for transition sounds, UI effects, and tech sounds
const SFX_QUERIES = [
    'interface click', 'ui notification', 'whoosh transition',
    'digital glitch', 'alert beep', 'sci-fi sound',
    'pop bubble', 'swoosh fast', 'error warning',
    'success chime', 'keyboard typing', 'data processing',
    'futuristic scan', 'hologram activate', 'power up',
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ==========================================
// 2. FETCH MUSIC FROM JAMENDO
// ==========================================
async function fetchMusic() {
    console.log(`🎵 Fetching ${MUSIC_TARGET} music tracks...`);
    let musicMap = new Map(); // keyed by track.id for dedup
    let page = 1;

    for (const query of MUSIC_QUERIES) {
        if (musicMap.size >= MUSIC_TARGET) break;
        page = 1;

        while (musicMap.size < MUSIC_TARGET && page <= 10) {
            const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=100&fuzzytags=${encodeURIComponent(query)}&speed=medium&include=musicinfo&offset=${(page - 1) * 100}`;
            
            try {
                const res = await fetch(url);

                if (res.status === 429) {
                    console.log('⏳ Rate limit hit, waiting 5 seconds...');
                    await delay(5000);
                    continue;
                }

                if (!res.ok) {
                    console.log(`⚠️ Jamendo API error for "${query}": ${res.statusText}`);
                    break;
                }

                const data = await res.json();
                
                if (!data.results || data.results.length === 0) {
                    break;
                }

                data.results.forEach(track => {
                    if (musicMap.size >= MUSIC_TARGET) return;
                    
                    if (!musicMap.has(track.id)) {
                        // Extract better keywords from the track's tags and name
                        const trackTags = [];
                        if (track.musicinfo && track.musicinfo.tags && track.musicinfo.tags.genres) {
                            trackTags.push(...track.musicinfo.tags.genres);
                        }
                        if (track.musicinfo && track.musicinfo.tags && track.musicinfo.tags.instruments) {
                            trackTags.push(...track.musicinfo.tags.instruments);
                        }
                        const nameWords = track.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(' ').filter(w => w.length > 3);
                        const finalKeywords = [...new Set([query.split(' ')[0], ...trackTags, ...nameWords.slice(0, 2), 'background'])].slice(0, 6);

                        musicMap.set(track.id, {
                            id: track.id,
                            type: 'music',
                            label: track.name,
                            duration: track.duration,
                            keywords: finalKeywords,
                            url: track.audio
                        });
                    }
                });
                
                console.log(`✅ Music: ${musicMap.size}/${MUSIC_TARGET} (Query: "${query}", Page: ${page})`);
                page++;
                await delay(300);
            } catch (err) {
                console.log(`⚠️ Error fetching "${query}": ${err.message}`);
                break;
            }
        }
    }

    return Array.from(musicMap.values());
}

// ==========================================
// 3. FETCH SFX FROM JAMENDO
// ==========================================
async function fetchSFX() {
    console.log(`\n🔊 Fetching ${SFX_TARGET} SFX tracks...`);
    let sfxMap = new Map(); // keyed by track.id for dedup

    for (const query of SFX_QUERIES) {
        if (sfxMap.size >= SFX_TARGET) break;
        let page = 1;

        while (sfxMap.size < SFX_TARGET && page <= 10) {
            const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=100&search=${encodeURIComponent(query)}&durationbetween=0_30&offset=${(page - 1) * 100}`;
            
            try {
                const res = await fetch(url);

                if (res.status === 429) {
                    console.log('⏳ Rate limit hit, waiting 5 seconds...');
                    await delay(5000);
                    continue;
                }

                if (!res.ok) {
                    console.log(`⚠️ Jamendo API error for SFX "${query}": ${res.statusText}`);
                    break;
                }

                const data = await res.json();
                
                if (!data.results || data.results.length === 0) {
                    break;
                }

                data.results.forEach(track => {
                    if (sfxMap.size >= SFX_TARGET) return;
                    
                    if (!sfxMap.has(track.id)) {
                        const nameWords = track.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(' ').filter(w => w.length > 2);
                        
                        sfxMap.set(track.id, {
                            id: track.id,
                            type: 'sfx',
                            label: track.name,
                            duration: track.duration,
                            keywords: [...new Set([query.split(' ')[0], ...nameWords.slice(0, 3), 'sfx'])].slice(0, 5),
                            url: track.audio
                        });
                    }
                });
                
                console.log(`✅ SFX: ${sfxMap.size}/${SFX_TARGET} (Query: "${query}", Page: ${page})`);
                page++;
                await delay(300);
            } catch (err) {
                console.log(`⚠️ Error fetching SFX "${query}": ${err.message}`);
                break;
            }
        }
    }

    return Array.from(sfxMap.values());
}

// ==========================================
// 4. ASSEMBLE & WRITE
// ==========================================
async function main() {
    try {
        const music = await fetchMusic();
        const sfx = await fetchSFX();

        console.log(`\n🎉 Successfully fetched ${music.length} music tracks and ${sfx.length} SFX tracks.`);

        const tsContent = `/**
 * Curated Tech Audio Library
 * ${music.length} music tracks (Jamendo) + ${sfx.length} SFX (Jamendo)
 * Generated via Jamendo API
 */

export type AudioType = 'music' | 'sfx';

export interface AudioItem {
    id: string;
    type: AudioType;
    label: string;
    keywords: string[];
    url: string;
    duration?: number;
}

// --- MUSIC (NEWS & TECH FOCUS) ---
export const MUSIC_LIBRARY: AudioItem[] = ${JSON.stringify(music, null, 4)};

// --- SOUND EFFECTS (UI & TRANSITIONS) ---
export const SFX_LIBRARY: AudioItem[] = ${JSON.stringify(sfx, null, 4)};

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
`;

        fs.writeFileSync('audioLibrary.ts', tsContent);
        console.log('✅ Done! audioLibrary.ts has been generated.');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

main();