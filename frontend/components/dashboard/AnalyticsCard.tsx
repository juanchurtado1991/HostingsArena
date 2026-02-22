"use client";

import { useState, useEffect, useCallback } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { BarChart3, Eye, TrendingUp, Globe, ExternalLink, FileText, ArrowUpRight, ArrowDownRight, Minus, Users, MousePointerClick, Smartphone, Laptop, Tablet, Calendar } from "lucide-react";


interface AnalyticsData {
    summary: {
        today: number;
        week: number;
        month: number;
        clicksToday?: number;
        clicksWeek?: number;
        clicksMonth?: number;
        avgVisitsPerDay?: number;
    };
    topPages: { path: string; views: number }[];
    topPosts: { post_slug: string; views: number }[];
    dailyTraffic: { day: string; views: number }[];
    topReferrers: { referrer: string; views: number }[];
    topCountries: { country: string; views: number }[];
    recentActivity: { type: 'view' | 'click'; ip_address: string; country: string; detail: string; source: string; created_at: string; device_type: string }[];
    clicksByProvider: { provider_name: string; click_count: number }[];
    dailyClicks: { date: string; count: number }[];
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
    const [activeView, setActiveView] = useState<"posts" | "pages" | "referrers" | "countries" | "visitors" | "clicks">("visitors");

    const [timeframe, setTimeframe] = useState<"today" | "week" | "month" | "all" | "custom">("all");
    const [customStart, setCustomStart] = useState<string>("");
    const [customEnd, setCustomEnd] = useState<string>("");

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        let url = "/api/admin/analytics";
        const queryParams = new URLSearchParams();
        
        const now = new Date();
        if (timeframe === "today") {
            const todayStr = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
            queryParams.append("startDate", todayStr);
            queryParams.append("endDate", now.toISOString());
        } else if (timeframe === "week") {
            const weekStr = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
            queryParams.append("startDate", weekStr);
            queryParams.append("endDate", now.toISOString());
        } else if (timeframe === "month") {
            const monthStr = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
            queryParams.append("startDate", monthStr);
            queryParams.append("endDate", now.toISOString());
        } else if (timeframe === "all") {
            // "Beginning of time" for the application
            queryParams.append("startDate", new Date('2020-01-01T00:00:00.000Z').toISOString());
            queryParams.append("endDate", now.toISOString());
        } else if (timeframe === "custom" && customStart) {
            queryParams.append("startDate", new Date(customStart).toISOString());
            if (customEnd) {
                queryParams.append("endDate", new Date(customEnd).toISOString());
            }
        }
        
        if (queryParams.toString()) {
            url += `?${queryParams.toString()}`;
        }
        
        try {
            const r = await fetch(url);
            const d = await r.json();
            setData(d);
        } catch(e) {
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [timeframe, customStart, customEnd]);

    useEffect(() => {
        if (timeframe !== "custom") {
            fetchAnalytics();
        }
    }, [timeframe, fetchAnalytics]);

    const handleApplyCustomDate = () => {
        if (customStart) fetchAnalytics();
    };

    if (loading && !data) {
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
        { label: "visitors", title: "Activity Feed", icon: <Users className="w-3.5 h-3.5" /> },
        { label: "clicks", title: "Affiliate Clicks", icon: <MousePointerClick className="w-3.5 h-3.5" /> },
        { label: "posts", title: "Top Posts", icon: <FileText className="w-3.5 h-3.5" /> },
        { label: "pages", title: "Top Pages", icon: <Eye className="w-3.5 h-3.5" /> },
        { label: "referrers", title: "Referrers", icon: <ExternalLink className="w-3.5 h-3.5" /> },
        { label: "countries", title: "Countries", icon: <Globe className="w-3.5 h-3.5" /> },
    ] as const;

    const globalCTR = data.summary.month > 0
        ? ((data.summary.clicksMonth || 0) / data.summary.month * 100).toFixed(2)
        : "0.00";

