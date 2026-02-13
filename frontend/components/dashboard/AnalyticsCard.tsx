"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { BarChart3, Eye, TrendingUp, Globe, ExternalLink, FileText, ArrowUpRight, ArrowDownRight, Minus, Users } from "lucide-react";

interface AnalyticsData {
    summary: { today: number; week: number; month: number };
    topPages: { path: string; views: number }[];
    topPosts: { post_slug: string; views: number }[];
    dailyTraffic: { day: string; views: number }[];
    topReferrers: { referrer: string; views: number }[];
    topCountries: { country: string; views: number }[];
    recentVisitors: { ip_address: string; country: string; path: string; referrer: string; created_at: string }[];
}

const countryNames = new Intl.DisplayNames(['en'], { type: 'region' });

const getCountryName = (code: string) => {
    try {
        return countryNames.of(code) || code;
    } catch {
        return code;
    }
};

function MiniBarChart({ data, maxViews }: { data: { day: string; views: number }[]; maxViews: number }) {
    const last14 = data.slice(-14);
    return (
        <div className="flex items-end gap-[3px] h-16">
            {last14.map((d, i) => (
                <div
                    key={i}
                    className="flex-1 rounded-t-sm bg-gradient-to-t from-primary to-primary/60 min-h-[2px] transition-all duration-300 hover:from-primary hover:to-sky-400"
                    style={{ height: `${Math.max(((d.views / (maxViews || 1)) * 100), 3)}%` }}
                    title={`${d.day}: ${d.views} views`}
                />
            ))}
        </div>
    );
}

