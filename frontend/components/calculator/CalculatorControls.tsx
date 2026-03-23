"use client";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProviderSelector } from "@/components/ProviderSelector";

export function CalculatorControls({
    dict,
    category,
    years,
    setYears,
    provider1,
    setProvider1,
    provider2,
    setProvider2
}: any) {
    return (
        <GlassCard className="lg:col-span-1 p-4 md:p-6 space-y-6 md:space-y-8 h-fit lg:sticky lg:top-24">
            <div className="space-y-6">
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
    );
}
