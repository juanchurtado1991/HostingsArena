import { Eye, MousePointerClick, Smartphone, Tablet, Laptop } from "lucide-react";
import { AnalyticsData, getCountryName } from "../types";

export function MetricsViews({ activeView, data }: { activeView: string, data: AnalyticsData }) {
    return (
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
    );
}