function TrendBadge({ current, previous }: { current: number; previous: number }) {
    if (previous === 0 && current === 0) return <span className="flex items-center gap-1 text-xs text-muted-foreground"><Minus className="w-3 h-3" /> —</span>;
    if (previous === 0) return <span className="flex items-center gap-1 text-xs text-green-500"><ArrowUpRight className="w-3 h-3" /> New</span>;
    const pct = ((current - previous) / previous * 100).toFixed(0);
    const isUp = current >= previous;
    return (
        <span className={`flex items-center gap-1 text-xs ${isUp ? "text-green-500" : "text-red-400"}`}>
            {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {isUp ? "+" : ""}{pct}%
        </span>
    );
}

export function AnalyticsCard() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState<"posts" | "pages" | "referrers" | "countries" | "visitors">("visitors");

    useEffect(() => {
        fetch("/api/admin/analytics")
            .then(r => r.json())
            .then(setData)
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <GlassCard className="p-8 mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary"><BarChart3 className="w-6 h-6" /></div>
                    <h3 className="text-xl font-bold">Site Analytics</h3>
                </div>
                <div className="text-center py-12 text-muted-foreground">Loading analytics...</div>
            </GlassCard>
        );
    }

    if (!data) {
        return (
            <GlassCard className="p-8 mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary"><BarChart3 className="w-6 h-6" /></div>
                    <div>
                        <h3 className="text-xl font-bold">Site Analytics</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">Run the <code className="bg-muted px-1.5 py-0.5 rounded text-xs">page_views_schema.sql</code> in Supabase to enable tracking.</p>
                    </div>
                </div>
            </GlassCard>
        );
    }

    const maxDailyViews = Math.max(...(data.dailyTraffic.map(d => d.views) || [0]), 1);

    const thisWeek = data.summary.week;
    const prevWeek = data.summary.month - data.summary.week;
    const prevWeekNormalized = Math.round(prevWeek * (7 / 23)); // normalize ~23 remaining days to 7

    const views = [
        { label: "posts", title: "Top Posts", icon: <FileText className="w-3.5 h-3.5" /> },
        { label: "pages", title: "Top Pages", icon: <Eye className="w-3.5 h-3.5" /> },
        { label: "referrers", title: "Referrers", icon: <ExternalLink className="w-3.5 h-3.5" /> },
        { label: "countries", title: "Countries", icon: <Globe className="w-3.5 h-3.5" /> },
        { label: "visitors", title: "Live Visitors", icon: <Users className="w-3.5 h-3.5" /> },
    ] as const;

    return (
        <GlassCard className="p-8 mb-8" hoverEffect={false}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Site Analytics</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Page views from tracked traffic</p>
                    </div>
                </div>
                <TrendBadge current={thisWeek} previous={prevWeekNormalized} />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 text-center">
                    <p className="text-2xl font-bold">{data.summary.today.toLocaleString()}</p>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mt-1">Today</p>
                </div>
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 text-center">
                    <p className="text-2xl font-bold">{data.summary.week.toLocaleString()}</p>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mt-1">Last 7 days</p>
                </div>
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 text-center">
                    <p className="text-2xl font-bold">{data.summary.month.toLocaleString()}</p>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mt-1">Last 30 days</p>
                </div>
            </div>

            {/* Mini Bar Chart */}
            {data.dailyTraffic.length > 0 && (
                <div className="mb-6">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">Daily Traffic (Last 14 Days)</p>
                    <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                        <MiniBarChart data={data.dailyTraffic} maxViews={maxDailyViews} />
                        <div className="flex justify-between mt-2 text-[9px] text-muted-foreground">
                            <span>{data.dailyTraffic.slice(-14)[0]?.day}</span>
                            <span>Today</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
                {views.map(v => (
                    <button
                        key={v.label}
                        onClick={() => setActiveView(v.label)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${activeView === v.label
                            ? "bg-primary/15 text-primary border border-primary/20"
                            : "text-muted-foreground hover:bg-muted/50 border border-transparent"
                            }`}
                    >
                        {v.icon}
                        {v.title}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-1.5">
                {activeView === "posts" && (
                    data.topPosts.length > 0 ? data.topPosts.map((p, i) => (
                        <div key={i} className="flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-muted/30 transition-colors group">
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                                <span className="text-sm truncate">{p.post_slug}</span>
                            </div>
                            <span className="text-sm font-semibold tabular-nums">{p.views.toLocaleString()} <span className="text-muted-foreground text-xs">views</span></span>
                        </div>
                    )) : <p className="text-sm text-muted-foreground text-center py-6">No post views tracked yet.</p>
                )}

                {activeView === "pages" && (
                    data.topPages.length > 0 ? data.topPages.map((p, i) => (
                        <div key={i} className="flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                                <span className="text-sm truncate font-mono">{p.path}</span>
                            </div>
                            <span className="text-sm font-semibold tabular-nums">{p.views.toLocaleString()}</span>
                        </div>
                    )) : <p className="text-sm text-muted-foreground text-center py-6">No page views tracked yet.</p>
                )}

                {activeView === "referrers" && (
                    data.topReferrers.length > 0 ? data.topReferrers.map((r, i) => {
                        let domain = r.referrer;
                        try { domain = new URL(r.referrer).hostname; } catch { /* keep as-is */ }
                        return (
                            <div key={i} className="flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                                    <span className="text-sm truncate">{domain}</span>
                                </div>
                                <span className="text-sm font-semibold tabular-nums">{r.views.toLocaleString()}</span>
                            </div>
                        );
                    }) : <p className="text-sm text-muted-foreground text-center py-6">No referrer data yet.</p>
                )}

                {activeView === "countries" && (
                    data.topCountries.length > 0 ? data.topCountries.map((c, i) => (
                        <div key={i} className="flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}</span>
                                <span className="text-sm">
                                    <span className="mr-2 text-lg">
                                        {/* Simple flag mapping or emoji if needed, or just remove if name is enough */}
                                        {`https://flagcdn.com/24x18/${c.country.toLowerCase()}.png` ? <img src={`https://flagcdn.com/24x18/${c.country.toLowerCase()}.png`} alt={c.country} className="inline w-4 h-3 object-cover mr-1 rounded-[1px]" onError={(e) => e.currentTarget.style.display = 'none'} /> : "🌍"}
                                    </span>
                                    {getCountryName(c.country)}
                                </span>
                            </div>
                            <span className="text-sm font-semibold tabular-nums">{c.views.toLocaleString()}</span>
                        </div>
                    )) : <p className="text-sm text-muted-foreground text-center py-6">No country data yet.</p>
                )}

                {activeView === "visitors" && (
                    data.recentVisitors?.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="text-xs text-muted-foreground border-b border-border/50">
                                    <tr>
                                        <th className="px-4 py-2 font-medium">Time</th>
                                        <th className="px-4 py-2 font-medium">IP Address</th>
                                        <th className="px-4 py-2 font-medium">Country</th>
                                        <th className="px-4 py-2 font-medium">Path</th>
                                        <th className="px-4 py-2 font-medium">Referrer</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {data.recentVisitors.map((v, i) => (
                                        <tr key={i} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-2.5 text-muted-foreground text-xs whitespace-nowrap">
                                                {new Date(v.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-4 py-2.5 font-mono text-xs">{v.ip_address || "—"}</td>
                                            <td className="px-4 py-2.5">
                                                {v.country ? (
                                                    <span className="flex items-center gap-1.5">
                                                        <img
                                                            src={`https://flagcdn.com/24x18/${v.country.toLowerCase()}.png`}
                                                            alt={v.country}
                                                            className="w-4 h-3 object-cover rounded-[1px]"
                                                            onError={(e) => e.currentTarget.style.display = 'none'}
                                                        />
                                                        <span className="truncate max-w-[100px]">{getCountryName(v.country)}</span>
                                                    </span>
                                                ) : <span className="text-muted-foreground">—</span>}
                                            </td>
                                            <td className="px-4 py-2.5 max-w-[150px] truncate text-muted-foreground" title={v.path}>{v.path}</td>
                                            <td className="px-4 py-2.5 max-w-[150px] truncate text-muted-foreground" title={v.referrer || ""}>
                                                {v.referrer ? new URL(v.referrer).hostname : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <p className="text-sm text-muted-foreground text-center py-6">No recent visitors tracked.</p>
                )}
            </div>
        </GlassCard>
    );
}
