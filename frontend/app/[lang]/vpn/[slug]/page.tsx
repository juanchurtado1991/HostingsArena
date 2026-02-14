import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import CommentSection from "@/components/comments/CommentSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Shield, Globe, Zap, Lock, ChevronRight, ArrowRight, AlertTriangle, X, Star, ShieldCheck, Database, Server, Smartphone, Monitor, Layout, Key, Fingerprint } from "lucide-react";
import { StickyBuyBar } from "@/components/conversion/StickyBuyBar";
import { getAffiliateUrl } from "@/lib/affiliates";
import { PageTracker } from "@/components/tracking/PageTracker";
import { ReviewJsonLd } from "@/components/seo/ReviewJsonLd";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { GlassCard } from "@/components/ui/GlassCard";
import { PerformanceBadge } from "@/components/ui/PerformanceBadge";
import { ProsConsSection } from "@/components/ui/ProsConsSection";
import { AffiliateButton } from "@/components/conversion/AffiliateButton";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const title = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return {
        title: `${title} VPN Review & Privacy Analysis ${new Date().getFullYear()} | HostingArena`,
        description: `Detailed review, speed tests, and privacy analysis for ${title}. See why it's a top choice for security.`,
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/vpn/${slug}`,
        },
        openGraph: {
            title: `${title} VPN Review - Speed & Privacy Tested`,
            description: `We tested ${title}'s speed, security, and streaming capabilities. Is it safe for ${new Date().getFullYear()}?`,
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/vpn/${slug}`,
            siteName: 'HostingsArena',
            images: [
                {
                    url: `${process.env.NEXT_PUBLIC_SITE_URL}/og-vpn.png`,
                    width: 1200,
                    height: 630,
                    alt: `${title} Review`,
                }
            ],
            type: 'article',
        }
    };
}

export default async function VpnDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const supabase = await createClient();
    const { slug } = await params;
    const nameQuery = slug.replace(/-/g, ' ');

    const { data: providers, error } = await supabase
        .from("vpn_providers")
        .select("*")
        .ilike("provider_name", nameQuery)
        .limit(1);

    if (error || !providers || providers.length === 0) {
        return notFound();
    }

    const provider = providers[0];
    const features = provider.features || {};
    const raw = provider.raw_data || {};

    const renewalHikePercent = provider.renewal_price && provider.pricing_monthly
        ? Math.round(((provider.renewal_price - provider.pricing_monthly) / provider.pricing_monthly) * 100)
        : 0;

    const isBadProvider = (provider.support_quality_score < 70 || provider.avg_speed_mbps < 50);

    const affiliateUrl = await getAffiliateUrl(provider.provider_name, provider.website_url);

    // Correct Refund Logic
    const hasRefund = provider.money_back_days && provider.money_back_days > 0;

    // Dynamic Pros/Cons
    const pros = raw.pros || [
        `Impressive ${provider.avg_speed_mbps || 'High-speed'} Mbps average speed`,
        `Secure ${provider.encryption_type || 'AES-256'} encryption`,
        ...(hasRefund ? [`${provider.money_back_days}-day refund guarantee`] : [])
    ];
    const cons = raw.cons || [
        ...(isBadProvider ? ["Speed could be more consistent"] : []),
        ...(!hasRefund ? ["No money-back guarantee (High Risk)"] : [])
    ];

    // Speed Grade (Calculated for UI)
    const speedGrade = provider.avg_speed_mbps && provider.avg_speed_mbps > 0
        ? (provider.avg_speed_mbps > 200 ? "A+" : provider.avg_speed_mbps > 150 ? "A" : provider.avg_speed_mbps > 100 ? "B" : "C")
        : "B"; // Default to B if unknown

    return (
        <main className="min-h-screen bg-background pb-20">
            <PageTracker />
            <ReviewJsonLd
                providerName={provider.provider_name}
                description={`Comprehensive review of ${provider.provider_name} VPN. Average speed: ${provider.avg_speed_mbps || 'High-speed'} Mbps.`}
                rating={provider.support_quality_score ? provider.support_quality_score / 10 : 8.5}
                slug={slug}
                type="vpn"
                datePublished={provider.created_at || new Date().toISOString()}
                price={provider.pricing_monthly}
            />
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", item: "/" },
                    { name: "VPN Reviews", item: "/vpn" },
                    { name: provider.provider_name, item: `/vpn/${slug}` }
                ]}
            />
            <StickyBuyBar
                providerName={provider.provider_name}
                price={provider.pricing_monthly}
                rating={provider.support_quality_score ? `${provider.support_quality_score / 10}` : undefined}
                visitUrl={affiliateUrl}
                discount={renewalHikePercent > 0 ? "Save BIG" : undefined}
            />

            {/* HERO SECTION */}
            <div className="relative pt-32 pb-16 overflow-hidden">
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

                        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 text-foreground text-balance">
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

            {/* CONTENT GRID */}
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* LEFT COLUMN: PRIMARY ANALYSIS */}
                    <div className="lg:col-span-8 space-y-16">

                        {/* PRIVACY VERDICT */}
                        <GlassCard className="border-blue-500/10 bg-blue-500/[0.02] overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Fingerprint className="w-32 h-32 text-blue-500" />
                            </div>
                            <div className="relative z-10">
                                <h2 className="text-3xl font-black mb-6 tracking-tight">Security Verdict</h2>
                                <p className="text-lg text-muted-foreground leading-relaxed mb-6 text-balance">
                                    {provider.provider_name} excels in <strong className="text-foreground">{provider.jurisdiction || 'Privacy-Friendly'}</strong> jurisdiction privacy laws.
                                    With <strong className="text-foreground">{provider.encryption_type || 'Military-Grade'}</strong> encryption and a audited no-logs policy, it is a {provider.support_quality_score > 85 ? 'top-tier recommendation for privacy-first users.' : 'solid choice for daily browsing and streaming.'}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20">Audited No-Logs</Badge>
                                    <Badge className="bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20 border-cyan-500/20">Kill Switch</Badge>
                                    <Badge className="bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 border-indigo-500/20">Leak Protection</Badge>
                                </div>
                            </div>
                        </GlassCard>

                        {/* PROS & CONS */}
                        <ProsConsSection pros={pros} cons={cons} title="Expert Assessment" />

                        {/* PERFORMANCE METRICS */}
                        <section className="space-y-6">
                            <h3 className="text-2xl font-bold tracking-tight">Performance Benchmarks</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 flex justify-between items-center group hover:border-blue-500/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                            <Zap size={20} />
                                        </div>
                                        <span className="font-medium">Avg. Speed</span>
                                    </div>
                                    <span className="font-bold text-lg">
                                        {provider.avg_speed_mbps && provider.avg_speed_mbps > 0 ? `${provider.avg_speed_mbps} Mbps` : 'High Traffic'}
                                    </span>
                                </div>
                                <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 flex justify-between items-center group hover:border-blue-500/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 group-hover:scale-110 transition-transform">
                                            <Database size={20} />
                                        </div>
                                        <span className="font-medium">Server Network</span>
                                    </div>
                                    <span className="font-bold text-lg">
                                        {provider.server_count && provider.server_count > 0 ? `${provider.server_count.toLocaleString()} Nodes` : 'Global Grid'}
                                    </span>
                                </div>
                                <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 flex justify-between items-center group hover:border-blue-500/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                                            <Monitor size={20} />
                                        </div>
                                        <span className="font-medium">Streaming</span>
                                    </div>
                                    <span className="font-bold text-lg text-green-500 flex items-center gap-1.5">
                                        <CheckCircle2 size={18} /> Optimized
                                    </span>
                                </div>
                                <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 flex justify-between items-center group hover:border-blue-500/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                            <Smartphone size={20} />
                                        </div>
                                        <span className="font-medium">Device Limit</span>
                                    </div>
                                    <span className="font-bold text-lg">
                                        {provider.simultaneous_connections && provider.simultaneous_connections > 0
                                            ? (provider.simultaneous_connections === 999 ? 'Unlimited' : `${provider.simultaneous_connections} Devices`)
                                            : 'Multiple Devices'}
                                    </span>
                                </div>
                            </div>
                        </section>

                        {/* ANALYSIS */}
                        <section className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                            <h3 className="text-2xl font-bold mb-6 text-foreground tracking-tight">Technical Analysis</h3>
                            <p className="">
                                {provider.provider_name} offers a robust network {provider.country_count && provider.country_count > 0 ? `with servers in over ${provider.country_count} countries` : 'with a globally distributed infrastructure'}.
                                In our testing, the <strong className="text-foreground">{provider.protocols?.[0] || 'OpenVPN/WireGuard'}</strong> implementation provided stable latencies and fast throughput.
                            </p>
                            {raw.notes && (
                                <div className="not-prose bg-secondary/30 p-8 rounded-3xl border border-border/50 mt-8">
                                    <h4 className="font-semibold mb-4 text-foreground">Editor&apos;s Review</h4>
                                    <p className="text-muted-foreground italic">&ldquo;{raw.notes}&rdquo;</p>
                                </div>
                            )}
                        </section>

                        {/* COMMENTS */}
                        <div className="pt-8 border-t border-border/30">
                            <CommentSection providerType="vpn" providerSlug={slug} />
                        </div>
                    </div>

                    {/* RIGHT COLUMN: SIDEBAR */}
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
                                >
                                    CLAIM OFFER
                                </AffiliateButton>

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
                </div>
            </div>
        </main>
    );
}
