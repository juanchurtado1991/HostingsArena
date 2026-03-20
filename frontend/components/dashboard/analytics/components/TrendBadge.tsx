import { Minus, ArrowUpRight, ArrowDownRight } from "lucide-react";

export function TrendBadge({ current, previous }: { current: number; previous: number }) {
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
