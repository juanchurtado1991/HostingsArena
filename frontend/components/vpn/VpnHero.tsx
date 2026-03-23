import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { PerformanceBadge } from "@/components/ui/PerformanceBadge";
import { AffiliateButton } from "@/components/conversion/AffiliateButton";

interface VpnHeroProps {
    provider: any;
    isBadProvider: boolean;
    speedGrade: string;
    hasRefund: boolean;
    affiliateUrl: string;
}

export function VpnHero({ provider, isBadProvider, speedGrade, hasRefund, affiliateUrl }: VpnHeroProps) {
    return (
        <div className="relative pt-16 pb-16 overflow-hidden">
            {/* Immersive Background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-blue-500/5 via-transparent to-transparent -z-10" />
            <div className="absolute top-20 left-[10%] w-72 h-72 bg-blue-500/10 rounded-full blur-[120px] -z-10 animate-pulse" />
            <div className="absolute top-40 right-[15%] w-96 h-96 bg-cyan-500/10 rounded-full blur-[150px] -z-10" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                    {isBadProvider && (
                        <div className="w-full mb-8 bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-2xl flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="font-bold">Caution: We detected slower speeds during our recent testing.</span>
                        </div>
                    )}

                    <Badge variant="secondary" className="mb-6 bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20 transition-all rounded-full px-4 py-1.5 flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 fill-current" />
                        Privacy Verified Review
                    </Badge>

                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 text-foreground text-balance">
                        {provider.provider_name} <span className="text-muted-foreground font-light">VPN</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed mb-12 max-w-2xl text-balance">
                        In-depth privacy and speed audit based on real-world global server benchmarks.
                    </p>

                    {/* Feature Badges */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-12">
                        <GlassCard className="p-4 flex flex-col items-center justify-center gap-2" hoverEffect={false}>
                            <div className="text-3xl font-black text-blue-500">
                                {provider.pricing_monthly && provider.pricing_monthly > 0 ? `$${provider.pricing_monthly}` : "Deal"}
                            </div>
                            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Monthly</div>
                        </GlassCard>
                        <GlassCard className="p-4 flex flex-col items-center justify-center gap-2" hoverEffect={false}>
                            <PerformanceBadge grade={speedGrade} size="md" />
                            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Speed Index</div>
                        </GlassCard>
                        <GlassCard className="p-4 flex flex-col items-center justify-center gap-2" hoverEffect={false}>
                            <div className="text-3xl font-black text-foreground">
                                {provider.server_count && provider.server_count > 0 ? provider.server_count.toLocaleString() : 'Global'}
                            </div>
                            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{provider.server_count && provider.server_count > 0 ? 'Servers' : 'Network'}</div>
                        </GlassCard>
                        <GlassCard className="p-4 flex flex-col items-center justify-center gap-2" hoverEffect={false}>
                            <div className={cn("text-3xl font-black", hasRefund ? "text-green-500" : "text-destructive")}>
                                {hasRefund ? `${provider.money_back_days}d` : 'None'}
                            </div>
                            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Refund</div>
                        </GlassCard>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <AffiliateButton
                            size="lg"
                            className="h-16 px-12 text-xl shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                            providerName={provider.provider_name}
                            visitUrl={affiliateUrl}
                            position="hero_main"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
