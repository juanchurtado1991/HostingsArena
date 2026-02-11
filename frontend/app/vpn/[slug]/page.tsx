import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import CommentSection from "@/components/comments/CommentSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Shield, Globe, Zap, Lock, ChevronRight, ArrowRight, AlertTriangle } from "lucide-react";
import { StickyBuyBar } from "@/components/conversion/StickyBuyBar";
import { getAffiliateUrl } from "@/lib/affiliates";
import { PageTracker } from "@/components/tracking/PageTracker";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const title = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return {
        title: `${title} Review & Specs ${new Date().getFullYear()} | HostingArena`,
        description: `Detailed review, speed tests, and pricing for ${title}. See what users are saying.`,
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

    return (
        <main className="min-h-screen bg-background pb-20">
            <PageTracker />
            <StickyBuyBar
                providerName={provider.provider_name}
                price={provider.pricing_monthly}
                rating={provider.support_quality_score ? `${provider.support_quality_score / 10}` : undefined}
                visitUrl={affiliateUrl}
                discount={renewalHikePercent > 0 ? "Save BIG" : undefined}
            />

            {/* HERO SECTION */}
            <div className="relative pt-32 pb-10 overflow-hidden">
                {/* Blur Backdrop */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/10 rounded-full blur-3xl opacity-50 -z-10" />

                <div className="container mx-auto px-4 text-center relative z-10">
                    {isBadProvider && (
                        <div className="max-w-2xl mx-auto mb-8 bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl flex items-center justify-center gap-3 animate-bounce">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="font-bold">Warning: Slow speeds detected. Consider a faster alternative.</span>
                        </div>
                    )}

                    <Badge variant="outline" className="mb-6 border-primary/20 text-primary px-3 py-1 text-sm font-medium tracking-wide cursor-pointer hover:bg-primary/5 transition-colors">
                        <Shield className="w-3 h-3 mr-1 fill-primary" /> Verified Privacy Policy
                    </Badge>

                    <h1 className="text-6xl md:text-7xl font-semibold tracking-tight mb-6 text-foreground">
                        {provider.provider_name}
                    </h1>
                    <p className="text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 font-light leading-relaxed">
                        Privacy, Speed, and Security Analysis
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <div className="flex flex-col items-center">
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-bold tracking-tight text-foreground">${provider.pricing_monthly}</span>
                                <span className="text-xl text-muted-foreground font-medium">/mo</span>
                            </div>
                            {renewalHikePercent > 50 && (
                                <div className="text-xs font-bold text-destructive mt-1 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    Renews at ${provider.renewal_price} (+{renewalHikePercent}%)
                                </div>
                            )}
                        </div>
                        <div className="h-12 w-px bg-border/50 hidden sm:block"></div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-medium text-foreground">Support Score:</span>
                            <span className="text-3xl font-bold text-blue-500">{provider.support_quality_score}/100</span>
                        </div>
                    </div>

                    <div className="mt-12 flex justify-center">
                        <Button size="lg" className="rounded-full h-16 px-12 text-xl font-bold shadow-2xl hover:scale-105 transition-transform" asChild>
                            <a
                                href={affiliateUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Visit {provider.provider_name} <ChevronRight className="ml-2 w-5 h-5" />
                            </a>
                        </Button>
                    </div>
                </div>
            </div>

            {/* TECH SPECS BENTO GRID */}
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <h2 className="text-3xl font-semibold mb-10 tracking-tight text-center">Performance & Specs</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-card p-8 rounded-[2rem] shadow-sm border border-border/50 flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 text-blue-500">
                            <Globe size={24} />
                        </div>
                        <div>
                            <div className="text-3xl font-bold mb-1">{provider.server_count.toLocaleString()}</div>
                            <div className="text-muted-foreground font-medium">Servers in {provider.country_count || '?'} Countries</div>
                        </div>
                    </div>

                    <div className="bg-card p-8 rounded-[2rem] shadow-sm border border-border/50 flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
                        <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mb-4 text-green-500">
                            <Zap size={24} />
                        </div>
                        <div>
                            <div className="text-3xl font-bold mb-1">{provider.avg_speed_mbps} Mbps</div>
                            <div className="text-muted-foreground font-medium">Average Speed</div>
                        </div>
                    </div>

                    <div className="bg-card p-8 rounded-[2rem] shadow-sm border border-border/50 flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
                        <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4 text-purple-500">
                            <Shield size={24} />
                        </div>
                        <div>
                            <div className="text-3xl font-bold mb-1">AES-256</div>
                            <div className="text-muted-foreground font-medium">Encryption Standard</div>
                        </div>
                    </div>

                    <div className="bg-card p-8 rounded-[2rem] shadow-sm border border-border/50 flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
                        <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-4 text-orange-500">
                            <Lock size={24} />
                        </div>
                        <div>
                            <div className="text-3xl font-bold mb-1">{provider.money_back_days} Days</div>
                            <div className="text-muted-foreground font-medium">Refund Policy</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* DETAILED CONTENT */}
            <div className="container mx-auto px-4 py-16 max-w-5xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    <div className="col-span-2 space-y-16">

                        {/* FEATURES */}
                        <section>
                            <h3 className="text-2xl font-bold mb-8 tracking-tight">Key Features</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(features).map(([key, val]) => (
                                    <div key={key} className="flex items-center gap-4 p-4 rounded-xl border border-border/30 bg-secondary/20">
                                        {val ? <CheckCircle2 className="text-green-500 w-6 h-6 shrink-0" /> : <div className="w-6 h-6 rounded-full border border-muted shrink-0" />}
                                        <span className="capitalize font-medium">{key.replace(/_/g, ' ')}</span>
                                    </div>
                                ))}
                                {Object.keys(features).length === 0 && (
                                    <div className="col-span-2 text-muted-foreground">Detailed feature list gathering in progress.</div>
                                )}
                            </div>
                        </section>

                        {/* ANALYSIS */}
                        <section className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                            <h3 className="text-2xl font-bold mb-6 text-foreground tracking-tight">Expert Verdict</h3>
                            <p>
                                {provider.provider_name} offers a robust network with over <strong className="text-foreground">{provider.server_count} servers</strong>.
                                Our tests indicate an average speed of <strong className="text-foreground">{provider.avg_speed_mbps} Mbps</strong>, making it suitable for
                                {features.streaming_support ? ' high-definition streaming and gaming.' : ' general browsing and secure emails.'}
                            </p>
                            {raw.notes && (
                                <div className="not-prose bg-secondary/30 p-8 rounded-3xl border border-border/50 mt-8">
                                    <h4 className="font-semibold mb-4 text-foreground">Editor&apos;s Notes</h4>
                                    <p className="text-muted-foreground italic">&ldquo;{raw.notes}&rdquo;</p>
                                </div>
                            )}
                        </section>

                        {/* COMMENTS */}
                        <div className="pt-8 border-t border-border/30">
                            <CommentSection providerType="vpn" providerSlug={slug} />
                        </div>
                    </div>

                    {/* SIDEBAR */}
                    <div className="space-y-8">
                        <div className="bg-card border border-border/50 rounded-[2rem] p-8 shadow-sm sticky top-24">
                            <h3 className="text-xl font-bold mb-6">Pricing Plans</h3>
                            <div className="space-y-6">
                                <div className="flex justify-between items-center p-4 rounded-xl bg-secondary/30">
                                    <span className="text-foreground font-medium">Monthly</span>
                                    <span className="font-bold text-xl">${provider.pricing_monthly}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 rounded-xl bg-primary/5 border border-primary/20">
                                    <span className="text-primary font-medium">Yearly Deal</span>
                                    <div className="text-right">
                                        <span className="block font-bold text-xl text-primary">${(provider.pricing_yearly / 12).toFixed(2)}/mo</span>
                                        <span className="text-xs text-muted-foreground">${provider.pricing_yearly} billed yearly</span>
                                    </div>
                                </div>
                                {renewalHikePercent > 50 && (
                                    <div className="bg-destructive/5 p-4 rounded-xl border border-destructive/10 text-center animate-pulse">
                                        <p className="text-xs font-bold text-destructive">
                                            ⚠️ Warning: Renewal price jumps by {renewalHikePercent}%
                                        </p>
                                    </div>
                                )}
                            </div>
                            <Button className="w-full mt-8 h-12 rounded-full text-lg shadow-md font-bold" size="lg" asChild>
                                <a
                                    href={affiliateUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Get Started Now <ArrowRight className="ml-2 w-4 h-4" />
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
