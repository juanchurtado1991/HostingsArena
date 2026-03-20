const fs = require('fs');

const JAMENDO_CLIENT_ID = '1e0313af'; 

const MUSIC_TARGET = 2000;
const SFX_TARGET = 2000;

const MUSIC_QUERIES = [
    'news broadcast', 'breaking news', 'news theme', 'news report',
    'tv news', 'broadcast intro',
    'technology electronic', 'tech background', 'digital ambient',
    'synthwave', 'retrowave', 'electronic beat',
    'corporate upbeat', 'business presentation', 'corporate motivational',
    'inspiring corporate',
    'cinematic tension', 'epic trailer', 'dramatic orchestral',
    'suspense thriller', 'action cinematic',
    'cyberpunk ambient', 'minimalist tech', 'dark ambient',
    'lo-fi background', 'chill electronic',
];

const SFX_QUERIES = [
    'interface click', 'ui notification', 'whoosh transition',
    'digital glitch', 'alert beep', 'sci-fi sound',
    'pop bubble', 'swoosh fast', 'error warning',
    'success chime', 'keyboard typing', 'data processing',
    'futuristic scan', 'hologram activate', 'power up',
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchMusic() {
    console.log(`🎵 Fetching ${MUSIC_TARGET} music tracks...`);
    let musicMap = new Map(); 
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

async function fetchSFX() {
    console.log(`\n🔊 Fetching ${SFX_TARGET} SFX tracks...`);
    let sfxMap = new Map(); 

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

async function main() {
    try {
        const music = await fetchMusic();
        const sfx = await fetchSFX();

        console.log(`\n🎉 Successfully fetched ${music.length} music tracks and ${sfx.length} SFX tracks.`);

        const dataDir = '../../public/data';
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        fs.writeFileSync(`${dataDir}/music.json`, JSON.stringify(music, null, 4));
        fs.writeFileSync(`${dataDir}/sfx.json`, JSON.stringify(sfx, null, 4));
        console.log('✅ Done! JSON files have been generated in public/data/.');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

main();