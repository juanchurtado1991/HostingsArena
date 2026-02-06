"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ProviderSelector } from "@/components/ProviderSelector";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CalculatorPage() {
    const [category, setCategory] = useState<"hosting" | "vpn">("hosting");
    const [years, setYears] = useState(5);
    const [provider1, setProvider1] = useState({ name: "Bluehost", initial: 2.95, renewal: 10.99, promo: 12 });
    const [provider2, setProvider2] = useState({ name: "FastComet", initial: 2.95, renewal: 2.95, promo: 12 });

    // Generate projection data based on selected years
    const data = [];
    let p1Total = 0;
    let p2Total = 0;
    const totalMonths = years * 12;

    for (let i = 1; i <= totalMonths; i++) {
        // Provider 1 Cost
        const p1Monthly = i <= provider1.promo ? provider1.initial : provider1.renewal;
        p1Total += p1Monthly;

        // Provider 2 Cost
        const p2Monthly = i <= provider2.promo ? provider2.initial : provider2.renewal;
        p2Total += p2Monthly;

        // Add data point every (totalMonths / 10) or at least every month for short periods
        const step = Math.max(1, Math.floor(totalMonths / 10));

        if (i % step === 0 || i === totalMonths) {
            data.push({
                month: i,
                [provider1.name]: parseFloat(p1Total.toFixed(2)),
                [provider2.name]: parseFloat(p2Total.toFixed(2)),
            });
        }
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold mb-4">
                        True Cost <span className="text-primary">Calculator</span>
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        See how "cheap" hosting really costs after the promo ends.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Controls */}
                    <GlassCard className="lg:col-span-1 p-6 space-y-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4 text-primary">Provider A (High Renewal)</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-muted-foreground mb-1 block">Select Provider</label>
                                    <div className="relative z-20">
                                        <ProviderSelector
                                            type="hosting"
                                            selectedProviderName={provider1.name}
                                            onSelect={(p) => {
                                                console.log("Selected Provider Data:", p);
                                                if (p) {
                                                    // Handle different naming conventions between Hosting (renewal_price) and VPNs (renewal_price_monthly)
                                                    // and fallback to standard pricing if renewal data is missing.
                                                    const renewalPrice = p.renewal_price || p.renewal_price_monthly || p.price_renewal || p.raw_data?.renewal_price_monthly || (p.pricing_monthly * 2) || 0;

                                                    setProvider1({
                                                        ...provider1,
                                                        name: p.provider_name,
                                                        initial: Number(p.pricing_monthly) || 0,
                                                        renewal: Number(renewalPrice)
                                                    });
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-muted-foreground">Intro Price</label>
                                        <input type="number" value={provider1.initial} onChange={e => setProvider1({ ...provider1, initial: Number(e.target.value) })} className="w-full bg-background border border-input rounded-md px-3 py-2 mt-1" />
                                    </div>
                                    <div>
                                        <label className="text-sm text-muted-foreground">Renewal</label>
                                        <input type="number" value={provider1.renewal} onChange={e => setProvider1({ ...provider1, renewal: Number(e.target.value) })} className="w-full bg-background border border-input rounded-md px-3 py-2 mt-1 text-destructive font-bold" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-border pt-8">
                            <h3 className="text-xl font-bold mb-4 text-green-500">Provider B (Fair Renewal)</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-muted-foreground mb-1 block">Select {category === 'hosting' ? 'Host' : 'VPN'}</label>
                                    <div className="relative z-10">
                                        <ProviderSelector
                                            type={category}
                                            selectedProviderName={provider2.name}
                                            onSelect={(p) => {
                                                console.log("Selected Provider 2 Data:", p);
                                                if (p) {
                                                    const renewalPrice = p.renewal_price || p.renewal_price_monthly || p.price_renewal || p.raw_data?.renewal_price_monthly || (p.pricing_monthly * 2) || 0;

                                                    setProvider2({
                                                        ...provider2,
                                                        name: p.provider_name,
                                                        initial: Number(p.pricing_monthly) || 0,
                                                        renewal: Number(renewalPrice)
                                                    });
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-muted-foreground">Intro Price</label>
                                        <input type="number" value={provider2.initial} onChange={e => setProvider2({ ...provider2, initial: Number(e.target.value) })} className="w-full bg-background border border-input rounded-md px-3 py-2 mt-1" />
                                    </div>
                                    <div>
                                        <label className="text-sm text-muted-foreground">Renewal</label>
                                        <input type="number" value={provider2.renewal} onChange={e => setProvider2({ ...provider2, renewal: Number(e.target.value) })} className="w-full bg-background border border-input rounded-md px-3 py-2 mt-1 text-green-500 font-bold" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Chart */}
                    <GlassCard className="lg:col-span-2 p-8 min-h-[500px] flex flex-col justify-center">
                        <h3 className="text-2xl font-bold mb-6 text-center">{years < 1 ? '6-Month' : `${years}-Year`} Cumulative Cost</h3>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottomRight', offset: -5 }} stroke="#888" />
                                    <YAxis label={{ value: 'Total Cost ($)', angle: -90, position: 'insideLeft' }} stroke="#888" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey={provider1.name} stroke="#FF4D4D" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
                                    <Line type="monotone" dataKey={provider2.name} stroke="#00C853" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-around mt-8 text-center bg-muted/50 p-4 rounded-xl">
                            <div>
                                <div className="text-muted-foreground text-sm">{years < 1 ? '6-Month' : `${years}-Year`} Cost ({provider1.name})</div>
                                <div className="text-3xl font-bold text-destructive">{formatCurrency(p1Total)}</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground text-sm">{years < 1 ? '6-Month' : `${years}-Year`} Cost ({provider2.name})</div>
                                <div className="text-3xl font-bold text-green-500">{formatCurrency(p2Total)}</div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
