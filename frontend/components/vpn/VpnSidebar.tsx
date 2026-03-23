import { Badge } from "@/components/ui/badge";
import { Key, Shield, Lock, Globe } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { AffiliateButton } from "@/components/conversion/AffiliateButton";

interface VpnSidebarProps {
    provider: any;
    affiliateUrl: string;
}

export function VpnSidebar({ provider, affiliateUrl }: VpnSidebarProps) {
    return (
        <aside className="lg:col-span-4 space-y-8">
            <div className="sticky top-24 space-y-6">
                <GlassCard className="p-8 border-blue-500/20 shadow-2xl shadow-blue-500/10 relative overflow-hidden group">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl transition-all group-hover:scale-150" />

                    <h3 className="text-xl font-black mb-6 tracking-tight flex items-center justify-between">
                        Plans & Pricing
                        <Key className="w-5 h-5 text-blue-500" />
                    </h3>

                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-center p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-muted-foreground uppercase">Monthly</span>
                                <span className="text-2xl font-black text-foreground">
                                    {provider.pricing_monthly && provider.pricing_monthly > 0 ? `$${provider.pricing_monthly}` : "Special"}
                                </span>
                            </div>
                            <Badge variant="outline" className="text-[10px] font-bold">Base</Badge>
                        </div>

                        {provider.pricing_yearly && provider.pricing_yearly > 0 && (
                            <div className="flex justify-between items-center p-4 rounded-2xl bg-green-500/5 border border-green-500/20 ring-1 ring-green-500/30">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-green-600 uppercase">1-Year Savings</span>
                                    <span className="text-2xl font-black text-foreground">${(provider.pricing_yearly / 12).toFixed(2)}<span className="text-sm font-normal">/mo</span></span>
                                </div>
                                <Badge className="bg-green-500 text-white text-[10px] font-black">BEST VALUE</Badge>
                            </div>
                        )}

                        {provider.pricing_2year && provider.pricing_2year > 0 && (
                            <div className="flex justify-between items-center p-4 rounded-2xl bg-secondary/30 border border-border/50">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-muted-foreground uppercase">2-Year Term</span>
                                    <span className="text-xl font-black text-foreground">${(provider.pricing_2year / 24).toFixed(2)}<span className="text-sm font-normal">/mo</span></span>
                                </div>
                            </div>
                        )}
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

                {/* Privacy Features List (Short) */}
                <div className="px-4 space-y-4">
                    <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                        <Shield className="w-4 h-4 text-blue-500" /> AES-256 Bit Encryption
                    </div>
                    <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                        <Lock className="w-4 h-4 text-blue-500" /> Automatic Kill Switch
                    </div>
                    <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                        <Globe className="w-4 h-4 text-blue-500" /> RAM-Only Server Network
                    </div>
                </div>
            </div>
        </aside>
    );
}
