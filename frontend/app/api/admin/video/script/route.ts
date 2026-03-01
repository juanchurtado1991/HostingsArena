import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// --- RSS FEED SOURCES ---
const RSS_FEEDS = [
    { name: "TechCrunch",    url: "https://techcrunch.com/feed/",                fallbackUrl: "https://feeds.feedburner.com/TechCrunch/", category: "Startups & Hardware" },
    { name: "The Verge",     url: "https://www.theverge.com/rss/index.xml",      category: "Narrative & Reviews" },
    { name: "Ars Technica",  url: "https://feeds.arstechnica.com/arstechnica/index", category: "Deep Tech" },
    { name: "Hacker News",   url: "https://news.ycombinator.com/rss",            fallbackUrl: "https://hnrss.org/newest", category: "Dev Trends" },
    { name: "Engadget",      url: "https://www.engadget.com/rss.xml",            category: "Consumer Electronics" },
];

// --- RSS PARSER (lightweight, no extra deps) ---
interface NewsItem {
    title: string;
    description: string;
    link: string;
    source: string;
    pubDate: string;
}

function extractCDATA(str: string): string {
    return str.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
}

function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

function parseRSSItems(xml: string, sourceName: string): NewsItem[] {
    const items: NewsItem[] = [];
    // Match <item> blocks
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
        const block = match[1];
        const title =     stripHtml(extractCDATA(block.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || ""));
        const desc =      stripHtml(extractCDATA(block.match(/<description>([\s\S]*?)<\/description>/i)?.[1] || ""));
        const link =      stripHtml(extractCDATA(block.match(/<link>([\s\S]*?)<\/link>/i)?.[1] || ""));
        const pubDate =   stripHtml(extractCDATA(block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] || ""));
        if (title) {
            items.push({ title, description: desc.substring(0, 300), link, source: sourceName, pubDate });
        }
    }
    // Also handle <entry> (Atom feeds like The Verge)
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
    while ((match = entryRegex.exec(xml)) !== null) {
        const block = match[1];
        const title =     stripHtml(extractCDATA(block.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || ""));
        const desc =      stripHtml(extractCDATA(block.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i)?.[1] || block.match(/<content[^>]*>([\s\S]*?)<\/content>/i)?.[1] || ""));
        const link =      block.match(/<link[^>]*href="([^"]+)"/i)?.[1] || "";
        const pubDate =   stripHtml(block.match(/<published>([\s\S]*?)<\/published>/i)?.[1] || block.match(/<updated>([\s\S]*?)<\/updated>/i)?.[1] || "");
        if (title) {
            items.push({ title, description: desc.substring(0, 300), link, source: sourceName, pubDate });
        }
    }
    return items;
}

