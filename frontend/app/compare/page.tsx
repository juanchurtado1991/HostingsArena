"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency } from "@/lib/utils";
import { Check, X, AlertTriangle, ArrowRight, Shield, Database, Server, Zap, Globe, Coins, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ProviderSelector } from "@/components/ProviderSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export default function ComparePage() {
    const [category, setCategory] = useState<"hosting" | "vpn">("hosting");
    const [p1, setP1] = useState<any>(null);
    const [p2, setP2] = useState<any>(null);

    return (
        <div className="min-h-screen pt-24 pb-12 px-6">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold mb-4 tracking-wide uppercase">
                        Truth vs Truth
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                        Compare <span className="text-primary">Providers</span> Side-by-Side
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Select two providers to see their differences in renewal price, hidden limits, and performance benchmarks.
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
                                <TabsTrigger value="hosting" className="px-8">Hosting</TabsTrigger>
                                <TabsTrigger value="vpn" className="px-8">VPNs</TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
                            {/* Provider 1 */}
                            <div className="bg-card/50 p-6 rounded-2xl border border-border/50 text-center">
                                <div className="mb-4 text-sm font-medium text-muted-foreground">Provider A</div>
                                <ProviderSelector
                                    type={category}
                                    onSelect={setP1}
                                    selectedProviderName={p1?.provider_name}
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
                                <div className="mb-4 text-sm font-medium text-muted-foreground">Provider B</div>
                                <ProviderSelector
                                    type={category}
                                    onSelect={setP2}
                                    selectedProviderName={p2?.provider_name}
                                />
                            </div>
                        </div>
                    </Tabs>
                </div>

                {/* Comparison Table */}
                {p1 && p2 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-700 fade-in">

                        {/* Column 1: Provider A */}
                        <GlassCard className="p-8 border-t-4 border-t-primary/50 relative">
                            <h3 className="text-2xl font-bold text-center mb-2">{p1.provider_name}</h3>
                            <div className="text-center mb-8">
                                <div className="text-4xl font-bold text-primary">{formatCurrency(p1.pricing_monthly)}</div>
                                <div className="text-sm text-muted-foreground">Initial Price</div>
                            </div>

                            <div className="space-y-6">
                                <div className="py-2 border-b border-border/40">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">True Renewal</div>
                                    <div className="font-semibold text-lg flex items-center gap-2">
                                        {formatCurrency(category === 'hosting' ? p1.renewal_price : p1.pricing_monthly * 2)}
                                        {(p1.renewal_price > p1.pricing_monthly * 1.5) && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                                    </div>
                                </div>
                                <div className="py-2 border-b border-border/40">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                        {category === 'hosting' ? 'Storage' : 'Server Count'}
                                    </div>
                                    <div className="font-medium">
                                        {category === 'hosting'
                                            ? `${p1.storage_gb || "?"} GB ${p1.storage_type}`
                                            : p1.server_count?.toLocaleString()}
                                    </div>
                                </div>
                                <div className="py-2">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Score</div>
                                    <div className="font-bold text-xl">{category === 'hosting' ? (p1.performance_grade || "B") : "Verified"}</div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <Button className="w-full" asChild>
                                    <Link href={`/${category}/${p1.slug || p1.provider_name.toLowerCase().replace(/\s+/g, '-')}`}>Full Analysis</Link>
                                </Button>
                            </div>
                        </GlassCard>

                        {/* Column 2: Metrics */}
                        <div className="hidden md:flex flex-col justify-center space-y-6 text-center text-sm text-muted-foreground px-4">
                            <div className="h-32 flex items-center justify-center font-medium">Pricing & Renewal</div>
                            <div className="h-16 flex items-center justify-center border-b border-border/30">
                                <Coins className="w-4 h-4" />
                            </div>
                            <div className="h-16 flex items-center justify-center border-b border-border/30">
                                {category === 'hosting' ? <Server className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                            </div>
                            <div className="h-16 flex items-center justify-center">
                                <Zap className="w-4 h-4" />
                            </div>
                        </div>

                        {/* Column 3: Provider B */}
                        <GlassCard className="p-8 border-t-4 border-t-secondary/50 relative">
                            <h3 className="text-2xl font-bold text-center mb-2">{p2.provider_name}</h3>
                            <div className="text-center mb-8">
                                <div className="text-4xl font-bold text-secondary-foreground">{formatCurrency(p2.pricing_monthly)}</div>
                                <div className="text-sm text-muted-foreground">Initial Price</div>
                            </div>

                            <div className="space-y-6">
                                <div className="py-2 border-b border-border/40">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">True Renewal</div>
                                    <div className="font-semibold text-lg flex items-center gap-2">
                                        {formatCurrency(category === 'hosting' ? p2.renewal_price : p2.pricing_monthly * 2)}
                                        {(p2.renewal_price > p2.pricing_monthly * 1.5) && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                                    </div>
                                </div>
                                <div className="py-2 border-b border-border/40">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                        {category === 'hosting' ? 'Storage' : 'Server Count'}
                                    </div>
                                    <div className="font-medium">
                                        {category === 'hosting'
                                            ? `${p2.storage_gb || "?"} GB ${p2.storage_type}`
                                            : p2.server_count?.toLocaleString()}
                                    </div>
                                </div>
                                <div className="py-2">
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Score</div>
                                    <div className="font-bold text-xl">{category === 'hosting' ? (p2.performance_grade || "B") : "Verified"}</div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <Button className="w-full" variant="secondary" asChild>
                                    <Link href={`/${category}/${p2.slug || p2.provider_name.toLowerCase().replace(/\s+/g, '-')}`}>Full Analysis</Link>
                                </Button>
                            </div>
                        </GlassCard>

                    </div>
                ) : (
                    <div className="text-center py-20 bg-primary/5 rounded-3xl border border-primary/10">
                        <Search className="w-12 h-12 text-primary/30 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-primary/70 mb-2">Select Providers to Compare</h3>
                        <p className="text-muted-foreground">Choose two providers above to reveal the truth.</p>
                    </div>
                )}

            </div>
        </div>
    );
}
