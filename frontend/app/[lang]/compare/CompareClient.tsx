"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency } from "@/lib/utils";
import { Check, X, AlertTriangle, ArrowRight, Shield, Database, Server, Zap, Globe, Coins, Search } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useTrackPageView } from "@/hooks/useTrackPageView";
import { ProviderSelector } from "@/components/ProviderSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ComparisonTable } from "@/components/comparisons/ComparisonTable";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { getCalculatorAffiliateLinks, getDefaultCompareProviders } from "@/lib/actions/affiliates";

interface CompareClientProps {
    dict: any;
    lang: string;
    initialCategory?: "hosting" | "vpn";
    initialSlugA?: string;
    initialSlugB?: string;
    initialDataA?: any;
    initialDataB?: any;
}

function CompareContent({ dict, lang, initialCategory, initialSlugA, initialSlugB, initialDataA, initialDataB }: CompareClientProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [category, setCategory] = useState<"hosting" | "vpn">(initialCategory || "hosting");
    const [p1, setP1] = useState<any>(initialDataA || null);
    const [p2, setP2] = useState<any>(initialDataB || null);
    const [p1Link, setP1Link] = useState("#");
    const [p2Link, setP2Link] = useState("#");
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useTrackPageView();

    useEffect(() => {
        if (p1 && p2) {
            getCalculatorAffiliateLinks(
                p1.provider_name,
                p1.website_url || "#",
                p2.provider_name,
                p2.website_url || "#"
            ).then(({ p1Link, p2Link }) => {
                setP1Link(p1Link);
                setP2Link(p2Link);
            });

            // Update URL for Programmatic SEO seamlessly without triggering a full navigation
            if (p1.slug && p2.slug && !isInitialLoad) {
                const newPath = `/${lang}/compare/${p1.slug}-vs-${p2.slug}`;
                if (pathname !== newPath) {
                    window.history.replaceState(null, '', newPath);
                }
            }
        }
    }, [p1, p2, lang, pathname, isInitialLoad]);

    // Force sync state if initial props change (crucial for SPA navigation)
    useEffect(() => {
        if (initialDataA) setP1(initialDataA);
        if (initialDataB) setP2(initialDataB);
        if (initialCategory) setCategory(initialCategory);
        
        // If data was provided via props, we don't need the initial client-side fetch flow
        if (initialDataA && initialDataB) {
            setIsInitialLoad(false);
        }
    }, [initialDataA, initialDataB, initialCategory]);

    useEffect(() => {
        const controller = new AbortController();
        const preselectProviders = async () => {
            const providerA = searchParams.get('a');
            const providerB = searchParams.get('b');
            const cat = initialCategory || (searchParams.get('cat') as "hosting" | "vpn" || "hosting");

            if (cat !== category) {
                setCategory(cat);
            }

            // Priority: Dynamic Route Slug -> URL Params -> Default
            const fetchA = async () => {
                if (initialSlugA || providerA) {
                    try {
                        const identifier = initialSlugA || providerA;
                        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier!);
                        const queryParam = initialSlugA ? `&slug=${initialSlugA}` : (isUuid ? `&id=${identifier}` : `&search=${identifier}`);
                        const res = await fetch(`/api/providers?type=${cat}${queryParam}`, { signal: controller.signal });
                        if (res.ok) {
                            const data = await res.json();
                            const found = Array.isArray(data) ? data[0] : data;
                            if (found) setP1(found);
                        }
                    } catch (e: any) { 
                        if (controller.signal.aborted) return;
                        console.error("Error preselecting A:", e); 
                    }
                }
            };

            const fetchB = async () => {
                if (initialSlugB || providerB) {
                    try {
                        const identifier = initialSlugB || providerB;
                        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier!);
                        const queryParam = initialSlugB ? `&slug=${initialSlugB}` : (isUuid ? `&id=${identifier}` : `&search=${identifier}`);
                        const res = await fetch(`/api/providers?type=${cat}${queryParam}`, { signal: controller.signal });
                        if (res.ok) {
                            const data = await res.json();
                            const found = Array.isArray(data) ? data[0] : data;
                            if (found) setP2(found);
                        }
                    } catch (e: any) { 
                        if (controller.signal.aborted) return;
                        console.error("Error preselecting B:", e); 
                    }
                }
            };

            const fetchDefaults = async () => {
                if (!initialSlugA && !initialSlugB && !providerA && !providerB) {
                    try {
                        const defaults = await getDefaultCompareProviders(cat);
                        if (defaults.length > 0) setP1(defaults[0]);
                        if (defaults.length > 1) setP2(defaults[1]);
                    } catch (e) { console.error("Error setting defaults:", e); }
                }
            };

            // Run all pre-selections only if data wasn't provided server-side
            if (!initialDataA || !initialDataB) {
                await Promise.all([fetchA(), fetchB(), fetchDefaults()]);
            }
            setIsInitialLoad(false);
        };

        if (isInitialLoad) {
            preselectProviders();
        }

        return () => controller.abort();
    }, [searchParams, isInitialLoad, initialCategory, initialSlugA, initialSlugB]);

    return (
        <div className="min-h-screen pt-24 pb-12 px-6">
            <div className="max-w-7xl mx-auto">


                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest mb-4">
                        {dict.compare.badge}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                        {dict.compare.title}
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        {dict.compare.subtitle}
                    </p>
                </div>

                {/* Selection Area */}
                <div className="max-w-4xl mx-auto mb-16">
                    <Tabs value={category} className="w-full" onValueChange={(v) => {
                        setCategory(v as "hosting" | "vpn");
                        setP1(null);
                        setP2(null);
                    }}>
                        <div className="flex justify-center mb-10">
                            <TabsList className="bg-muted p-1 rounded-xl glass-morphism-header backdrop-blur-md">
                                <TabsTrigger value="hosting" className="px-8 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">{dict.compare.tab_hosting}</TabsTrigger>
                                <TabsTrigger value="vpn" className="px-8 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">{dict.compare.tab_vpn}</TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center relative">
                            {/* Provider 1 */}
                            <div className={`p-8 rounded-3xl border border-border/60 bg-card/30 text-center transition-all duration-300 ${p1 ? 'ring-1 ring-primary/30 bg-primary/[0.02]' : ''}`}>
                                <ProviderSelector
                                    type={category}
                                    onSelect={setP1}
                                    selectedProvider={p1}
                                />
                            </div>

                            {/* VS Badge */}
                            <div className="flex justify-center z-10 -my-2 md:my-0">
                                <div className="h-12 w-12 rounded-full bg-primary text-white font-black italic flex items-center justify-center border-4 border-background shadow-lg">
                                    VS
                                </div>
                            </div>

                            {/* Provider 2 */}
                            <div className={`p-8 rounded-3xl border border-border/60 bg-card/30 text-center transition-all duration-300 ${p2 ? 'ring-1 ring-primary/30 bg-primary/[0.02]' : ''}`}>
                                <ProviderSelector
                                    type={category}
                                    onSelect={setP2}
                                    selectedProvider={p2}
                                />
                            </div>
                        </div>
                    </Tabs>
                </div>

                {/* Comparison Table (Money First) */}
                {p1 && p2 ? (
                    <div className="animate-in slide-in-from-bottom-4 duration-700 fade-in">
                        <ComparisonTable data={[p1, p2]} title="Direct Comparison" type={category} affiliateUrls={[p1Link, p2Link]} />
                    </div>
                ) : (
                    <div className="text-center py-20 text-muted-foreground bg-card/30 rounded-3xl border border-dashed border-border/50">
                        <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-medium mb-1">{dict.compare.select_instruction_title}</h3>
                        <p className="text-sm">{dict.compare.select_instruction_desc}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function CompareClient({ dict, lang, initialCategory, initialSlugA, initialSlugB, initialDataA, initialDataB }: CompareClientProps) {
    return (
        <Suspense fallback={
            <div className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        }>
            <CompareContent 
                dict={dict} 
                lang={lang} 
                initialCategory={initialCategory} 
                initialSlugA={initialSlugA} 
                initialSlugB={initialSlugB} 
                initialDataA={initialDataA} 
                initialDataB={initialDataB} 
            />
        </Suspense>
    );
}
