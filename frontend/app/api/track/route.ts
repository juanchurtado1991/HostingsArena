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
        const { path, referrer, post_slug } = body;

        if (!path || typeof path !== "string") {
            return NextResponse.json({ error: "path is required" }, { status: 400 });
        }

        const supabase = createAdminClient();
        const userAgent = request.headers.get("user-agent") || "";
        const country = request.headers.get("x-vercel-ip-country") ||
            request.headers.get("cf-ipcountry") || null;

        await supabase.from("page_views").insert({
            path: path.slice(0, 500),
            post_slug: post_slug || null,
            referrer: referrer?.slice(0, 500) || null,
            user_agent: userAgent.slice(0, 500),
            country: country?.slice(0, 10) || null,
        });

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
