import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/tasks/supabaseAdmin";

/**
 * GET /api/admin/analytics
 * Returns aggregated analytics for the dashboard:
 * - Total page views (today, 7d, 30d)
 * - Top pages by views
 * - Top posts by views
 * - Traffic by day (last 30 days)
 * - Top referrers
 * - Top countries
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = createAdminClient();
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

        const [todayViews, weekViews, monthViews] = await Promise.all([
            supabase.from("page_views").select("id", { count: "exact", head: true }).gte("created_at", today),
            supabase.from("page_views").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
            supabase.from("page_views").select("id", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
        ]);

        const { data: topPages } = await supabase.rpc("get_top_pages", { days_back: 30 });

        const { data: topPosts } = await supabase.rpc("get_top_posts", { days_back: 30 });

        const { data: dailyTraffic } = await supabase.rpc("get_daily_traffic", { days_back: 30 });

        const { data: topReferrers } = await supabase.rpc("get_top_referrers", { days_back: 30 });

        const { data: topCountries } = await supabase.rpc("get_top_countries", { days_back: 30 });

        const { data: recentVisitors } = await supabase.rpc("get_recent_visitors", { limit_count: 50 });

        return NextResponse.json({
            summary: {
                today: todayViews.count || 0,
                week: weekViews.count || 0,
                month: monthViews.count || 0,
            },
            topPages: topPages || [],
            topPosts: topPosts || [],
            dailyTraffic: dailyTraffic || [],
            topReferrers: topReferrers || [],
            topCountries: topCountries || [],
            recentVisitors: recentVisitors || [],
        });
    } catch (err) {
        console.error("Analytics API error:", err);
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }
}
