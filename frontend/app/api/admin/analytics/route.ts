import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/tasks/supabaseAdmin";
import { requireAuth } from "@/lib/auth/guard";

export async function GET(request: NextRequest) {
    try {
        const authError = await requireAuth();
        if (authError) return authError;
        
        const searchParams = request.nextUrl.searchParams;
        const startDateParam = searchParams.get('startDate');
        const endDateParam = searchParams.get('endDate');

        const supabase = createAdminClient();
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        
        let startDate = thirtyDaysAgo;
        let endDate = now.toISOString();

        if (startDateParam) {
            startDate = new Date(startDateParam).toISOString();
        }
        if (endDateParam) {
            // Include the whole end day
            const endDateObj = new Date(endDateParam);
            endDateObj.setUTCHours(23, 59, 59, 999);
            endDate = endDateObj.toISOString();
        }

        const IGNORED_IPS = ["190.150.105.226", "190.53.30.25"];

        const [todayViews, weekViews, monthViews] = await Promise.all([
            supabase.from("page_views").select("id", { count: "exact", head: true }).not("ip_address", "in", `(${IGNORED_IPS.join(",")})`).gte("created_at", today),
            supabase.from("page_views").select("id", { count: "exact", head: true }).not("ip_address", "in", `(${IGNORED_IPS.join(",")})`).gte("created_at", sevenDaysAgo),
            supabase.from("page_views").select("id", { count: "exact", head: true }).not("ip_address", "in", `(${IGNORED_IPS.join(",")})`).gte("created_at", thirtyDaysAgo),
        ]);

        // Fetch all raw views for the given date range to aggregate in JS
        const { data: pageViewsData } = await supabase
            .from("page_views")
            .select("path, post_slug, referrer, country, created_at, user_agent")
            .not("ip_address", "in", `(${IGNORED_IPS.join(",")})`)
            .gte("created_at", startDate)
            .lte("created_at", endDate);

        // Fetch all raw clicks for the given date range
        const { data: affiliateClicksData } = await supabase
            .from("affiliate_clicks")
            .select("provider_name, created_at")
            .not("ip_address", "in", `(${IGNORED_IPS.join(",")})`)
            .gte("created_at", startDate)
            .lte("created_at", endDate);

        const views = pageViewsData || [];
        const clicks = affiliateClicksData || [];

        // Avg visits per day for the selected timeframe
        const diffTime = Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime());
        const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        const avgVisitsPerDay = Math.round(views.length / diffDays);

        // Aggregation: Top Pages
        const pathCounts: Record<string, number> = {};
        views.forEach(v => {
            if (v.path) {
                pathCounts[v.path] = (pathCounts[v.path] || 0) + 1;
            }
        });
        const topPages = Object.entries(pathCounts)
            .map(([path, views]) => ({ path, views }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 10);

        // Fetch valid post slugs to filter out deleted posts
        const { data: postsData } = await supabase.from('posts').select('slug');
        const validPostSlugs = new Set((postsData || []).map(p => p.slug));

        // Aggregation: Top Posts
        const postCounts: Record<string, number> = {};
        views.forEach(v => {
            if (v.post_slug && validPostSlugs.has(v.post_slug)) {
                postCounts[v.post_slug] = (postCounts[v.post_slug] || 0) + 1;
            }
        });
        const topPosts = Object.entries(postCounts)
            .map(([post_slug, views]) => ({ post_slug, views }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 10);

        // Aggregation: Daily Traffic
        const dailyTrafficMap: Record<string, { day: string, views: number }> = {};
        views.forEach(v => {
            const dateStr = v.created_at.split('T')[0];
            if (!dailyTrafficMap[dateStr]) {
                dailyTrafficMap[dateStr] = { day: dateStr, views: 0 };
            }
            dailyTrafficMap[dateStr].views++;
        });
        const dailyTraffic = Object.values(dailyTrafficMap).sort((a, b) => a.day.localeCompare(b.day));

        // Aggregation: Top Referrers
        const referrerCounts: Record<string, number> = {};
        views.forEach(v => {
            const ref = v.referrer || "Direct";
            referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
        });
        const topReferrers = Object.entries(referrerCounts)
            .map(([referrer, views]) => ({ referrer, views }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 10);

        // Aggregation: Top Countries
        const countryCounts: Record<string, number> = {};
        views.forEach(v => {
            const country = v.country || "Unknown";
            countryCounts[country] = (countryCounts[country] || 0) + 1;
        });
         const topCountries = Object.entries(countryCounts)
            .map(([country, views]) => ({ country, views }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 5);
            
         // Recent Activity
         const recentActivity = views
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 50);

        // Affiliate clicks aggregation
        const providerClicksCounts: Record<string, number> = {};
        clicks.forEach(c => {
            if (c.provider_name) {
                providerClicksCounts[c.provider_name] = (providerClicksCounts[c.provider_name] || 0) + 1;
            }
        });
        const clicksByProvider = Object.entries(providerClicksCounts)
            .map(([provider_name, click_count]) => ({ provider_name, click_count }))
            .sort((a, b) => b.click_count - a.click_count)
            .slice(0, 10);

        const dailyClicksMap: Record<string, { date: string, count: number }> = {};
        clicks.forEach(v => {
            const dateStr = v.created_at.split('T')[0];
             if (!dailyClicksMap[dateStr]) {
                dailyClicksMap[dateStr] = { date: dateStr, count: 0 };
            }
            dailyClicksMap[dateStr].count++;
        });
        const dailyClicks = Object.values(dailyClicksMap).sort((a, b) => a.date.localeCompare(b.date));
        
        const nowMs = Date.now();
        const startOfDay = new Date(now).setHours(0,0,0,0);
        const startOfWeek = new Date(now).setDate(now.getDate() - now.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

        let clicksToday = 0;
        let clicksWeek = 0;
        let clicksMonth = 0;

        clicks.forEach(c => {
             const createdMs = new Date(c.created_at).getTime();
             if (createdMs >= startOfDay) clicksToday++;
             if (createdMs >= startOfWeek) clicksWeek++;
             if (createdMs >= startOfMonth) clicksMonth++;
        });

        return NextResponse.json({
            summary: {
                today: todayViews.count || 0,
                week: weekViews.count || 0,
                month: monthViews.count || 0,
                clicksToday,
                clicksWeek,
                clicksMonth,
                avgVisitsPerDay,
            },
            topPages,
            topPosts,
            dailyTraffic,
            topReferrers,
            topCountries,
            recentActivity,
            clicksByProvider,
            dailyClicks,
        });
    } catch (err) {
        console.error("Analytics API error:", err);
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }
}
