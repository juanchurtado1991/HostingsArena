import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { formatCurrency, cn } from '@/lib/utils';
import { Activity, Server, DollarSign, CheckCircle, AlertCircle, Clock, RefreshCw, MousePointerClick } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnalyticsCard } from '@/components/dashboard/analytics/AnalyticsCard';
import { Top3Manager } from '@/components/dashboard/Top3Manager';
import type { ScraperStatus } from '@/lib/tasks/types';

const SCRAPER_STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
    success: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Online' },
    warning: { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', label: 'Warning' },
    error: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'Error' },
    stale: { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', label: 'Stale' },
};

interface OverviewTabProps {
    dict: any;
    lang: string;
    scraperStatuses: ScraperStatus[];
    scraperMetrics: { total: number; online: number; failing: number; stale: number; syncCount: number };
    scraperFilter: 'all' | 'online' | 'failing' | 'stale';
    setScraperFilter: (v: 'all' | 'online' | 'failing' | 'stale') => void;
    loadingScrapers: boolean;
    fetchScraperStatus: () => void;
    analyticsSummary: { clicksToday: number; clicksMonth: number };
    revenueData: { activeAffiliates: number; totalPosts: number; projectedRevenue: number };
    successRate: number;
    successCount: number;
    errorCount: number;
}

