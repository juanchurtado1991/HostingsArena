import { NextResponse } from "next/server";

// Lightweight RSS preview endpoint — returns just headlines for Phase 1 display
const RSS_FEEDS = [
    { name: "TechCrunch",   url: "https://techcrunch.com/feed/" },
    { name: "The Verge",    url: "https://www.theverge.com/rss/index.xml" },
    { name: "Ars Technica",  url: "https://feeds.arstechnica.com/arstechnica/index" },
    { name: "Hacker News",   url: "https://hnrss.org/frontpage" },
    { name: "Engadget",      url: "https://www.engadget.com/rss.xml" },
];

interface Headline {
    title: string;
    source: string;
    link?: string;
    date?: string;
}

export async function GET() {
    const headlines: Headline[] = [];
    const failedFeeds: string[] = [];

    const results = await Promise.allSettled(
        RSS_FEEDS.map(async (feed) => {
            try {
                const res = await fetch(feed.url, {
                    headers: { "User-Agent": "HostingArena/1.0 NewsBot" },
                    signal: AbortSignal.timeout(8000),
                });
                if (!res.ok) {
                    failedFeeds.push(feed.name);
                    return;
                }
                const xml = await res.text();

                // Parse items (RSS <item> or Atom <entry>)
                const items = xml.match(/<item[\s>][\s\S]*?<\/item>|<entry[\s>][\s\S]*?<\/entry>/gi) || [];

                for (const item of items.slice(0, 8)) {
                    const titleMatch = item.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
                    const linkMatch = item.match(/<link[^>]*href="([^"]*)"[^>]*\/>|<link[^>]*>([\s\S]*?)<\/link>/i);
                    const dateMatch = item.match(/<pubDate>([\s\S]*?)<\/pubDate>|<published>([\s\S]*?)<\/published>|<updated>([\s\S]*?)<\/updated>/i);

                    const title = titleMatch?.[1]?.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#039;/g, "'").replace(/&quot;/g, '"').trim();
                    if (!title) continue;

                    const link = linkMatch?.[1] || linkMatch?.[2]?.trim();
                    const dateStr = dateMatch?.[1] || dateMatch?.[2] || dateMatch?.[3];
                    const date = dateStr ? new Date(dateStr.trim()).toISOString() : undefined;

                    // Only include recent articles (last 48h)
                    if (date) {
                        const articleAge = Date.now() - new Date(date).getTime();
                        if (articleAge > 48 * 60 * 60 * 1000) continue;
                    }

                    headlines.push({ title, source: feed.name, link, date });
                }
            } catch {
                failedFeeds.push(feed.name);
            }
        })
    );

    // Deduplicate by title similarity
    const seen = new Set<string>();
    const unique = headlines.filter(h => {
        const key = h.title.toLowerCase().slice(0, 50);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    // Sort by date (newest first)
    unique.sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return NextResponse.json({
        headlines: unique,
        total: unique.length,
        failedFeeds,
        sources: RSS_FEEDS.map(f => f.name).filter(n => !failedFeeds.includes(n)),
    });
}
