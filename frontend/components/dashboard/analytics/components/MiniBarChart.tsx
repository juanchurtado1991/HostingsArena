export function MiniBarChart({ data, maxViews }: { data: { day: string; views: number }[]; maxViews: number }) {
    const last14 = data.slice(-14);
    return (
        <div className="flex items-end gap-[3px] h-16">
            {last14.map((d, i) => (
                <div
                    key={i}
                    className="flex-1 rounded-t-sm bg-gradient-to-t from-primary to-primary/60 min-h-[2px] transition-all duration-300 hover:from-primary hover:to-sky-400 group/bar relative"
                    style={{ height: `${Math.max(((d.views / (maxViews || 1)) * 100), 3)}%` }}
                >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-foreground text-background text-[8px] rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none font-bold shadow-xl border border-border/10">
                        {new Date(d.day + 'T00:00:00').toLocaleDateString([], { month: 'short', day: 'numeric' })}: {d.views}
                    </div>
                </div>
            ))}
        </div>
    );
}
