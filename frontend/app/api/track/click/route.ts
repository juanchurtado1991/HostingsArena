import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/tasks/supabaseAdmin";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { provider_name, target_url, page_path, position } = body;

        if (!provider_name) {
            return NextResponse.json({ error: "provider_name required" }, { status: 400 });
        }

        const supabase = createAdminClient();

        // Context Parsing
        const userAgent = request.headers.get("user-agent") || "";
        const ip = (request.headers.get("x-forwarded-for")?.split(',')[0] || "unknown").trim();
        const country = request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry") || null;

        const IGNORED_IPS = ["190.150.105.226", "190.53.30.25"];
        const ignoreCookie = request.cookies.get("ha_ignore_tracking");

        // Logger for debugging
        console.log(`[CLICK] ${provider_name} - IP: ${ip} - Ignore: ${!!ignoreCookie}`);

        if (IGNORED_IPS.includes(ip) || ignoreCookie) {
            return NextResponse.json({ ok: true, ignored: true });
        }

        // Simple Device Detection
        let deviceType = 'desktop';
        if (/mobile/i.test(userAgent)) deviceType = 'mobile';
        if (/tablet|ipad/i.test(userAgent)) deviceType = 'tablet';
        if (/bot|crawler|spider/i.test(userAgent)) deviceType = 'bot';

        await supabase.from("affiliate_clicks").insert({
            provider_name,
            target_url,
            page_path,
            position,
            ip_address: ip.slice(0, 45),
            user_agent: userAgent,
            country: country?.slice(0, 10),
            device_type: deviceType
        });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("Click tracking error:", err);
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
