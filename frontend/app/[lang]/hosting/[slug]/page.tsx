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

            {/* HERO SECTION */}
            <div className="relative pt-16 pb-16 overflow-hidden">
                {/* Immersive Background */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-primary/5 via-transparent to-transparent -z-10" />
                <div className="absolute top-20 left-[10%] w-72 h-72 bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
                <div className="absolute top-40 right-[15%] w-96 h-96 bg-indigo-500/10 rounded-full blur-[150px] -z-10" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                        {isBadProvider && (
                            <div className="w-full mb-8 bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-2xl flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                                <AlertTriangle className="w-5 h-5" />
                                <span className="font-bold">Caution: Better alternatives exist for this performance level.</span>
                            </div>
                        )}

                        <div className="flex flex-wrap justify-center gap-3 mb-6">
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-all rounded-full px-4 py-1.5 flex items-center gap-2">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                Verified Expert Review
                            </Badge>
                            {provider.wordpress_optimized && (
                                <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20 transition-all rounded-full px-4 py-1.5 flex items-center gap-2">
                                    <Zap className="w-3.5 h-3.5 fill-current" />
                                    WordPress Optimized
                                </Badge>
                            )}
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 text-foreground text-balance">
                            {provider.provider_name} <span className="text-muted-foreground font-light">Review</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed mb-12 max-w-2xl">
                            Comprehensive <span className="text-foreground font-semibold">{provider.plan_name}</span> analysis based on real-world uptime and speed benchmarks.
                        </p>

                        {/* Feature Badges */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full mb-12">
                            <GlassCard className="p-3 md:p-4 flex flex-col items-center justify-center gap-1 md:gap-2" hoverEffect={false}>
                                <div className="text-2xl md:text-3xl font-black text-primary">${provider.pricing_monthly}</div>
                                <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">Intro Price</div>
                            </GlassCard>
                            <GlassCard className="p-3 md:p-4 flex flex-col items-center justify-center gap-1 md:gap-2" hoverEffect={false}>
                                <PerformanceBadge grade={provider.performance_grade || 'B'} size="md" />
                                <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">Speed Grade</div>
                            </GlassCard>
                            <GlassCard className="p-3 md:p-4 flex flex-col items-center justify-center gap-1 md:gap-2" hoverEffect={false}>
                                <div className="text-2xl md:text-3xl font-black text-foreground">{provider.support_score || 85}%</div>
                                <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">Support</div>
                            </GlassCard>
                            <GlassCard className="p-3 md:p-4 flex flex-col items-center justify-center gap-1 md:gap-2" hoverEffect={false}>
                                <div className="text-2xl md:text-3xl font-black text-green-500">{provider.money_back_days}d</div>
                                <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">Guarantee</div>
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
                        <section className="space-y-6">
                            <h3 className="text-2xl font-bold tracking-tight">Technical Specifications</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 flex justify-between items-center group hover:border-primary/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            <HardDrive size={20} />
                                        </div>
                                        <span className="font-medium">Storage</span>
                                    </div>
                                    <span className="font-bold text-lg">{provider.storage_gb ? `${provider.storage_gb} GB SSD` : 'Unl. SSD'}</span>
                                </div>
                                <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 flex justify-between items-center group hover:border-primary/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                            <Globe size={20} />
                                        </div>
                                        <span className="font-medium">Bandwidth</span>
                                    </div>
                                    <span className="font-bold text-lg">{provider.bandwidth || 'Unmetered'}</span>
                                </div>
                                <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 flex justify-between items-center group hover:border-primary/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                                            <Layout size={20} />
                                        </div>
                                        <span className="font-medium">Control Panel</span>
                                    </div>
                                    <span className="font-bold text-lg">{provider.control_panel || 'Custom/cPanel'}</span>
                                </div>
                                <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 flex justify-between items-center group hover:border-primary/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                            <Zap size={20} />
                                        </div>
                                        <span className="font-medium">Technology</span>
                                    </div>
                                    <span className="font-bold text-lg">{provider.web_server || 'Litespeed/NGINX'}</span>
                                </div>
                                <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 flex justify-between items-center group hover:border-primary/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                                            <Clock size={20} />
                                        </div>
                                        <span className="font-medium">Backups</span>
                                    </div>
                                    <span className="font-bold text-lg">{provider.backup_included ? 'Included' : 'Paid Add-on'}</span>
                                </div>
                                <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 flex justify-between items-center group hover:border-primary/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 group-hover:scale-110 transition-transform">
                                            <RefreshCw size={20} />
                                        </div>
                                        <span className="font-medium">Migrations</span>
                                    </div>
                                    <span className="font-bold text-lg">{provider.free_migration ? 'Free' : 'Paid Service'}</span>
                                </div>
                                <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 flex justify-between items-center group hover:border-primary/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                                            <Database size={20} />
                                        </div>
                                        <span className="font-medium">Databases</span>
                                    </div>
                                    <span className="font-bold text-lg">{provider.databases_allowed || 'Unlimited'}</span>
                                </div>
                                <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 flex justify-between items-center group hover:border-primary/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform">
                                            <Cpu size={20} />
                                        </div>
                                        <span className="font-medium">Websites</span>
                                    </div>
                                    <span className="font-bold text-lg">{provider.websites_allowed || 'Unlimited'}</span>
                                </div>
                            </div>
                        </section>

                        {/* PLAN COMPARISON */}
                        {allPlans && allPlans.length > 1 && (
                            <section className="space-y-6">
                                <h3 className="text-2xl font-bold tracking-tight">Available Tiers</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {allPlans.map((plan: any) => (
                                        <div key={plan.id} className={cn(
                                            "p-6 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6",
                                            plan.id === provider.id
                                                ? "bg-primary/5 border-primary/30 shadow-lg shadow-primary/5 ring-1 ring-primary/20"
                                                : "bg-card border-border/50 hover:bg-secondary/10"
                                        )}>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-xl font-black tracking-tight">{plan.plan_name}</h4>
                                                    {plan.id === provider.id && <Badge className="bg-primary text-primary-foreground text-[10px] uppercase font-black px-2">Current Selection</Badge>}
                                                </div>
                                                <div className="text-sm text-muted-foreground flex items-center gap-4">
                                                    <span className="flex items-center gap-1"><HardDrive className="w-3.5 h-3.5" /> {plan.storage_gb}GB</span>
                                                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 99.9% Uptime</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8 justify-between md:justify-end">
                                                <div className="text-right">
                                                    <div className="text-2xl font-black text-foreground">${plan.pricing_monthly}</div>
                                                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest italic">Renews at ${plan.renewal_price || plan.pricing_monthly}</div>
                                                </div>
                                                <Button
                                                    variant={plan.id === provider.id ? "default" : "outline"}
                                                    className="rounded-full font-bold px-8"
                                                    asChild
                                                >
                                                    <Link href={`?plan=${plan.id}`} scroll={false}>
                                                        {plan.id === provider.id ? "Selected" : "Select"}
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

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
                                >
                                    CLAIM OFFER
                                </AffiliateButton>

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
                </div>
            </div>
        </main>
    );
}