export function OverviewTab({
    dict, lang, scraperStatuses, scraperMetrics, scraperFilter, setScraperFilter,
    loadingScrapers, fetchScraperStatus, analyticsSummary, revenueData,
    successRate, successCount, errorCount,
}: OverviewTabProps) {
    const filteredScrapers = scraperStatuses.filter(s => {
        if (scraperFilter === 'all') return true;
        if (scraperFilter === 'online') return s.status === 'success';
        if (scraperFilter === 'failing') return s.status === 'error' || s.status === 'warning';
        if (scraperFilter === 'stale') return s.status === 'stale';
        return true;
    });

    return (
        <>
            {/* Executive Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {[
                    { label: 'Clicks (30d)', value: analyticsSummary.clicksMonth, icon: MousePointerClick, color: 'text-blue-400', bg: 'bg-blue-500/10', subtitle: `${analyticsSummary.clicksToday} today` },
                    { label: dict.dashboard.metrics.est_revenue, value: formatCurrency(revenueData.projectedRevenue), icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10', subtitle: `${new Date().toLocaleDateString('en-US', { month: 'short' })} est` },
                    { label: dict.dashboard.metrics.success_rate, value: `${successRate.toFixed(1)}%`, icon: Activity, color: successRate > 90 ? 'text-emerald-400' : 'text-amber-400', bg: successRate > 90 ? 'bg-emerald-500/10' : 'bg-amber-500/10', subtitle: `${successCount} OK / ${errorCount} ERR` },
                    { label: dict.dashboard.metrics.monitored_scrapers, value: scraperMetrics.total, icon: Server, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                ].map((stat, i) => (
                    <GlassCard key={i} className="p-4 flex items-center gap-4 border-white/[0.05]">
                        <div className={cn('p-2.5 rounded-xl flex-shrink-0', stat.bg, stat.color)}><stat.icon className="w-5 h-5" /></div>
                        <div className="min-w-0 flex-1">
                            <div className="flex justify-between items-baseline gap-2">
                                <div className="text-xl font-bold leading-tight truncate">{stat.value}</div>
                                {(stat as any).subtitle && <span className="text-[9px] font-medium text-muted-foreground whitespace-nowrap opacity-60">{(stat as any).subtitle}</span>}
                            </div>
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold truncate">{stat.label}</div>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* Technical Health */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                {[
                    { label: 'Online', value: scraperMetrics.online, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'Failing', value: scraperMetrics.failing, icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
                    { label: 'Stale (>3d)', value: scraperMetrics.stale, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'Items Synced', value: scraperMetrics.syncCount, icon: RefreshCw, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                ].map((stat, i) => (
                    <GlassCard key={i} className="p-4 flex items-center gap-4 border-white/[0.05]">
                        <div className={cn('p-2.5 rounded-xl flex-shrink-0', stat.bg, stat.color)}><stat.icon className="w-5 h-5" /></div>
                        <div className="min-w-0 flex-1">
                            <div className="text-xl font-bold leading-tight truncate">{stat.value}</div>
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold truncate">{stat.label}</div>
                        </div>
                    </GlassCard>
                ))}
            </div>

            <AnalyticsCard />
            <Top3Manager />

            {/* Scraper Status Table */}
            <GlassCard className="p-4 md:p-8 border-white/[0.05] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/20 via-primary/20 to-purple-500/20" />
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                    <div>
                        <h3 className="text-lg md:text-xl font-bold flex items-center gap-2"><Activity className="w-5 h-5 text-primary" />{dict.dashboard.scrapers.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">Real-time health monitoring for provider data extraction.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                            {(['all', 'online', 'failing', 'stale'] as const).map(f => (
                                <button key={f} onClick={() => setScraperFilter(f)}
                                    className={cn('px-2 md:px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all', scraperFilter === f ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-white')}>
                                    {f}
                                </button>
                            ))}
                        </div>
                        <Button size="sm" variant="outline" className="h-9 px-3 rounded-xl border-white/10 bg-white/5 hover:bg-white/10" onClick={fetchScraperStatus}>
                            <RefreshCw className={cn('w-3.5 h-3.5 mr-1.5', loadingScrapers && 'animate-spin')} />
                            <span className="text-[11px] font-bold uppercase tracking-wider">{dict.dashboard.scrapers.refresh}</span>
                        </Button>
                        <Button size="sm" variant="outline" className="h-9 px-3 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 hidden sm:flex"
                            onClick={() => { navigator.clipboard.writeText(scraperStatuses.map(s => `[${s.status.toUpperCase()}] ${s.provider_name} (${s.items_synced} items) - ${s.duration_seconds}s - ${s.error_message || 'OK'}`).join('\n')); alert('Report copied!'); }}>
                            <span className="text-[11px] font-bold uppercase tracking-wider">{dict.dashboard.scrapers.copy_report}</span>
                        </Button>
                    </div>
                </div>

                {loadingScrapers ? <div className="text-center py-12 text-muted-foreground">Loading status...</div> : (
                    <>
                        <div className="block md:hidden space-y-2 max-h-[500px] overflow-y-auto">
                            {filteredScrapers.map(item => {
                                const cfg = SCRAPER_STATUS_CONFIG[item.status] || SCRAPER_STATUS_CONFIG.success;
                                const StatusIcon = cfg.icon;
                                return (
                                    <div key={item.id} className={`flex items-center justify-between p-3 rounded-xl border ${cfg.bg} gap-3`}>
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0">{item.provider_name.charAt(0)}</div>
                                            <div className="min-w-0">
                                                <div className="font-bold text-xs truncate">{item.provider_name}</div>
                                                <div className="text-[10px] text-muted-foreground">{item.items_synced} items · {item.duration_seconds}s</div>
                                            </div>
                                        </div>
                                        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border', cfg.bg, cfg.color)}>
                                            <StatusIcon className="w-2.5 h-2.5" />{cfg.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="hidden md:block overflow-x-auto max-h-[600px]">
                            <table className="w-full text-left">
                                <thead className="text-xs uppercase text-muted-foreground border-b border-white/10 sticky top-0 bg-background/95 backdrop-blur z-10">
                                    <tr>
                                        <th className="pb-4 pl-4">{dict.dashboard.scrapers.col_provider}</th>
                                        <th className="pb-4">{dict.dashboard.scrapers.col_type}</th>
                                        <th className="pb-4">{dict.dashboard.scrapers.col_status}</th>
                                        <th className="pb-4">{dict.dashboard.scrapers.col_items}</th>
                                        <th className="pb-4">{dict.dashboard.scrapers.col_duration}</th>
                                        <th className="pb-4">{dict.dashboard.scrapers.col_last_update}</th>
                                        <th className="pb-4 w-[200px]">{dict.dashboard.scrapers.col_message}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredScrapers.map(item => {
                                        const cfg = SCRAPER_STATUS_CONFIG[item.status] || SCRAPER_STATUS_CONFIG.success;
                                        const StatusIcon = cfg.icon;
                                        return (
                                            <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="py-4 pl-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-bold text-muted-foreground group-hover:text-white transition-colors">{item.provider_name.charAt(0)}</div>
                                                        <span className="font-bold text-sm">{item.provider_name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">{item.provider_type}</td>
                                                <td className="py-4">
                                                    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border', cfg.bg)}>
                                                        <StatusIcon className="w-3 h-3" />{cfg.label}
                                                    </span>
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-mono text-xs font-bold">{item.items_synced} items</span>
                                                        <div className="w-16 h-1 bg-white/5 rounded-full mt-1.5 overflow-hidden">
                                                            <div className="h-full bg-primary/40 rounded-full" style={{ width: `${Math.min(100, (item.items_synced / 50) * 100)}%` }} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 font-mono text-xs text-muted-foreground">{item.duration_seconds}s</td>
                                                <td className="py-4 text-muted-foreground text-[11px] font-medium">
                                                    {new Date(item.last_run).toLocaleDateString()}
                                                    <span className="block opacity-40 text-[9px]">{new Date(item.last_run).toLocaleTimeString()}</span>
                                                </td>
                                                <td className="py-4 text-[10px] text-red-400/80 font-medium truncate max-w-[240px]" title={item.error_message || undefined}>
                                                    {item.error_message || <span className="text-muted-foreground/20 italic">No issues detected</span>}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </GlassCard>
        </>
    );
}
