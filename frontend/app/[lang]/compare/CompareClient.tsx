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
import { useSearchParams } from "next/navigation";

interface CompareClientProps {
    dict: any;
    lang: string;
}

function CompareContent({ dict, lang }: CompareClientProps) {
    const searchParams = useSearchParams();
    const [category, setCategory] = useState<"hosting" | "vpn">("hosting");
    const [p1, setP1] = useState<any>(null);
    const [p2, setP2] = useState<any>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useTrackPageView();

    useEffect(() => {
        const preselectProviders = async () => {
            const providerA = searchParams.get('a');
            const providerB = searchParams.get('b');
            const cat = searchParams.get('cat') as "hosting" | "vpn" || "hosting";

            if (cat !== category) {
                setCategory(cat);
            }

            if (providerA) {
                try {
                    // Try by ID first if it looks like a uuid, otherwise search by name
                    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(providerA);
                    const res = await fetch(`/api/providers?type=${cat}${isUuid ? '' : `&search=${providerA}`}`);
                    if (res.ok) {
                        const data = await res.json();
                        const found = isUuid
                            ? data.find((p: any) => p.id === providerA)
                            : data.find((p: any) => p.provider_name.toLowerCase() === providerA.toLowerCase());
                        if (found) setP1(found);
                    }
                } catch (e) { console.error("Error preselecting A:", e); }
            }

            if (providerB) {
                try {
                    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(providerB);
                    const res = await fetch(`/api/providers?type=${cat}${isUuid ? '' : `&search=${providerB}`}`);
                    if (res.ok) {
                        const data = await res.json();
                        const found = isUuid
                            ? data.find((p: any) => p.id === providerB)
                            : data.find((p: any) => p.provider_name.toLowerCase() === providerB.toLowerCase());
                        if (found) setP2(found);
                    }
                } catch (e) { console.error("Error preselecting B:", e); }
            }
            setIsInitialLoad(false);
        };

        if (isInitialLoad) {
            preselectProviders();
        }
    }, [searchParams, category, isInitialLoad]);

    return (
        <div className="min-h-screen pt-24 pb-12 px-6">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold mb-4 tracking-wide uppercase">
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
                    <Tabs defaultValue="hosting" className="w-full" onValueChange={(v) => {
                        setCategory(v as "hosting" | "vpn");
                        setP1(null);
                        setP2(null);
                    }}>
                        <div className="flex justify-center mb-8">
                            <TabsList className="bg-muted/50 border border-border backdrop-blur-md">
                                <TabsTrigger value="hosting" className="px-8">{dict.compare.tab_hosting}</TabsTrigger>
                                <TabsTrigger value="vpn" className="px-8">{dict.compare.tab_vpn}</TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
                            {/* Provider 1 */}
                            <div className="bg-card/50 p-6 rounded-2xl border border-border/50 text-center">
                                <div className="mb-4 text-sm font-medium text-muted-foreground">{dict.compare.provider_a}</div>
                                <ProviderSelector
                                    type={category}
                                    onSelect={setP1}
                                    selectedProvider={p1}
                                />
                            </div>

                            {/* VS Badge */}
                            <div className="hidden md:flex justify-center z-10 px-2">
                                <div className="bg-primary text-primary-foreground font-black italic rounded-full h-12 w-12 flex items-center justify-center shadow-xl border-4 border-background">
                                    VS
                                </div>
                            </div>

                            {/* Provider 2 */}
                            <div className="bg-card/50 p-6 rounded-2xl border border-border/50 text-center">
                                <div className="mb-4 text-sm font-medium text-muted-foreground">{dict.compare.provider_b}</div>
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
                        <ComparisonTable data={[p1, p2]} title="Direct Comparison" type={category} />
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

export default function CompareClient({ dict, lang }: CompareClientProps) {
    return (
        <Suspense fallback={
            <div className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        }>
            <CompareContent dict={dict} lang={lang} />
        </Suspense>
    );
}
