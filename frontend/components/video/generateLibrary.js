const fs = require('fs');

const PEXELS_API_KEY = 'Oyl8PMfo0oQTpLZAy7flg36uWtcDIbgYo36cIbZCDI7fBrXKVkPp4Zye';

const TARGET_COUNT = 4000; 

const SEARCH_QUERIES = [
    'server room', 'data center', 'programming code', 'software development',
    'artificial intelligence', 'machine learning', 'neural network',
    'computer hardware', 'motherboard closeup', 'GPU graphics card', 'smartphone technology',
    'laptop workspace', 'microchip processor', 'circuit board',
    'cybersecurity', 'hacker dark room', 'network infrastructure', 'firewall security',
    'encryption digital', 'VPN connection',
    'cloud computing', 'fiber optic cable', 'satellite communication', 'antenna tower',
    'tech startup office', 'business meeting technology', 'stock market digital',
    'silicon valley', 'innovation laboratory',
    'digital abstract particles', 'neon lights city', 'futuristic interface',
    'hologram technology', 'matrix code rain', 'blue technology background',
    'abstract data visualization', 'dark tech background',
    'google office', 'apple store', 'microsoft office building', 'nvidia graphics',
    'tesla electric car', 'amazon warehouse', 'meta virtual reality',
    'spacex rocket launch', 'openai artificial intelligence', 'robotics factory',
    'drone aerial technology', 'virtual reality headset', '3d printing',
    'autonomous driving car', 'quantum computer', 'car', 'plane', 'nature', 'city'
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
        
        if (page > 15) {
            queryIndex++;
            page = 1;
        }
        
        await delay(250);
    }

    return Array.from(imagesMap.values());
}

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

async function main() {
    try {
        const images = await fetchImages();
        const videos = await fetchVideos();

        console.log(`\n🎉 Successfully fetched ${images.length} images and ${videos.length} videos.`);
        const dataDir = "../../public/data";
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        fs.writeFileSync(`${dataDir}/images.json`, JSON.stringify(images, null, 4));
        fs.writeFileSync(`${dataDir}/videos.json`, JSON.stringify(videos, null, 4));
        console.log('✅ Done! JSON files have been generated in public/data/.');

    } catch (error) {
        console.error('❌ Error generating library:', error);
    }
}

main();