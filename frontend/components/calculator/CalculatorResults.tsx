"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { TrendingUp, Zap } from "lucide-react";
import { AffiliateButton } from "@/components/conversion/AffiliateButton";
import { formatCurrency } from "@/lib/utils";

export function CalculatorResults({
    dict,
    loser,
    winner,
    p1Total,
    p2Total,
    diff,
    years,
    provider1Name,
    p1Link,
    p2Link
}: any) {
    return (
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
                        visitUrl={winner === provider1Name ? p1Link : p2Link}
                        position="calculator-winner"
                    >
                        {dict.calculator.switch_to.replace('{provider}', winner)}
                    </AffiliateButton>
                </div>
            </GlassCard>
        </div>
    );
}
