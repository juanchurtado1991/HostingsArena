import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/tasks/supabaseAdmin";

/**
 * POST /api/track
 * Lightweight page view tracking endpoint.
 * Called from the client on each page load via a beacon/fetch.
 * 
 * Body: { path: string, referrer?: string, post_slug?: string }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { path, referrer, post_slug, utm_source, utm_medium, utm_campaign } = body;

        if (!path || typeof path !== "string") {
            return NextResponse.json({ error: "path is required" }, { status: 400 });
        }

        const supabase = createAdminClient();
        const userAgent = request.headers.get("user-agent") || "";
        const ip = (request.headers.get("x-forwarded-for")?.split(',')[0] || "unknown").trim();
        const country = request.headers.get("x-vercel-ip-country") ||
            request.headers.get("cf-ipcountry") || null;

        const IGNORED_IPS = ["190.150.105.226", "190.53.30.25"];
        const ignoreCookie = request.cookies.get("ha_ignore_tracking");

        // Logger for debugging 'unknown' visits in Vercel
        console.log(`[TRACK] ${path} - IP: ${ip} - UA: ${userAgent.substring(0, 50)} - Ignore: ${!!ignoreCookie}`);

        if (IGNORED_IPS.includes(ip) || ignoreCookie) {
            return NextResponse.json({ ok: true, ignored: true });
        }

        // Simple Device Detection
        let deviceType = 'desktop';
        if (/mobile/i.test(userAgent)) deviceType = 'mobile';
        if (/tablet|ipad/i.test(userAgent)) deviceType = 'tablet';
        if (/bot|crawler|spider|googlebot|bingbot|yandexbot/i.test(userAgent)) deviceType = 'bot';

        if (deviceType === 'bot') {
             return NextResponse.json({ ok: true, isBot: true });
        }

        await supabase.from("page_views").insert({
            path: path.slice(0, 500),
            post_slug: post_slug || null,
            referrer: referrer?.slice(0, 500) || null,
            user_agent: userAgent.slice(0, 500),
            country: country?.slice(0, 10) || null,
            ip_address: ip.slice(0, 45),
            device_type: deviceType,
            utm_source: utm_source?.slice(0, 100),
            utm_medium: utm_medium?.slice(0, 100),
            utm_campaign: utm_campaign?.slice(0, 100),
        });

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
