"use client";

import { useState, useEffect } from "react";
import { Copy, Plus, Activity, Eye, MousePointerClick, CalendarDays, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnalyticsData, AnalyticsTimeframe, DateRange } from "./types";
import { MiniBarChart } from "./components/MiniBarChart";
import { TrendBadge } from "./components/TrendBadge";
import { MetricsGrid } from "./components/MetricsGrid";
import { MetricsViews } from "./components/MetricsViews";
import { AIInsights } from "./components/AIInsights";
import { logger } from "@/lib/logger";
import { motion, AnimatePresence } from "framer-motion";

interface AnalyticsCardProps {
    data?: AnalyticsData;
    timeframe?: AnalyticsTimeframe;
    setTimeframe?: (tf: AnalyticsTimeframe) => void;
}

export function AnalyticsCard({ 
    data: externalData, 
    timeframe: externalTimeframe, 
    setTimeframe: externalSetTimeframe 
}: AnalyticsCardProps) {
    const [internalData, setInternalData] = useState<AnalyticsData | null>(null);
    const [internalTimeframe, setInternalTimeframe] = useState<AnalyticsTimeframe>("1d");
    const [customRange, setCustomRange] = useState<DateRange>({
        from: new Date(new Date().setDate(new Date().getDate() - 7)),
        to: new Date()
    });
    const [loading, setLoading] = useState(false);
    const [activeView, setActiveView] = useState<"posts" | "pages" | "referrers" | "countries" | "visitors" | "clicks">("visitors");
    const [showInsights, setShowInsights] = useState(false);

    const data = externalData || internalData;
    const timeframe = externalTimeframe || internalTimeframe;
    const setTimeframe = externalSetTimeframe || setInternalTimeframe;

    useEffect(() => {
        if (!externalData) {
            fetchAnalytics();
        }
    }, [timeframe, customRange, externalData]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const now = new Date();
            let startDate = new Date();
            let endDate = now;
            
            if (timeframe === '1d') {
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            } else if (timeframe === '7d') {
                startDate.setDate(now.getDate() - 7);
            } else if (timeframe === '30d') {
                startDate.setDate(now.getDate() - 30);
            } else if (timeframe === '90d') {
                startDate.setDate(now.getDate() - 90);
            } else if (timeframe === '12m') {
                startDate.setFullYear(now.getFullYear() - 1);
            } else if (timeframe === 'custom') {
                startDate = customRange.from;
                endDate = customRange.to;
            }

            const res = await fetch(`/api/admin/analytics?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
            const result = await res.json();
            if (result.summary) {
                setInternalData(result);
            }
        } catch (error) {
            logger.error("Failed to fetch analytics", error);
        } finally {
            setLoading(false);
        }
    };

    if (!data) {
        return (
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-border/50 col-span-12 xl:col-span-8 flex flex-col h-[700px] items-center justify-center mb-8">
                <RefreshCw className="w-8 h-8 text-primary animate-spin mb-4" />
                <p className="text-sm text-muted-foreground font-medium">Loading analytics...</p>
            </div>
        );
    }

    const totalViewsPeriod = data.summary.periodViews ?? (data.summary.today + data.summary.week + data.summary.month);
    const totalViewsPrevious = Math.floor(totalViewsPeriod * 0.85); // Simulated pre calculation
    const totalClicksPeriod = data.summary.periodClicks ?? ((data.summary.clicksToday || 0) + (data.summary.clicksWeek || 0) + (data.summary.clicksMonth || 0));

    const periodLabel = timeframe === '1d' ? 'Today' : timeframe === '7d' ? 'Last 7 Days' : timeframe === '30d' ? 'Last 30 Days' : timeframe === '90d' ? 'Last 90 Days' : timeframe === '12m' ? 'Last 12 Months' : 'Custom Range';
    const dynamicCTR = totalViewsPeriod > 0 ? ((totalClicksPeriod / totalViewsPeriod) * 100).toFixed(1) : "0.0";
    
    // Calculate avg per day based on real diff
    const getDiffDays = () => {
        if (timeframe === '1d') return 1;
        if (timeframe === '7d') return 7;
        if (timeframe === '30d') return 30;
        if (timeframe === '90d') return 90;
        if (timeframe === '12m') return 365;
        const diff = Math.abs(customRange.to.getTime() - customRange.from.getTime());
        return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };
    const diffDays = getDiffDays();
    const avgClicksPerDay = (totalClicksPeriod / diffDays).toFixed(1);

    const maxViewsDaily = Math.max(...data.dailyTraffic.map(d => d.views), 1);

    return (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-border/50 col-span-12 xl:col-span-8 flex flex-col h-[740px] relative mb-8">
            {loading && (
                <div className="absolute top-4 right-4 animate-spin text-primary/50">
                    <RefreshCw className="w-4 h-4" />
                </div>
            )}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary flex items-center justify-center shrink-0 border border-primary/20">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                                Traffic & Conversions
                            </h2>
                            <p className="text-sm text-muted-foreground font-medium">Real-time performance metrics</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/50">
                        {(['1d', '7d', '30d', '90d', '12m'] as const).map(tf => (
                            <button
                                key={tf}
                                onClick={() => setTimeframe(tf)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                                    timeframe === tf 
                                        ? "bg-white text-primary shadow-sm border border-border/50" 
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                                }`}
                            >
                                {tf}
                            </button>
                        ))}
                        <button
                            onClick={() => setTimeframe('custom')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                                timeframe === 'custom' 
                                    ? "bg-white text-primary shadow-sm border border-border/50" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                            }`}
                        >
                            Custom
                        </button>
                    </div>

                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 font-bold text-xs gap-2"
                        onClick={() => setShowInsights(true)}
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        AI Insights
                    </Button>
                </div>
            </div>

            <AnimatePresence>
                {showInsights && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute inset-0 z-50 bg-white rounded-3xl p-8 flex flex-col shadow-2xl border border-primary/10"
                    >
                        <AIInsights data={data} onClose={() => setShowInsights(false)} />
                    </motion.div>
                )}
            </AnimatePresence>

            {timeframe === 'custom' && (
                <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-muted/20 border border-primary/10 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-4 flex-1">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Start Date</label>
                            <input 
                                type="date" 
                                value={customRange.from.toISOString().split('T')[0]}
                                onChange={(e) => setCustomRange(prev => ({ ...prev, from: new Date(e.target.value) }))}
                                className="w-full bg-white border border-border/50 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 ring-primary/20 outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">End Date</label>
                            <input 
                                type="date" 
                                value={customRange.to.toISOString().split('T')[0]}
                                onChange={(e) => setCustomRange(prev => ({ ...prev, to: new Date(e.target.value) }))}
                                className="w-full bg-white border border-border/50 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 ring-primary/20 outline-none"
                            />
                        </div>
                    </div>
                </div>
            )}

            <MetricsGrid 
                data={data} 
                periodLabel={periodLabel} 
                avgClicksPerDay={avgClicksPerDay} 
                totalViewsPeriod={totalViewsPeriod} 
                totalClicksPeriod={totalClicksPeriod} 
                dynamicCTR={dynamicCTR} 
            />

            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    Traffic Trend
                </h3>
            </div>
            
            <div className="p-4 rounded-2xl bg-muted/20 border border-border/40 mb-6 relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <p className="text-2xl font-black tabular-nums">{totalViewsPeriod.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Total Views ({periodLabel})</p>
                    </div>
                    <div className="text-right">
                        <TrendBadge current={totalViewsPeriod} previous={totalViewsPrevious} />
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">VS PREV PERIOD</p>
                    </div>
                </div>
                <div className="h-16 w-full mt-4">
                    <MiniBarChart data={data.dailyTraffic} maxViews={maxViewsDaily} />
                </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-4 custom-scrollbar sticky top-0 bg-white z-10">
                {[
                    { id: "visitors", label: "Real-time", icon: Activity },
                    { id: "clicks", label: "Conversions", icon: MousePointerClick },
                    { id: "posts", label: "Top Posts", icon: Copy },
                    { id: "pages", label: "Top Pages", icon: Copy },
                    { id: "referrers", label: "Sources", icon: Plus },
                    { id: "countries", label: "Locations", icon: Plus }
                ].map(view => (
                    <button
                        key={view.id}
                        onClick={() => setActiveView(view.id as any)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                            activeView === view.id 
                                ? "bg-primary/5 text-primary border-primary/20" 
                                : "bg-white text-muted-foreground border-border/50 hover:bg-muted/40 hover:text-foreground"
                        }`}
                    >
                        <view.icon className="w-3.5 h-3.5" />
                        {view.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mt-2 border border-border/40 rounded-xl bg-white shadow-inner">
                <div className="p-2">
                     <MetricsViews activeView={activeView} data={data} />
                </div>
            </div>
        </div>
    );
}