async function fetchAllNews(): Promise<{ items: NewsItem[]; failedFeeds: string[] }> {
    const allItems: NewsItem[] = [];
    const failedFeeds: string[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const results = await Promise.allSettled(
        RSS_FEEDS.map(async (feed) => {
            const fetchFeed = async (url: string) => {
                const res = await fetch(url, {
                    headers: { 
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 HostingArena/1.0",
                        "Accept": "application/rss+xml, application/rdf+xml, application/atom+xml, application/xml, text/xml"
                    },
                    cache: "no-store",
                    signal: AbortSignal.timeout(6000), // Slightly shorter timeout for primary
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const xml = await res.text();
                return parseRSSItems(xml, feed.name);
            };

            try {
                return await fetchFeed(feed.url);
            } catch (e: any) {
                console.warn(`[RSS] Failed primary ${feed.name} (${feed.url}):`, e.message);
                if (feed.fallbackUrl) {
                    console.log(`[RSS] Trying fallback for ${feed.name}: ${feed.fallbackUrl}`);
                    try {
                        return await fetchFeed(feed.fallbackUrl);
                    } catch (fallbackError: any) {
                        console.warn(`[RSS] Failed fallback ${feed.name} (${feed.fallbackUrl}):`, fallbackError.message);
                    }
                }
                failedFeeds.push(feed.name);
                return [];
            }
        })
    );

    for (const r of results) {
        if (r.status === "fulfilled") allItems.push(...r.value);
    }

    // Filter to today's news (last 24h preferred, 48h as fallback)
    const recentItems = allItems.filter(item => {
        if (!item.pubDate) return true; // Keep items without dates (HN)
        const pubDate = new Date(item.pubDate);
        const hoursDiff = (Date.now() - pubDate.getTime()) / (1000 * 60 * 60);
        return hoursDiff <= 48;
    });

    // Deduplicate by title similarity
    const seen = new Set<string>();
    const unique = recentItems.filter(item => {
        const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 40);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    // Shuffle for variety across sources
    return { items: unique.sort(() => Math.random() - 0.5), failedFeeds };
}

// --- MAIN HANDLER ---
export async function POST(request: Request) {
    const { newsContext, format, lang, targetDuration = 60 } = await request.json();

    try {
        // 1. Fetch real news from RSS feeds
        console.log("[Script] Fetching RSS news feeds...");
        const { items: newsItems, failedFeeds } = await fetchAllNews();
        console.log(`[Script] Fetched ${newsItems.length} recent news items, ${failedFeeds.length} feeds failed`);

        if (newsItems.length === 0) {
            return NextResponse.json({
                error: "No news available",
                details: `Could not fetch news from any RSS feed. Failed feeds: ${failedFeeds.join(', ') || 'none'}. Please try again in a few minutes.`,
                failedFeeds,
            }, { status: 503 });
        }

        // 2. Build the news digest for the AI — REDUCED DENSITY for v6.3 Storytelling
        // We focus on top items to allow the AI to build a narrative instead of a list.
        const densityLimit = format === '9:16' ? 5 : 12; 
        const topItems = newsItems.slice(0, densityLimit);
        const newsDigest = topItems.map((item, i) =>
            `${i + 1}. [${item.source}] ${item.title}\n   ${item.description}`
        ).join("\n\n");

        // 3. Determine script parameters by format AND target duration
        const isShort = format === '9:16';
        const durationSec = targetDuration || (isShort ? 60 : 180);
        // Approx 2.5 words per second of speech
        const wordCount = Math.round(durationSec * 2.5);
        const wordRange = `${Math.round(wordCount * 0.85)}-${Math.round(wordCount * 1.15)}`;
        const sceneCountNum = Math.max(3, Math.round(durationSec / 15));
        const sceneCount = `${sceneCountNum - 1}-${sceneCountNum + 1} scenes`;
        const scriptLength = `Approximately ${durationSec} seconds of speech (approx ${wordRange} words).`;
        
        // v6.3 DEPTH: Focused on Narrative and Drama
        const depth = durationSec <= 60
            ? "High-impact storytelling. Choose the 1-2 most explosive stories and weave them into a single punchy narrative. Avoid lists."
            : durationSec <= 180
            ? "Professional Tech Analysis. Select a Lead Story (40% of time) and follow with 2-3 supporting stories connected by logical pivots."
            : "Deep Documentary Style. Elaborate on the context, market impact, and 'Winners vs Losers' for each major story.";

        // 4. Prepare the Gemini prompt with REAL NEWS
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
        }

        const userFocus = newsContext ? `\nUSER FOCUS: The user is especially interested in: ${newsContext}. Prioritize stories related to this topic.\n` : "";

        const prompt = `
            Act as an Executive Producer for a high-retention faceless tech news channel called "HostingArena".
            Your goal is to transform technical news into an entertaining "Daily Intel" report.
            
            TODAY'S DATE: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            
            HERE ARE TODAY'S REAL TECH HEADLINES (from RSS feeds):
            ${newsDigest}
            ${userFocus}
            FORMAT: ${isShort ? 'Vertical SHORT (9:16) for TikTok/Shorts/Reels' : 'Landscape FULL VIDEO (16:9) for YouTube'}
            LANGUAGE: ${lang === 'es' ? 'Spanish (Latin American, professional, high-energy, "Analista Tech" tone)' : 'English (American, energetic, authoritative)'}
            
            
            === VIDEO REQUIREMENTS ===
            - TOTAL LENGTH: ${scriptLength}
            - SCENES: ${sceneCount}
            - DEPTH: ${depth}
            
            SCRIPT STRUCTURE — "The Storytelling Arc":
            
            PHASE 1 — THE EXPLOSIVE HOOK (Scene 1): DO NOT say "Welcome" or "In today's news". Start with the most shocking consequence of the Lead Story.
            PHASE 2 — THE LEAD STORY (Next 1-2 Scenes): Deep dive into the primary event. What happened? Why is it a game-changer?
            PHASE 3 — THE LOGICAL PIVOT: Transition to the next news item by finding a thematic connection (e.g., "But while Big Tech is fighting over A, the hardware world is secretly solving B").
            PHASE 4 — MARKET IMPACT/WINNERS & LOSERS: Explain who wins and who loses. Add personality and technical insight.
            PHASE 5 — THE CTA: Mention HostingArena.com and a quick high-impact sign-off.
            
            WRITING RULES (Mandatory):
            - STRICTLY NO "PAJA" (Filler). No greeting, no intro, no generic fluff.
            - NO LISTS. Do not summarize all headlines. Choose the best ones and build a narrative.
            - ANALOGIES. Use tech analogies to explain complex data.
            - DYNAMIC TRANSITIONS. Every pivot must feel earned and logical.
            - IMPACT OVER LENGTH. Short, punchy sentences (MAX 15 words).
            - NO markdown symbols (*, #, **, backticks, etc).
            - Each [Visual:] tag must describe a concrete, high-end cinematic shot in English.
            - Each [PexelsQuery:] tag must contain 2-4 words optimized as a search query for Pexels stock media (e.g., "server room blue lights", "smartphone close up hand"). This is used to find the perfect image/video for the scene.
            - [Transition:] options: crossfade (default), zoom (intense), none (cut).
            ${lang === 'es' ? `
            REGLAS FONÉTICAS OBLIGATORIAS (SOLO PARA ESPAÑOL):
            - Escribe las marcas y términos técnicos en inglés de forma fonética en español para facilitar la pronunciación del TTS.
            - Ejemplos: "OpenAI" → "Ópen Ái", "NVIDIA" → "Envidia", "Microsoft" → "Máicrosoft", "Google" → "Gúgol", "Apple" → "Ápol", "iPhone" → "Áifon", "Cloud" → "Cláud", "Streaming" → "Estríming", "Hardware" → "Járduer", "Software" → "Sófuer", "Data Center" → "Déita Sénter", "Machine Learning" → "Mashín Lérning", "Blockchain" → "Blókchein", "Startup" → "Estártap"
            - EXCEPCIÓN: "HostingArena" se mantiene igual (es nuestra marca).
            - Aplica esto a TODAS las palabras en inglés que aparezcan en el script.
            ` : ''}
            
            MANDATORY OUTPUT FORMAT:
            [Headline: 3-5 word high-impact headline] [Subheadline: 5-10 word supporting data] [Visual: cinematic shot description] [PexelsQuery: 2-4 word stock media search query] [Transition: crossfade|zoom|none] Spoken content.
            
            EXAMPLE (Spanish):
            [Headline: RUPTURA CUÁNTICA] [Subheadline: Google confirma que el cifrado de 30 años ha sido vulnerado] [Visual: Aerial view of Silicon Valley at golden hour with data streams] [PexelsQuery: silicon valley aerial technology] [Transition: crossfade] Google acaba de confirmarlo. La computación cuántica rompió oficialmente un estándar de cifrado de 30 años. Mientras el mundo cripto entra en pánico, el hardware necesario para esto ya está aquí.

        `;

        const genAI = new GoogleGenerativeAI(apiKey);
        const modelsToTry = [
            "gemini-flash-latest",
            "gemini-2.0-flash-lite",
            "gemini-pro-latest",
            "gemini-2.0-flash",
            "gemini-2.5-flash",
        ];

        let script: string | null = null;
        let usedModel = "";
        let lastError: Error | null = null;
        let hitQuota = false;

        for (const modelName of modelsToTry) {
            try {
                console.log(`[Script] Trying Gemini model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                script = response.text();
                if (script) {
                    console.log(`[Script] Success with ${modelName} (${script.length} chars)`);
                    usedModel = modelName;
                    break;
                }
            } catch (e: any) {
                console.warn(`[Script] Failed with ${modelName}:`, e.message);
                lastError = e;
                if (e.message?.includes("429") || e.message?.includes("quota") || e.message?.includes("RESOURCE_EXHAUSTED")) {
                    hitQuota = true;
                }
            }
        }

        if (!script) {
            const errorMsg = lastError?.message || "";
            if (hitQuota || errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
                return NextResponse.json({
                    error: "Gemini API Quota Exceeded",
                    details: "Free tier limit reached. Wait a minute and try again, or check your quota at aistudio.google.com.",
                    isQuotaError: true
                }, { status: 429 });
            }
            throw lastError || new Error("All Gemini models failed");
        }

        // Clean any markdown formatting
        const cleanScript = script
            .replace(/\*\*/g, '')
            .replace(/\*/g, '')
            .replace(/#{1,6}\s?/g, '')
            .replace(/`/g, '')
            .replace(/^[-•]\s/gm, '')
            .trim();

        return NextResponse.json({
            script: cleanScript,
            model: usedModel,
            newsCount: topItems.length,
            sources: [...new Set(topItems.map(i => i.source))],
            failedFeeds,
        });

    } catch (error: any) {
        console.error("[Script] Error:", error);
        return NextResponse.json({
            error: "Failed to generate script",
            details: error.message,
        }, { status: 500 });
    }
}
