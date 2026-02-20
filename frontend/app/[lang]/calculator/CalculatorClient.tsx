"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useTrackPageView } from "@/hooks/useTrackPageView";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ProviderSelector } from "@/components/ProviderSelector";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertCircle, TrendingUp, Zap } from "lucide-react";
import { getCalculatorAffiliateLinks, getDefaultCompareProviders } from "@/lib/actions/affiliates";
import { AffiliateButton } from "@/components/conversion/AffiliateButton";

interface CalculatorClientProps {
    dict: any;
    lang: string;
}

export default function CalculatorClient({ dict, lang }: CalculatorClientProps) {
    const [category, setCategory] = useState<"hosting" | "vpn">("hosting");
    const [years, setYears] = useState(3);
    const [provider1, setProvider1] = useState({ id: "", provider_name: "Loading...", initial: 0, renewal: 0, promo: 12, website_url: "" });
    const [provider2, setProvider2] = useState({ id: "", provider_name: "Loading...", initial: 0, renewal: 0, promo: 12, website_url: "" });
    const [p1Link, setP1Link] = useState("#");
    const [p2Link, setP2Link] = useState("#");
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    
    useTrackPageView();

    useEffect(() => {
        const fetchDefaults = async () => {
            try {
                const defaults = await getDefaultCompareProviders(category);
                if (defaults.length > 0) {
                    const p1 = defaults[0];
                    const p1Renewal = p1.renewal_price || p1.renewal_price_monthly || (p1.pricing_monthly * 2) || 0;
                    setProvider1({
                        id: p1.id,
                        provider_name: p1.provider_name,
                        initial: Number(p1.pricing_monthly) || 0,
                        renewal: Number(p1Renewal),
                        promo: 12,
                        website_url: p1.website_url || ""
                    });
                }
                if (defaults.length > 1) {
                    const p2 = defaults[1];
                    const p2Renewal = p2.renewal_price || p2.renewal_price_monthly || (p2.pricing_monthly * 2) || 0;
                    setProvider2({
                        id: p2.id,
                        provider_name: p2.provider_name,
                        initial: Number(p2.pricing_monthly) || 0,
                        renewal: Number(p2Renewal),
                        promo: 12,
                        website_url: p2.website_url || ""
                    });
                }
            } catch (e) {
                console.error("Error fetching defaults", e);
            }
            setIsInitialLoad(false);
        };
        fetchDefaults();
    }, [category]);

    useEffect(() => {
        if (!isInitialLoad && provider1.provider_name !== "Loading..." && provider2.provider_name !== "Loading...") {
        getCalculatorAffiliateLinks(
            provider1.provider_name,
            provider1.website_url || "#",
            provider2.provider_name,
            provider2.website_url || "#"
        ).then(({ p1Link, p2Link }) => {
            setP1Link(p1Link);
            setP2Link(p2Link);
        });
        }
    }, [provider1.provider_name, provider1.website_url, provider2.provider_name, provider2.website_url, isInitialLoad]);

    const data = [];
    let p1Total = 0;
    let p2Total = 0;
    const totalMonths = years * 12;

    for (let i = 1; i <= totalMonths; i++) {
        const p1Monthly = i <= provider1.promo ? provider1.initial : provider1.renewal;
        p1Total += p1Monthly;

        const p2Monthly = i <= provider2.promo ? provider2.initial : provider2.renewal;
        p2Total += p2Monthly;

        const step = Math.max(1, Math.floor(totalMonths / 10));

        if (i % step === 0 || i === totalMonths) {
            data.push({
                month: i,
                [provider1.provider_name]: parseFloat(p1Total.toFixed(2)),
                [provider2.provider_name]: parseFloat(p2Total.toFixed(2)),
            });
        }
    }

    const diff = Math.abs(p1Total - p2Total);
    const winner = p1Total < p2Total ? provider1.provider_name : provider2.provider_name;
    const loser = p1Total < p2Total ? provider2.provider_name : provider1.provider_name;

    return (
        <div className="min-h-screen pt-24 pb-12 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">
                        {dict.calculator.title}
                    </h1>
                    <p className="text-muted-foreground text-lg mb-8">
                        {dict.calculator.subtitle}
                    </p>

                    {/* Money First: STOP THE BLEEDING Banner */}
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 max-w-2xl mx-auto flex items-center justify-center gap-3 animate-pulse">
                        <AlertCircle className="w-6 h-6" />
                        <span className="font-bold text-lg">
                            {dict.calculator.stop_bleeding.replace('{amount}', formatCurrency(diff)).replace('{years}', years.toString())}
                        </span>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex justify-center mt-10">
                        <Tabs value={category} onValueChange={(v) => {
                            setCategory(v as "hosting" | "vpn");
                            setIsInitialLoad(true);
                            setProvider1({ id: "", provider_name: "Loading...", initial: 0, renewal: 0, promo: 12, website_url: "" });
                            setProvider2({ id: "", provider_name: "Loading...", initial: 0, renewal: 0, promo: 12, website_url: "" });
                        }}>
                            <TabsList className="bg-muted p-1 rounded-xl glass-morphism-header backdrop-blur-md">
                                <TabsTrigger value="hosting" className="px-8 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">{dict.compare.tab_hosting}</TabsTrigger>
                                <TabsTrigger value="vpn" className="px-8 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">{dict.compare.tab_vpn}</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Controls */}
                    <GlassCard className="lg:col-span-1 p-6 space-y-8 h-fit sticky top-24">
                        <div className="space-y-6">
                            {/* Year Selector */}
                            <div>
                                <label className="text-sm font-medium text-muted-foreground mb-2 block">{dict.calculator.projection_period}</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[1, 3, 5, 10].map((y) => (
                                        <Button
                                            key={y}
                                            variant={years === y ? "default" : "outline"}
                                            onClick={() => setYears(y)}
                                            size="sm"
                                            className={years === y ? "bg-primary text-primary-foreground font-bold" : ""}
                                        >
                                            {y}Y
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-border pt-6">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                    {dict.calculator.provider_a_trap}
                                </h3>
                                <div className="space-y-4">
                                    <ProviderSelector
                                        type={category}
                                        selectedProvider={provider1.provider_name !== "Loading..." ? provider1 : null}
                                        onSelect={(p) => {
                                            if (p) {
                                                const renewalPrice = p.renewal_price || p.renewal_price_monthly || (p.pricing_monthly * 2) || 0;
                                                setProvider1({
                                                    ...provider1,
                                                    id: p.id,
                                                    provider_name: p.provider_name,
                                                    initial: Number(p.pricing_monthly) || 0,
                                                    renewal: Number(renewalPrice),
                                                    website_url: p.website_url || ""
                                                });
                                            }
                                        }}
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-muted-foreground">{dict.calculator.intro}</label>
                                            <input type="number" value={provider1.initial} onChange={e => setProvider1({ ...provider1, initial: Number(e.target.value) })} className="w-full bg-background border rounded px-2 py-1 text-sm" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-muted-foreground">{dict.calculator.renewal}</label>
                                            <input type="number" value={provider1.renewal} onChange={e => setProvider1({ ...provider1, renewal: Number(e.target.value) })} className="w-full bg-background border border-destructive/50 text-destructive font-bold rounded px-2 py-1 text-sm" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-border pt-6">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    {dict.calculator.provider_b_savior}
                                </h3>
                                <div className="space-y-4">
                                    <ProviderSelector
                                        type={category}
                                        selectedProvider={provider2.provider_name !== "Loading..." ? provider2 : null}
                                        onSelect={(p) => {
                                            if (p) {
                                                const renewalPrice = p.renewal_price || p.renewal_price_monthly || (p.pricing_monthly * 2) || 0;
                                                setProvider2({
                                                    ...provider2,
                                                    id: p.id,
                                                    provider_name: p.provider_name,
                                                    initial: Number(p.pricing_monthly) || 0,
                                                    renewal: Number(renewalPrice),
                                                    website_url: p.website_url || ""
                                                });
                                            }
                                        }}
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-muted-foreground">{dict.calculator.intro}</label>
                                            <input type="number" value={provider2.initial} onChange={e => setProvider2({ ...provider2, initial: Number(e.target.value) })} className="w-full bg-background border rounded px-2 py-1 text-sm" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-muted-foreground">{dict.calculator.renewal}</label>
                                            <input type="number" value={provider2.renewal} onChange={e => setProvider2({ ...provider2, renewal: Number(e.target.value) })} className="w-full bg-background border border-green-500/50 text-green-600 font-bold rounded px-2 py-1 text-sm" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Chart & Results */}
                    <div className="lg:col-span-2 space-y-6">
                        <GlassCard className="p-6 md:p-8 min-h-[400px] flex flex-col justify-center relative overflow-hidden">
                            {/* Money First: Watermark */}
                            <div className="absolute top-4 right-4 text-xs font-mono text-muted-foreground/20 pointer-events-none">
                                PREDICTIVE MODEL v2.1
                            </div>

                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                        <XAxis dataKey="month" tickFormatter={(val) => `${Math.floor(val / 12)}Y`} stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis tickFormatter={(val) => `$${val}`} stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                            formatter={(value: any) => [`$${value}`, '']}
                                            labelFormatter={(label) => `Month ${label}`}
                                        />
                                        <Legend verticalAlign="top" height={36} />
                                        <Line name={provider1.provider_name} type="monotone" dataKey={provider1.provider_name} stroke="#ef4444" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                                        <Line name={provider2.provider_name} type="monotone" dataKey={provider2.provider_name} stroke="#22c55e" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </GlassCard>

                        {/* Money First: The Verdict */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <GlassCard className="p-6 border-l-4 border-l-destructive bg-destructive/5 flex flex-col justify-between">
                                <div>
                                    <div className="text-sm font-medium text-destructive mb-1 uppercase tracking-wider">{dict.calculator.loser}</div>
                                    <h3 className="text-2xl font-bold text-foreground mb-4">{loser}</h3>
                                    <div className="text-4xl font-black text-destructive/80 mb-2">
                                        {formatCurrency(Math.max(p1Total, p2Total))}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{dict.calculator.total_cost.replace('{years}', years.toString())}</p>
                                </div>
                            </GlassCard>

                            <GlassCard className="p-6 border-l-4 border-l-green-500 bg-green-500/5 relative overflow-hidden flex flex-col justify-between">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <TrendingUp className="w-24 h-24" />
                                </div>

                                <div>
                                    <div className="text-sm font-medium text-green-600 mb-1 uppercase tracking-wider flex items-center gap-2">
                                        <Zap className="w-4 h-4 fill-current" /> {dict.calculator.winner}
                                    </div>
                                    <h3 className="text-2xl font-bold text-foreground mb-4">{winner}</h3>
                                    <div className="text-4xl font-black text-green-600 mb-2">
                                        {formatCurrency(Math.min(p1Total, p2Total))}
                                    </div>
                                    <p className="text-sm text-green-700/80 font-medium">
                                        {dict.calculator.you_save.replace('{amount}', formatCurrency(diff))}
                                    </p>
                                </div>

                                <div className="mt-6">
                                    <AffiliateButton 
                                        size="lg" 
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg shadow-lg shadow-green-500/20" 
                                        providerName={winner}
                                        visitUrl={winner === provider1.provider_name ? p1Link : p2Link}
                                        position="calculator-winner"
                                    >
                                        {dict.calculator.switch_to.replace('{provider}', winner)}
                                    </AffiliateButton>
                                </div>
                            </GlassCard>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
