import { cn } from "@/lib/utils";
import { Zap, AlertTriangle, Check, Shield, Lock, ShieldCheck, CheckCircle2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { AffiliateButton } from "@/components/conversion/AffiliateButton";

interface HostingSidebarProps {
    provider: any;
    renewalHikePercent: number;
    affiliateUrl: string;
}

export function HostingSidebar({ provider, renewalHikePercent, affiliateUrl }: HostingSidebarProps) {
    return (
        <aside className="lg:col-span-4 space-y-8">
            {/* THE BARGAIN BOX */}
            <div className="sticky top-24 space-y-6">
                <GlassCard className="p-8 border-primary/20 shadow-2xl shadow-primary/10 relative overflow-hidden group">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl transition-all group-hover:scale-150" />

                    <h3 className="text-xl font-black mb-6 tracking-tight flex items-center justify-between">
                        Summary
                        <Zap className="w-5 h-5 text-primary animate-pulse" />
                    </h3>

                    <div className="space-y-6 mb-8">
                        <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Starting at</span>
                                <span className="text-4xl font-black text-foreground">${provider.pricing_monthly}</span>
                            </div>
                            <div className="text-right pb-1">
                                <span className="text-xs font-bold text-green-600 bg-green-500/10 px-2 py-1 rounded-md uppercase tracking-tighter">Billed 36mo</span>
                            </div>
                        </div>

                        {renewalHikePercent > 0 && (
                            <div className={cn(
                                "p-4 rounded-2xl border text-sm leading-snug",
                                renewalHikePercent > 50 ? "bg-red-500/5 border-red-500/20 text-red-600" : "bg-primary/5 border-primary/20 text-primary"
                            )}>
                                <div className="font-bold flex items-center gap-2 mb-1">
                                    <AlertTriangle className="w-4 h-4" /> Renewal Notice
                                </div>
                                Plan renews at <span className="font-black">${provider.renewal_price}</span>.
                                That&apos;s a {renewalHikePercent}% increase after your initial term.
                            </div>
                        )}

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                                <Check className="w-4 h-4 text-green-500" /> Free 1-Click Installs
                            </div>
                            <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                                <Check className="w-4 h-4 text-green-500" /> Professional 24/7 Support
                            </div>
                            <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                                <Check className="w-4 h-4 text-green-500" /> Global Data Centers
                            </div>
                            {provider.free_domain && (
                                <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                                    <Check className="w-4 h-4 text-green-500" /> Free Domain Included
                                </div>
                            )}
                        </div>
                    </div>

                    <AffiliateButton
                        size="lg"
                        className="w-full h-16 text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
                        providerName={provider.provider_name}
                        visitUrl={affiliateUrl}
                        position="sidebar_summary"
                    />

                    <p className="text-[10px] text-center text-muted-foreground mt-4 font-bold uppercase tracking-widest opacity-50">
                        Prices updated: {new Date().toLocaleDateString()}
                    </p>
                </GlassCard>

                {/* Trust Badge */}
                <div className="flex items-center justify-center gap-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700 h-10 overflow-hidden">
                    <Shield className="w-6 h-6" />
                    <Lock className="w-6 h-6" />
                    <ShieldCheck className="w-6 h-6" />
                    <CheckCircle2 className="w-6 h-6" />
                </div>
            </div>
        </aside>
    );
}
