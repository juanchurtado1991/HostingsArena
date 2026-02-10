"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Activity, Server, ExternalLink, Shield } from "lucide-react";
import Link from "next/link";

interface Provider {
    id: number;
    provider_name: string;
    slug: string;
    website_url: string;
    avg_speed_mbps: number;
    server_count: number;
    pricing_monthly: number;
    raw_data: any;
}

export default function VpnList({ initialProviders, affiliateUrls = {} }: { initialProviders: Provider[]; affiliateUrls?: Record<string, string> }) {
    const [search, setSearch] = useState("");

    const filtered = initialProviders.filter(p =>
        p.provider_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-4xl mx-auto">
            {/* Search Bar */}
            <div className="relative mb-10">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search VPNs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-secondary/50 border-0 focus:ring-2 focus:ring-primary/20 outline-none text-lg transition-all"
                />
            </div>

            <div className="space-y-4">
                {filtered.map((p, i) => (
                    <div key={p.id} className="group bg-card hover:bg-secondary/20 rounded-3xl p-6 border border-border/50 transition-all hover:scale-[1.01] hover:shadow-lg flex flex-col md:flex-row items-center gap-6">

                        {/* Rank & Info */}
                        <div className="flex items-center gap-6 w-full md:w-auto flex-1">
                            <div className="flex-shrink-0 w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-xl">
                                {p.provider_name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-xl mb-1 flex items-center gap-2">
                                    {p.provider_name}
                                    {p.raw_data?.jurisdiction && (
                                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                                            {p.raw_data.jurisdiction.includes("Panama") ? "🇵🇦 PAN" :
                                                p.raw_data.jurisdiction.includes("Virgin") ? "🇻🇬 BVI" :
                                                    p.raw_data.jurisdiction.includes("Swiss") || p.raw_data.jurisdiction.includes("Switzerland") ? "🇨🇭 CHE" :
                                                        p.raw_data.jurisdiction.includes("Netherlands") ? "🇳🇱 NLD" : "🌎"}
                                        </span>
                                    )}
                                </h3>
                                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded-md">
                                        <Activity className="w-3 h-3 text-green-500" /> {p.avg_speed_mbps || 0} Mbps
                                    </span>
                                    <span className="flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded-md">
                                        <Server className="w-3 h-3 text-indigo-500" /> {p.server_count?.toLocaleString() || "1000+"} Servers
                                    </span>
                                    {/* Advanced Badges */}
                                    {p.raw_data?.logging_policy && p.raw_data.logging_policy.includes("Audited") && (
                                        <span className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-md font-medium border border-green-200 dark:border-green-800">
                                            <Shield className="w-3 h-3" /> Audited No-Logs
                                        </span>
                                    )}
                                    {p.raw_data?.ram_only_servers && (
                                        <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-md font-medium border border-blue-200 dark:border-blue-800">
                                            RAM-Only
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Price & Action */}
                        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-border/50 pt-4 md:pt-0">
                            <div className="text-right">
                                <div className="text-2xl font-bold">${p.pricing_monthly}</div>
                                <div className="text-xs text-muted-foreground space-y-0.5">
                                    <div>per month</div>
                                    {p.raw_data?.protocols && (
                                        <div className="text-[10px] text-primary/80 font-medium">Supports {p.raw_data.protocols[0].split(' ')[0]}</div>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <a
                                    href={`/vpn/${p.slug || p.provider_name.toLowerCase().replace(/\s+/g, '-')}`}
                                    className="h-10 px-6 font-semibold inline-flex items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                                >
                                    Analysis
                                </a>
                                <a
                                    href={affiliateUrls[p.provider_name] || p.website_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-full h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 inline-flex items-center justify-center font-medium transition-colors"
                                >
                                    Visit
                                </a>
                            </div>
                        </div>

                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                        No VPNs found matching "{search}"
                    </div>
                )}
            </div>
        </div>
    );
}
