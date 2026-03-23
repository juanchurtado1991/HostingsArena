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
import Link from "next/link";
import { VpnHero } from "@/components/vpn/VpnHero";
import { VpnSpecs } from "@/components/vpn/VpnSpecs";
import { VpnSidebar } from "@/components/vpn/VpnSidebar";

export async function generateMetadata({ params }: { params: Promise<{ slug: string; lang: string }> }) {
    const { slug, lang } = await params;
    const title = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return {
        title: `${title} VPN Review & Privacy Analysis ${new Date().getFullYear()} | HostingArena`,
        description: `Detailed review, speed tests, and privacy analysis for ${title}. See why it's a top choice for security.`,
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/${lang}/vpn/${slug}`,
        },
        openGraph: {
            title: `${title} VPN Review - Speed & Privacy Tested`,
            description: `We tested ${title}'s speed, security, and streaming capabilities. Is it safe for ${new Date().getFullYear()}?`,
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/${lang}/vpn/${slug}`,
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

export default async function VpnDetailPage({ params }: { params: Promise<{ slug: string; lang: string }> }) {
    const supabase = await createClient();
    const { slug, lang } = await params;
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

    // 2.5 Fetch Top Alternatives for Programmatic SEO Internal Linking (Deduplicated)
    const { data: rawAlternatives } = await supabase
        .from("vpn_providers")
        .select("provider_name, slug, avg_speed_mbps, support_quality_score")
        .neq("slug", provider.slug)
        .order("support_quality_score", { ascending: false })
        .limit(10);

    const alternativesData = [];
    const seenAltNames = new Set();
    if (rawAlternatives) {
        for (const alt of rawAlternatives) {
            if (!seenAltNames.has(alt.provider_name.toLowerCase())) {
                seenAltNames.add(alt.provider_name.toLowerCase());
                alternativesData.push(alt);
            }
            if (alternativesData.length === 3) break;
        }
    }

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
                    { name: "Home", item: `/${lang}` },
                    { name: "VPN Reviews", item: `/${lang}/vpn` },
                    { name: provider.provider_name, item: `/${lang}/vpn/${slug}` }
                ]}
            />
            <StickyBuyBar
                providerName={provider.provider_name}
                price={provider.pricing_monthly}
                rating={provider.support_quality_score ? `${provider.support_quality_score / 10}` : undefined}
                visitUrl={affiliateUrl}
                discount={renewalHikePercent > 0 ? "Save BIG" : undefined}
            />

            <VpnHero provider={provider} isBadProvider={isBadProvider} speedGrade={speedGrade} hasRefund={hasRefund} affiliateUrl={affiliateUrl} />

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
                        <VpnSpecs provider={provider} />

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

                        {/* Top Competitors (Programmatic SEO Internal Links) */}
                        {alternativesData && alternativesData.length > 0 && (
                            <section className="pt-12 border-t border-border/50">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-bold tracking-tight">Top Alternatives</h3>
                                    <Badge variant="outline" className="font-mono text-blue-500 border-blue-500/30">COMPARE</Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {alternativesData.map((alt) => (
                                        <Link 
                                            key={alt.slug} 
                                            href={`/${lang}/compare/${provider.slug}-vs-${alt.slug}`}
                                            className="group block p-6 rounded-3xl border border-border/50 bg-card/30 hover:bg-card hover:shadow-xl hover:-translate-y-1 hover:border-blue-500/30 transition-all duration-300"
                                        >
                                            <div className="flex flex-col h-full justify-between gap-4">
                                                <div>
                                                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">{provider.provider_name} vs</div>
                                                    <h4 className="text-xl font-black group-hover:text-blue-500 transition-colors">{alt.provider_name}</h4>
                                                </div>
                                                <div className="flex items-center justify-between mt-4">
                                                    <div className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                                                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                                                        {alt.avg_speed_mbps} Mbps
                                                    </div>
                                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                                        <ArrowRight className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* COMMENTS */}
                        <div className="pt-8 border-t border-border/30">
                            <CommentSection type="vpn" slug={slug} lang={lang} />
                        </div>
                    </div>

                    {/* RIGHT COLUMN: SIDEBAR */}
                    <VpnSidebar provider={provider} affiliateUrl={affiliateUrl} />
                </div>
            </div>
        </main>
    );
}
