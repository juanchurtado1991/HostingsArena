import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import CommentSection from "@/components/comments/CommentSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Check, X, Shield, Globe, Zap, Server, ChevronRight, AlertTriangle, Info, ArrowRight, CheckCircle2, HardDrive, Clock, ShieldCheck, Lock, Layout, RefreshCw, Cpu, Database } from "lucide-react";
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
import { HostingHero } from "@/components/hosting/HostingHero";
import { HostingSpecs } from "@/components/hosting/HostingSpecs";
import { HostingPlans } from "@/components/hosting/HostingPlans";
import { HostingSidebar } from "@/components/hosting/HostingSidebar";

export async function generateMetadata({ params }: { params: Promise<{ slug: string; lang: string }> }) {
    const { slug, lang } = await params;
    const title = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return {
        title: `${title} - In-Depth Review & Benchmarks ${new Date().getFullYear()} | HostingArena`,
        description: `Performance tests, uptime stats, and pricing analysis for ${title}. See why it scored 8+/10.`,
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/${lang}/hosting/${slug}`,
        },
        openGraph: {
            title: `${title} Review - Is it Worth It in ${new Date().getFullYear()}?`,
            description: `Real data: Performance, Pricing, and Hidden Fees analyzed for ${title}.`,
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/${lang}/hosting/${slug}`,
            siteName: 'HostingsArena',
            images: [
                {
                    url: `${process.env.NEXT_PUBLIC_SITE_URL}/og-hosting.png`,
                    width: 1200,
                    height: 630,
                    alt: `${title} Review`,
                }
            ],
            type: 'article',
        }
    };
}