    return (
        <GlassCard className="p-8 mb-8" hoverEffect={false}>
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">Performance & Analytics {loading && <span className="text-xs text-muted-foreground animate-pulse font-normal">(refreshing...)</span>}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Global CTR: <span className="text-primary font-bold">{globalCTR}%</span> across all tracking</p>
                    </div>
                </div>
                
                <div className="flex flex-col md:flex-row items-end md:items-center gap-3">
                    {/* Timeframe Selector */}
                    <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-xl border border-border/50">
                        <Calendar className="w-4 h-4 text-muted-foreground ml-2" />
                        <select
                            value={timeframe}
                            onChange={(e) => setTimeframe(e.target.value as any)}
                            className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer outline-none"
                        >
                            <option value="today">Today</option>
                            <option value="week">Last 7 Days</option>
                            <option value="month">Last 30 Days</option>
                            <option value="all">All Time</option>
                            <option value="custom">Custom Range...</option>
                        </select>
                    </div>
                    
                    {timeframe === "custom" && (
                        <div className="flex items-center gap-2">
                            <input 
                                type="date" 
                                value={customStart}
                                onChange={(e) => setCustomStart(e.target.value)}
                                className="bg-muted/30 border border-border/50 rounded-lg px-2 py-1 text-sm font-medium"
                            />
                            <span className="text-muted-foreground">to</span>
                            <input 
                                type="date" 
                                value={customEnd}
                                onChange={(e) => setCustomEnd(e.target.value)}
                                className="bg-muted/30 border border-border/50 rounded-lg px-2 py-1 text-sm font-medium"
                            />
                            <button 
                                onClick={handleApplyCustomDate}
                                className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1 rounded-lg text-sm font-bold transition-colors"
                            >
                                Apply
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col items-end ml-4">
                        <TrendBadge current={thisWeek} previous={prevWeekNormalized} />
                        <span className="text-[10px] text-muted-foreground">Views Trend</span>
                    </div>
                </div>
            </div>

            {/* Summary Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Views Summary */}
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/50">
                    <div className="flex items-center gap-2 mb-2 text-blue-400">
                        <Eye className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Page Views</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        <div className="text-center border-r border-border/50">
                            <p className="text-lg font-bold">{data.summary.avgVisitsPerDay?.toLocaleString() || 0}</p>
                            <p className="text-[9px] text-muted-foreground uppercase">Avg/Day</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold">{data.summary.today.toLocaleString()}</p>
                            <p className="text-[9px] text-muted-foreground uppercase">Today</p>
                        </div>
                        <div className="text-center border-x border-border/50">
                            <p className="text-lg font-bold">{data.summary.week.toLocaleString()}</p>
                            <p className="text-[9px] text-muted-foreground uppercase">7d</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold">{data.summary.month.toLocaleString()}</p>
                            <p className="text-[9px] text-muted-foreground uppercase">Total</p>
                        </div>
                    </div>
                </div>

                {/* Clicks Summary */}
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/50">
                    <div className="flex items-center gap-2 mb-2 text-green-400">
                        <MousePointerClick className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Affiliate Clicks</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="text-center">
                            <p className="text-lg font-bold">{data.summary.clicksToday?.toLocaleString() || 0}</p>
                            <p className="text-[9px] text-muted-foreground uppercase">Today</p>
                        </div>
                        <div className="text-center border-x border-border/50">
                            <p className="text-lg font-bold">{data.summary.clicksWeek?.toLocaleString() || 0}</p>
                            <p className="text-[9px] text-muted-foreground uppercase">7d</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold">{data.summary.clicksMonth?.toLocaleString() || 0}</p>
                            <p className="text-[9px] text-muted-foreground uppercase">30d</p>
                        </div>
                    </div>
                </div>

                {/* Conversion Summary */}
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary mb-1" />
                    <p className="text-2xl font-black text-primary">{globalCTR}%</p>
                    <p className="text-[10px] uppercase tracking-widest text-primary/70 font-bold">Avg. Conversion Rate</p>
                </div>
            </div>

            {/* Mini Bar Chart */}
            {data.dailyTraffic.length > 0 && (
                <div className="mb-6">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">Traffic Distribution (Views vs Clicks)</p>
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
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                {views.map(v => (
                    <button
                        key={v.label}
                        onClick={() => setActiveView(v.label)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${activeView === v.label
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
                        <div key={i} className="flex items-center justify-between px-3 md:px-4 py-2.5 rounded-xl hover:bg-muted/30 transition-colors group">
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="text-xs font-bold text-muted-foreground w-5 shrink-0">{i + 1}</span>
                                <span className="text-xs md:text-sm truncate">{p.post_slug}</span>
                            </div>
                            <span className="text-xs md:text-sm font-semibold tabular-nums shrink-0 ml-2">{p.views.toLocaleString()} <span className="text-muted-foreground text-[10px]">views</span></span>
                        </div>
                    )) : <p className="text-sm text-muted-foreground text-center py-6">No post views tracked yet.</p>
                )}

                {activeView === "pages" && (
                    data.topPages.length > 0 ? data.topPages.map((p, i) => (
                        <div key={i} className="flex items-center justify-between px-3 md:px-4 py-2.5 rounded-xl hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-2 md:gap-3 min-w-0">
                                <span className="text-xs font-bold text-muted-foreground w-5 shrink-0">{i + 1}</span>
                                <span className="text-[11px] md:text-sm truncate font-mono">{p.path}</span>
                            </div>
                            <span className="text-xs md:text-sm font-semibold tabular-nums shrink-0 ml-2">{p.views.toLocaleString()}</span>
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

                {activeView === "clicks" && (
                    data.clicksByProvider?.length > 0 ? (
                        <div className="space-y-3">
                            {data.clicksByProvider.map((c, i) => (
                                <div key={i} className="flex items-center justify-between px-4 py-3 rounded-2xl bg-muted/20 border border-border/30 hover:bg-muted/40 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-1 ring-primary/20">
                                            {c.provider_name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{c.provider_name}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-tight">Top conversion channel</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black tabular-nums">{c.click_count.toLocaleString()}</p>
                                        <p className="text-[10px] text-green-500 font-bold">Clicks</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-sm text-muted-foreground text-center py-6">No clicks recorded yet.</p>
                )}

                {activeView === "visitors" && (
                    data.recentActivity?.length > 0 ? (
                        <>
                            {/* MOBILE: compact activity cards */}
                            <div className="block md:hidden space-y-1.5">
                                {data.recentActivity.map((v, i) => (
                                    <div key={i} className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-muted/30 transition-colors">
                                        {v.device_type === 'mobile' ? <Smartphone className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> :
                                            v.device_type === 'tablet' ? <Tablet className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> :
                                                <Laptop className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${v.type === 'click' ? 'text-green-500' : 'text-blue-500'}`}>{v.type}</span>
                                                {v.country && <img src={`https://flagcdn.com/24x18/${v.country.toLowerCase()}.png`} alt={v.country} className="w-3.5 h-2.5 object-cover rounded-[1px]" onError={(e) => e.currentTarget.style.display = 'none'} />}
                                                <span className="text-[10px] text-muted-foreground truncate">{v.detail}</span>
                                            </div>
                                            <div className="text-[9px] text-muted-foreground/60">{new Date(v.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {v.source ? `· via ${v.source.replace('https://', '').replace(/^(?:www\.)?([^/]+).*$/, '$1')}` : ''}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* DESKTOP: full table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="text-xs text-muted-foreground border-b border-border/50">
                                        <tr>
                                            <th className="px-4 py-2 font-medium">Time</th>
                                            <th className="px-4 py-2 font-medium">Action</th>
                                            <th className="px-4 py-2 font-medium">Device</th>
                                            <th className="px-4 py-2 font-medium">Location</th>
                                            <th className="px-4 py-2 font-medium">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                        {data.recentActivity.map((v, i) => (
                                            <tr key={i} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-4 py-2.5 text-muted-foreground text-xs whitespace-nowrap">
                                                    {new Date(v.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${v.type === 'click' ? 'text-green-500' : 'text-blue-500'}`}>
                                                        {v.type === 'click' ? <MousePointerClick className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        {v.type === 'click' ? "Click" : "View"}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2.5 text-muted-foreground">
                                                    {v.device_type === 'mobile' ? <span title="Mobile"><Smartphone className="w-3.5 h-3.5" /></span> :
                                                        v.device_type === 'tablet' ? <span title="Tablet"><Tablet className="w-3.5 h-3.5" /></span> :
                                                            <span title="Desktop"><Laptop className="w-3.5 h-3.5" /></span>}
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    {v.country ? (
                                                        <span className="flex items-center gap-1.5 cursor-help" title={v.ip_address || "Unknown IP"}>
                                                            <img
                                                                src={`https://flagcdn.com/24x18/${v.country.toLowerCase()}.png`}
                                                                alt={v.country}
                                                                className="w-4 h-3 object-cover rounded-[1px]"
                                                                onError={(e) => e.currentTarget.style.display = 'none'}
                                                            />
                                                            <span className="truncate max-w-[100px] text-xs">{getCountryName(v.country)}</span>
                                                        </span>
                                                    ) : <span className="text-muted-foreground text-xs">—</span>}
                                                </td>
                                                <td className="px-4 py-2.5 text-xs">
                                                    <div className="flex flex-col max-w-[200px]">
                                                        <span className="truncate font-medium" title={v.detail}>{v.detail}</span>
                                                        {v.source && <span className="text-muted-foreground truncate" title={v.source}>via {v.source.replace('https://', '').replace(/^(?:www\.)?([^/]+).*$/, '$1')}</span>}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : <p className="text-sm text-muted-foreground text-center py-6">No recent activity tracked.</p>
                )}
            </div>
        </GlassCard>
    );
}
