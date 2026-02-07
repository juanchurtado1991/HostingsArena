"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency } from "@/lib/utils";
import { Check, X, AlertTriangle, ArrowRight, Shield, Database, Server, Zap, Globe, Coins, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ProviderSelector } from "@/components/ProviderSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ComparisonTable } from "@/components/comparisons/ComparisonTable";

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

                {/* Comparison Table (Money First) */}
                {p1 && p2 ? (
                    <div className="animate-in slide-in-from-bottom-4 duration-700 fade-in">
                        <ComparisonTable data={[p1, p2]} title="Direct Comparison" />
                    </div>
                ) : (
                    <div className="text-center py-20 text-muted-foreground bg-card/30 rounded-3xl border border-dashed border-border/50">
                        <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-medium mb-1">Select providers to compare</h3>
                        <p className="text-sm">Choose two providers above to see the breakdown.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
