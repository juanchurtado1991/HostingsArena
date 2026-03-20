export function MiniBarChart({ data, maxViews }: { data: { day: string; views: number }[]; maxViews: number }) {
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
