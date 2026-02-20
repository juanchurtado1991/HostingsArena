"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Zap, Server, ExternalLink, Shield, HardDrive, Database } from "lucide-react";
import Link from "next/link";
import { AffiliateButton } from "@/components/conversion/AffiliateButton";

interface Provider {
    id: number;
    provider_name: string;
    slug: string;
    website_url: string;
    performance_grade: string;
    pricing_monthly: number;
    renewal_price: number;
    support_quality_score: number;
    raw_data: any;
}

export default function HostingList({ initialProviders, affiliateUrls = {}, lang = "en" }: { initialProviders: Provider[]; affiliateUrls?: Record<string, string>; lang?: string }) {
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
                    placeholder="Search Hosting Providers..."
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
                            <div className="flex-shrink-0 w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-600 font-bold text-xl">
                                {p.provider_name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-xl mb-1 flex items-center gap-2">
                                    {p.provider_name}
                                    {p.support_quality_score && p.support_quality_score >= 9 && (
                                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 border border-green-500/20">
                                            Top Choice
                                        </span>
                                    )}
                                </h3>
                                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded-md">
                                        <Zap className="w-3 h-3 text-orange-500" /> Grade: {p.performance_grade || 'B'}
                                    </span>

                                    {/* Advanced Badges */}
                                    {((p.raw_data?.disk_technology?.includes("NVMe")) || (p.raw_data?.features_storage?.includes("NVMe"))) && (
                                        <span className="flex items-center gap-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded-md font-medium border border-purple-200 dark:border-purple-800">
                                            <HardDrive className="w-3 h-3" /> NVMe
                                        </span>
                                    )}

                                    {p.raw_data?.inode_limit && !p.raw_data.inode_limit.includes("Unlimited") && (
                                        <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-md border border-border" title={`Inode Limit: ${p.raw_data.inode_limit}`}>
                                            <Database className="w-3 h-3" /> {(p.raw_data.inode_limit.toString().replace(/[^0-9]/g, '').slice(0, 3))}k Files
                                        </span>
                                    )}

                                    {p.raw_data?.ssl_type && p.raw_data.ssl_type.toLowerCase().includes("free") && (
                                        <span className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-md font-medium border border-green-200 dark:border-green-800">
                                            <Shield className="w-3 h-3" /> Free SSL
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
                                    {p.renewal_price && (
                                        <div className="text-[10px] text-muted-foreground/80">Renews at ${p.renewal_price}</div>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <a
                                    href={`/${lang}/hosting/${p.slug || p.provider_name.toLowerCase().replace(/\s+/g, '-')}`}
                                    className="h-10 px-6 font-semibold inline-flex items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                                >
                                    Analysis
                                </a>
                                <AffiliateButton
                                    providerName={p.provider_name}
                                    visitUrl={affiliateUrls[p.provider_name] || p.website_url}
                                    position="hosting_list_card"
                                    className="h-10 px-6 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20"
                                    showIcon={false}
                                >
                                    Visit
                                </AffiliateButton>
                            </div>
                        </div>

                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                        No hosting providers found matching "{search}"
                    </div>
                )}
            </div>
        </div>
    );
}
