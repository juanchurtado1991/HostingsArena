import { Eye, MousePointerClick, TrendingUp } from "lucide-react";
import { AnalyticsData } from "../types";

interface MetricsGridProps {
    data: AnalyticsData;
    periodLabel: string;
    avgClicksPerDay: string;
    totalViewsPeriod: number;
    totalClicksPeriod: number;
    dynamicCTR: string;
}

export function MetricsGrid({ 
    data, 
    periodLabel, 
    avgClicksPerDay, 
    totalViewsPeriod, 
    totalClicksPeriod,
    dynamicCTR 
}: MetricsGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/50">
                <div className="flex items-center gap-2 mb-2 text-blue-400">
                    <Eye className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-widest font-bold">Page Views</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                        <p className="text-lg font-bold">{data.summary.avgVisitsPerDay?.toLocaleString() || 0}</p>
                        <p className="text-[9px] text-muted-foreground uppercase">Avg/Day</p>
                    </div>
                    <div className="text-center border-x border-border/50">
                        <p className="text-lg font-bold text-primary">{totalViewsPeriod.toLocaleString()}</p>
                        <p className="text-[9px] text-primary uppercase font-bold">{periodLabel}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold">{data.summary.today.toLocaleString()}</p>
                        <p className="text-[9px] text-muted-foreground uppercase">Today</p>
                    </div>
                </div>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border/50">
                <div className="flex items-center gap-2 mb-2 text-green-400">
                    <MousePointerClick className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-widest font-bold">Affiliate Clicks</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                        <p className="text-lg font-bold">{avgClicksPerDay}</p>
                        <p className="text-[9px] text-muted-foreground uppercase">Avg/Day</p>
                    </div>
                    <div className="text-center border-x border-border/50">
                        <p className="text-lg font-bold text-green-500">{totalClicksPeriod.toLocaleString()}</p>
                        <p className="text-[9px] text-green-500 uppercase font-bold">{periodLabel}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold">{data.summary.clicksToday?.toLocaleString() || 0}</p>
                        <p className="text-[9px] text-muted-foreground uppercase">Today</p>
                    </div>
                </div>
            </div>

            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary mb-1" />
                <p className="text-2xl font-black text-primary">{dynamicCTR}%</p>
                <p className="text-[10px] uppercase tracking-widest text-primary/70 font-bold">Avg. Conversion Rate</p>
            </div>
        </div>
    );
}