export default async function HostingDetailPage({ params, searchParams }: { params: Promise<{ slug: string; lang: string }>, searchParams: Promise<{ plan?: string }> }) {
    const supabase = await createClient();
    const { slug, lang } = await params;
    const { plan: planId } = await searchParams;
    const nameQuery = slug.replace(/-/g, ' ');

    // 1. Get the primary provider entry to get the name
    const { data: initialProviders, error } = await supabase
        .from("hosting_providers")
        .select("*")
        .ilike("provider_name", nameQuery)
        .limit(1);

    if (error || !initialProviders || initialProviders.length === 0) {
        return notFound();
    }

    const baseProvider = initialProviders[0];

    // 2. Fetch ALL plans for this provider to allow switching
    const { data: allPlans } = await supabase
        .from("hosting_providers")
        .select("*")
        .eq("provider_name", baseProvider.provider_name)
        .order("pricing_monthly", { ascending: true });

    // 2.5 Fetch Top Alternatives for Programmatic SEO Internal Linking (Deduplicated)
    const { data: rawAlternatives } = await supabase
        .from("hosting_providers")
        .select("provider_name, slug, performance_grade, support_score")
        .neq("slug", baseProvider.slug)
        .order("support_score", { ascending: false })
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

    // 3. Determine the current active plan
    const provider = allPlans?.find(p => p.id === planId) || allPlans?.[0] || baseProvider;

    const features = provider.features || {};
    const raw = provider.raw_data || {};

    const renewalHikePercent = provider.renewal_price && provider.pricing_monthly
        ? Math.round(((provider.renewal_price - provider.pricing_monthly) / provider.pricing_monthly) * 100)
        : 0;

    const isBadProvider = (provider.performance_grade === 'C' || provider.performance_grade === 'D' || provider.performance_grade === 'F' || provider.support_score < 70);

    const affiliateUrl = await getAffiliateUrl(provider.provider_name, provider.website_url);

    // Mock Pros/Cons for now or extract from notes if structured
    const pros = raw.pros || [
        `Excellent ${provider.performance_grade} performance grade`,
        `${provider.storage_gb || 'Unlimited'} GB SSD Storage`,
        `${provider.money_back_days}-day money-back guarantee`
    ];
    const cons = raw.cons || (renewalHikePercent > 50 ? [`High renewal price increase (${renewalHikePercent}%)`] : []);

    return (
        <main className="min-h-screen bg-background pb-20">
            <PageTracker />
            <ReviewJsonLd
                providerName={provider.provider_name}
                description={`In-depth review of ${provider.provider_name} hosting services. Performance grade: ${provider.performance_grade || 'B'}. Plan: ${provider.plan_name}.`}
                rating={provider.support_score ? provider.support_score / 10 : 8.5}
                slug={slug}
                type="hosting"
                datePublished={provider.created_at || new Date().toISOString()}
                price={provider.pricing_monthly}
            />
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", item: `/${lang}` },
                    { name: "Hosting Reviews", item: `/${lang}/hosting` },
                    { name: provider.provider_name, item: `/${lang}/hosting/${slug}` }
                ]}
            />
            <StickyBuyBar
                providerName={provider.provider_name}
                price={provider.pricing_monthly}
                rating={provider.support_score ? `${provider.support_score / 10}` : undefined}
                visitUrl={affiliateUrl}
                discount={renewalHikePercent > 0 ? "Save BIG" : undefined}
                renewalText={renewalHikePercent > 0 ? `Renews at $${provider.renewal_price}` : undefined}
            />

            <HostingHero provider={provider} isBadProvider={isBadProvider} affiliateUrl={affiliateUrl} />

            {/* CONTENT GRID */}
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* LEFT COLUMN: PRIMARY ANALYSIS */}
                    <div className="lg:col-span-8 space-y-16">

                        {/* THE VERDICT (Apple Style Card) */}
                        <GlassCard className="border-primary/10 bg-primary/[0.02] overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <CheckCircle2 className="w-32 h-32 text-primary" />
                            </div>
                            <div className="relative z-10">
                                <h2 className="text-3xl font-black mb-6 tracking-tight">Executive Verdict</h2>
                                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                                    {provider.provider_name} is currently positioned as a <strong className="text-foreground">{provider.performance_grade} Tier</strong> hosting solution.
                                    Our monitoring shows consistent reliability for {provider.provider_type === 'Shared' ? 'small to medium businesses looking for value.' : 'performance-heavy applications.'}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20">Fast Setup</Badge>
                                    <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20">Free SSL</Badge>
                                    {provider.free_migration && <Badge className="bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-purple-500/20">Migration Ready</Badge>}
                                    {provider.wordpress_optimized && <Badge className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-orange-500/20">WordPress Pro</Badge>}
                                </div>
                            </div>
                        </GlassCard>

                        {/* PROS & CONS */}
                        <ProsConsSection pros={pros} cons={cons} title="Strengths & Weaknesses" />

                        {/* SPECIFICATIONS GRID */}
                        <HostingSpecs provider={provider} />

                        {/* PLAN COMPARISON */}
                        <HostingPlans allPlans={allPlans || []} provider={provider} />

                        {/* Top Competitors (Programmatic SEO Internal Links) */}
                        {alternativesData && alternativesData.length > 0 && (
                            <section className="pt-12 border-t border-border/50">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-bold tracking-tight">Top Alternatives</h3>
                                    <Badge variant="outline" className="font-mono">COMPARE</Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {alternativesData.map((alt) => (
                                        <Link 
                                            key={alt.slug} 
                                            href={`/${lang}/compare/${baseProvider.slug}-vs-${alt.slug}`}
                                            className="group block p-6 rounded-3xl border border-border/50 bg-card/30 hover:bg-card hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 transition-all duration-300"
                                        >
                                            <div className="flex flex-col h-full justify-between gap-4">
                                                <div>
                                                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">{baseProvider.provider_name} vs</div>
                                                    <h4 className="text-xl font-black group-hover:text-primary transition-colors">{alt.provider_name}</h4>
                                                </div>
                                                <div className="flex items-center justify-end mt-4">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                                        <ArrowRight className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* COMMENTS & COMMUNITY */}
                        <section className="pt-12 border-t border-border/50">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-bold tracking-tight">User Feedback</h3>
                                <Badge variant="outline" className="font-mono">{provider.provider_name.toUpperCase()} FEEDBACK LOOP</Badge>
                            </div>
                            <CommentSection type="hosting" slug={slug} lang={lang} />
                        </section>
                    </div>

                    {/* RIGHT COLUMN: SIDEBAR */}
                    <HostingSidebar provider={provider} renewalHikePercent={renewalHikePercent} affiliateUrl={affiliateUrl} />
                </div>
            </div>
        </main>
    );
}
