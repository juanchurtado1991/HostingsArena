import React from "react";
import { Globe, CheckCircle, Pause, Clock, XCircle, AlertTriangle } from "lucide-react";
import { type AffiliateStats } from "./AffiliateConstants";

interface AffiliateStatsCardsProps {
    stats: AffiliateStats;
}

export function AffiliateStatsCards({ stats }: AffiliateStatsCardsProps) {
    const statsData = [
        { label: "Total Partners", value: stats.total, icon: Globe, gradient: "from-blue-500/20 to-indigo-500/20", color: "text-blue-400" },
        { label: "Active", value: stats.active, icon: CheckCircle, gradient: "from-emerald-500/20 to-green-500/20", color: "text-emerald-400" },
        { label: "Paused", value: stats.paused, icon: Pause, gradient: "from-amber-500/20 to-orange-500/20", color: "text-amber-400" },
        { label: "Processing", value: stats.processing, icon: Clock, gradient: "from-sky-500/20 to-blue-500/20", color: "text-sky-400" },
        { label: "Rejected", value: stats.rejected, icon: XCircle, gradient: "from-gray-500/20 to-slate-500/20", color: "text-gray-400" },
        { label: "Expired", value: stats.expired, icon: AlertTriangle, gradient: "from-red-500/20 to-rose-500/20", color: "text-red-400" },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {statsData.map((stat) => (
                <div
                    key={stat.label}
                    className={`relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br ${stat.gradient} p-5 backdrop-blur-sm transition-transform hover:scale-[1.02]`}
                >
                    <div className="flex items-center justify-between mb-3">
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                    </div>
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                </div>
            ))}
        </div>
    );
}
