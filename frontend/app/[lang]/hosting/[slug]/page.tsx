import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import CommentSection from "@/components/comments/CommentSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Check, X, Shield, Globe, Zap, Server, ChevronRight, AlertTriangle, Info, ArrowRight, CheckCircle2, HardDrive, Clock, ShieldCheck, Lock } from "lucide-react";
import { StickyBuyBar } from "@/components/conversion/StickyBuyBar";
import { getAffiliateUrl } from "@/lib/affiliates";
import { PageTracker } from "@/components/tracking/PageTracker";
import { ReviewJsonLd } from "@/components/seo/ReviewJsonLd";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const title = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    // We'd ideally fetch the provider image here for OG, but for now we use a default or the provider name

    return {
        title: `${title} - In-Depth Review & Benchmarks ${new Date().getFullYear()} | HostingArena`,
        description: `Performance tests, uptime stats, and pricing analysis for ${title}. See why it scored 8+/10.`,
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/hosting/${slug}`,
        },
        openGraph: {
            title: `${title} Review - Is it Worth It in ${new Date().getFullYear()}?`,
            description: `Real data: Performance, Pricing, and Hidden Fees analyzed for ${title}.`,
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/hosting/${slug}`,
            siteName: 'HostingsArena',
            images: [
                {
                    url: `${process.env.NEXT_PUBLIC_SITE_URL}/og-hosting.png`, // Fallback or dynamic generation
                    width: 1200,
                    height: 630,
                    alt: `${title} Review`,
                }
            ],
            type: 'article',
        }
    };
}

export default async function HostingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const supabase = await createClient();
    const { slug } = await params;
    const nameQuery = slug.replace(/-/g, ' ');

    const { data: providers, error } = await supabase
        .from("hosting_providers")
        .select("*")
        .ilike("provider_name", nameQuery)
        .limit(1);

    if (error || !providers || providers.length === 0) {
        return notFound();
    }

    const provider = providers[0];

    // Fetch ALL plans for this provider to show in comparison table
    const { data: allPlans } = await supabase
        .from("hosting_providers")
        .select("*")
        .eq("provider_name", provider.provider_name)
        .order("pricing_monthly", { ascending: true });

    const features = provider.features || {};
    const raw = provider.raw_data || {};

    const renewalHikePercent = provider.renewal_price && provider.pricing_monthly
        ? Math.round(((provider.renewal_price - provider.pricing_monthly) / provider.pricing_monthly) * 100)
        : 0;

    const isBadProvider = (provider.performance_grade === 'C' || provider.performance_grade === 'D' || provider.performance_grade === 'F' || provider.support_score < 70);

    const affiliateUrl = await getAffiliateUrl(provider.provider_name, provider.website_url);

    return (
        <main className="min-h-screen bg-background pb-20">
            <PageTracker />
            <ReviewJsonLd
                providerName={provider.provider_name}
                description={`In-depth review of ${provider.provider_name} hosting services. Performance grade: ${provider.performance_grade || 'B'}.`}
                rating={provider.support_score ? provider.support_score / 10 : 8.5}
                slug={slug}
                type="hosting"
                datePublished={provider.created_at || new Date().toISOString()}
                price={provider.pricing_monthly}
            />
            <BreadcrumbJsonLd
                items={[
                    { name: "Home", item: "/" },
                    { name: "Hosting Reviews", item: "/hosting" },
                    { name: provider.provider_name, item: `/hosting/${slug}` }
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
            <div className="relative pt-32 pb-10 overflow-hidden">
                {/* Blur Backdrop */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl opacity-50 -z-10" />

                <div className="container mx-auto px-4 text-center relative z-10">
                    {isBadProvider && (
                        <div className="max-w-2xl mx-auto mb-8 bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl flex items-center justify-center gap-3 animate-bounce">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="font-bold">Warning: There are faster, cheaper alternatives available.</span>
                        </div>
                    )}

                    <Badge variant="outline" className="mb-6 border-primary/20 text-primary px-3 py-1 text-sm font-medium tracking-wide cursor-pointer hover:bg-primary/5 transition-colors">
                        <Star className="w-3 h-3 mr-1 fill-primary" /> Rated {provider.support_score ? (provider.support_score / 10).toFixed(1) : '8.5'}/10 by Users
                    </Badge>

                    <h1 className="text-6xl md:text-7xl font-semibold tracking-tight mb-6 text-foreground">
                        {provider.provider_name}
                    </h1>
                    <p className="text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 font-light leading-relaxed">
                        {provider.plan_name} Plan Analysis
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
                            <span className="text-xl font-medium text-foreground">Performance Grade:</span>
                            <span className={`text-3xl font-bold ${provider.performance_grade === 'A+' ? 'text-green-500' : provider.performance_grade === 'A' ? 'text-green-500' : 'text-yellow-500'}`}>
                                {provider.performance_grade || 'B'}
                            </span>
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
                    {provider.money_back_days > 0 && (
                        <div className="mt-4 text-sm text-muted-foreground flex items-center justify-center gap-1">
                            <ShieldCheck className="w-4 h-4 text-green-500" /> {provider.money_back_days}-Day Money-Back Guarantee
                        </div>
                    )}
                </div>
            </div>

            {/* TECH SPECS BENTO GRID */}
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <h2 className="text-3xl font-semibold mb-10 tracking-tight text-center">Tech Specs</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-card p-8 rounded-[2rem] shadow-sm border border-border/50 flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4 text-indigo-500">
                            <HardDrive size={24} />
                        </div>
                        <div>
                            <div className="text-3xl font-bold mb-1">{provider.storage_gb ? `${provider.storage_gb} GB` : 'Unl.'}</div>
                            <div className="text-muted-foreground font-medium">SSD Storage</div>
                        </div>
                    </div>

                    <div className="bg-card p-8 rounded-[2rem] shadow-sm border border-border/50 flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 text-blue-500">
                            <Globe size={24} />
                        </div>
                        <div>
                            <div className="text-3xl font-bold mb-1">{provider.bandwidth || 'Unmetered'}</div>
                            <div className="text-muted-foreground font-medium">Bandwidth</div>
                        </div>
                    </div>

                    <div className="bg-card p-8 rounded-[2rem] shadow-sm border border-border/50 flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
                        <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mb-4 text-green-500">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <div className="text-3xl font-bold mb-1">{features.ssl ? 'Included' : 'Paid'}</div>
                            <div className="text-muted-foreground font-medium">SSL Certificate</div>
                        </div>
                    </div>

                    {provider.support_score > 0 && (
                        <div className="bg-card p-8 rounded-[2rem] shadow-sm border border-border/50 flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
                            <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center mb-4 text-pink-500">
                                <Clock size={24} />
                            </div>
                            <div>
                                <div className="text-3xl font-bold mb-1">{provider.support_score}%</div>
                                <div className="text-muted-foreground font-medium">Support Score</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* DETAILED CONTENT */}
            <div className="container mx-auto px-4 py-16 max-w-5xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    <div className="col-span-2 space-y-16">

                        {/* FEATURES */}
                        <section>
                            <h3 className="text-2xl font-bold mb-8 tracking-tight">Included Features</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(features)
                                    .sort((a, b) => {
                                        // Standardize order: Non-booleans (tags) first, then booleans
                                        if (typeof a[1] !== 'boolean' && typeof b[1] === 'boolean') return -1;
                                        if (typeof a[1] === 'boolean' && typeof b[1] !== 'boolean') return 1;
                                        return a[0].localeCompare(b[0]);
                                    })
                                    .map(([key, val]) => (
                                        <div key={key} className="flex items-center gap-4 p-4 rounded-xl border border-border/30 bg-secondary/20">
                                            <div className="shrink-0">
                                                {typeof val === 'boolean' ? (
                                                    val ? <CheckCircle2 className="text-green-500 w-6 h-6" /> : <X className="text-red-500 w-6 h-6" />
                                                ) : (
                                                    <div className="text-green-500 font-bold text-xs bg-green-500/10 px-2 py-1 rounded-md min-w-[3rem] text-center border border-green-500/20">{String(val)}</div>
                                                )}
                                            </div>
                                            <span className="capitalize font-medium text-sm">{key.replace(/_/g, ' ')}</span>
                                        </div>
                                    ))}
                            </div>
                        </section>

                        {/* PLANS COMPARISON TABLE (DYNAMIC FROM ALL PLANS) */}
                        {allPlans && allPlans.length > 0 && (
                            <section className="mt-12">
                                <h3 className="text-2xl font-bold mb-6 tracking-tight">Compare Plans</h3>
                                <div className="overflow-x-auto rounded-3xl border border-border/50 shadow-sm">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-secondary/30 border-b border-border/50">
                                            <tr>
                                                <th className="p-4 font-semibold">Plan Name</th>
                                                <th className="p-4 font-semibold">Price</th>
                                                <th className="p-4 font-semibold">Renewal</th>
                                                <th className="p-4 font-semibold">Storage</th>
                                                <th className="p-4 font-semibold hidden sm:table-cell">Key Features</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/30 bg-card">
                                            {allPlans.map((plan: any) => (
                                                <tr key={plan.id} className={`hover:bg-secondary/10 transition-colors ${plan.id === provider.id ? "bg-primary/5" : ""}`}>
                                                    <td className="p-4 font-bold text-lg">
                                                        <div className="flex flex-col">
                                                            {plan.plan_name}
                                                            {plan.id === provider.id && <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Current</span>}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-green-600 font-bold">${plan.pricing_monthly}</td>
                                                    <td className="p-4 text-muted-foreground">
                                                        {plan.renewal_price ? `$${plan.renewal_price}` : '-'}
                                                    </td>
                                                    <td className="p-4 font-medium">{plan.storage_gb} GB</td>
                                                    <td className="p-4 hidden sm:table-cell text-xs text-muted-foreground space-y-1">
                                                        {Object.entries(plan.features || {}).slice(0, 3).map(([key, val]) => (
                                                            val ? <div key={key} className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-green-500" /> {key.replace(/_/g, ' ')}</div> : null
                                                        ))}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        )}

                        {/* HIDDEN FEES WARNING (NEW) */}
                        {raw.hidden_fees && (
                            <section className="mt-12 bg-red-500/5 border border-red-500/20 rounded-3xl p-8">
                                <h3 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400 flex items-center gap-2">
                                    ⚠️ Hidden Fees & Terms
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {raw.hidden_fees.renewal_hike && (
                                        <div>
                                            <div className="text-sm font-bold uppercase tracking-wider text-red-500/80 mb-1">Renewal Hike</div>
                                            <div className="font-semibold">{raw.hidden_fees.renewal_hike}</div>
                                        </div>
                                    )}
                                    {raw.hidden_fees.domain_renewal && (
                                        <div>
                                            <div className="text-sm font-bold uppercase tracking-wider text-red-500/80 mb-1">Domain Renewal</div>
                                            <div className="font-semibold">{raw.hidden_fees.domain_renewal}</div>
                                        </div>
                                    )}
                                    {raw.hidden_fees.setup_fee && (
                                        <div>
                                            <div className="text-sm font-bold uppercase tracking-wider text-red-500/80 mb-1">Setup Fee</div>
                                            <div className="font-semibold">{raw.hidden_fees.setup_fee}</div>
                                        </div>
                                    )}
                                    {raw.inode_limit && (
                                        <div>
                                            <div className="text-sm font-bold uppercase tracking-wider text-red-500/80 mb-1">File Limit (Inodes)</div>
                                            <div className="font-semibold">{raw.inode_limit.toLocaleString()} Files</div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* TECHNICAL DEEP DIVE (NEW) */}
                        <section className="mt-12">
                            <h3 className="text-2xl font-bold mb-6 tracking-tight">Technical Deep Dive</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {provider.web_server && provider.web_server !== 'Unknown' && (
                                    <div className="bg-secondary/20 p-4 rounded-2xl border border-border/30">
                                        <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Web Server</div>
                                        <div className="font-bold">{provider.web_server}</div>
                                    </div>
                                )}
                                {provider.control_panel && (
                                    <div className="bg-secondary/20 p-4 rounded-2xl border border-border/30">
                                        <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Control Panel</div>
                                        <div className="font-bold">{provider.control_panel}</div>
                                    </div>
                                )}
                                {provider.uptime_guarantee > 0 && (
                                    <div className="bg-secondary/20 p-4 rounded-2xl border border-border/30">
                                        <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Uptime SLA</div>
                                        <div className="font-bold">{provider.uptime_guarantee}%</div>
                                    </div>
                                )}
                                {provider.backup_frequency && (
                                    <div className="bg-secondary/20 p-4 rounded-2xl border border-border/30">
                                        <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Backup</div>
                                        <div className="font-bold">{provider.backup_frequency}</div>
                                    </div>
                                )}
                                {provider.inodes > 0 && (
                                    <div className="bg-secondary/20 p-4 rounded-2xl border border-border/30">
                                        <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Inode Limit</div>
                                        <div className="font-bold">{provider.inodes.toLocaleString()}</div>
                                    </div>
                                )}
                                {provider.max_processes && (
                                    <div className="bg-secondary/20 p-4 rounded-2xl border border-border/30">
                                        <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Max Processes</div>
                                        <div className="font-bold">{provider.max_processes}</div>
                                    </div>
                                )}
                                {provider.data_center_locations && provider.data_center_locations.length > 0 && (
                                    <div className="bg-secondary/20 p-4 rounded-2xl border border-border/30 col-span-2">
                                        <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Data Centers</div>
                                        <div className="font-bold truncate" title={provider.data_center_locations.join(", ")}>
                                            {provider.data_center_locations.length} Locations ({provider.data_center_locations.slice(0, 3).join(", ")}{provider.data_center_locations.length > 3 ? "..." : ""})
                                        </div>
                                    </div>
                                )}
                                {provider.php_versions && provider.php_versions.length > 0 && (
                                    <div className="bg-secondary/20 p-4 rounded-2xl border border-border/30 col-span-2">
                                        <div className="text-xs text-muted-foreground uppercase font-bold mb-1">PHP Versions</div>
                                        <div className="font-bold truncate" title={provider.php_versions.join(", ")}>{provider.php_versions.join(", ")}</div>
                                    </div>
                                )}
                                {provider.storage_type && (
                                    <div className="bg-secondary/20 p-4 rounded-2xl border border-border/30">
                                        <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Storage Type</div>
                                        <div className="font-bold flex items-center gap-1.5">
                                            {provider.storage_type.includes("NVMe") ? <HardDrive className="w-4 h-4 text-purple-500" /> : null}
                                            {provider.storage_type && provider.storage_type !== "unknown" ? provider.storage_type : ""}
                                        </div>
                                    </div>
                                )}
                                {features.wordpress_support && (
                                    <div className="bg-secondary/20 p-4 rounded-2xl border border-border/30">
                                        <div className="text-xs text-muted-foreground uppercase font-bold mb-1">WordPress</div>
                                        <div className="font-bold flex items-center gap-1.5 text-green-500">
                                            <CheckCircle2 className="w-4 h-4" /> Optimized
                                        </div>
                                    </div>
                                )}
                                {features.free_migration && (
                                    <div className="bg-secondary/20 p-4 rounded-2xl border border-border/30">
                                        <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Migration</div>
                                        <div className="font-bold flex items-center gap-1.5 text-green-500">
                                            <CheckCircle2 className="w-4 h-4" /> Free
                                        </div>
                                    </div>
                                )}
                                {features.email_accounts && (
                                    <div className="bg-secondary/20 p-4 rounded-2xl border border-border/30">
                                        <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Emails</div>
                                        <div className="font-bold">{String(features.email_accounts)}</div>
                                    </div>
                                )}
                                {features.staging_environment && (
                                    <div className="bg-secondary/20 p-4 rounded-2xl border border-border/30">
                                        <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Staging</div>
                                        <div className="font-bold flex items-center gap-1.5 text-green-500">
                                            <CheckCircle2 className="w-4 h-4" /> Available
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* ANALYSIS */}
                        <section className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed mt-12">
                            <h3 className="text-2xl font-bold mb-6 text-foreground tracking-tight">Expert Analysis</h3>
                            <p>
                                {provider.provider_name} connects you with a reliable {provider.provider_type} hosting environment.
                                With a performance grade of <strong className="text-foreground">{provider.performance_grade}</strong>, it stands out for
                                {provider.performance_grade === 'A+' ? ' critical mission apps that simply cannot fail.' : ' personal and business sites offering solid value.'}
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
                            <CommentSection providerType="hosting" providerSlug={slug} />
                        </div>
                    </div>

                    {/* SIDEBAR */}
                    <div className="space-y-8">
                        <div className="bg-card border border-border/50 rounded-[2rem] p-8 shadow-sm sticky top-24">
                            <h3 className="text-xl font-bold mb-6">Pricing Summary</h3>
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground font-medium">Initial Term</span>
                                    <span className="font-bold text-2xl text-foreground">${provider.pricing_monthly}</span>
                                </div>
                                {provider.renewal_price && (
                                    <div className={`rounded-2xl p-6 border text-center ${renewalHikePercent > 50 ? 'bg-destructive/5 border-destructive/20' : 'bg-primary/5 border-primary/10'}`}>
                                        <h3 className="text-xl font-bold mb-2">Ready to choose {provider.provider_name}?</h3>
                                        {renewalHikePercent > 0 && (
                                            <p className="text-sm text-muted-foreground mb-6">
                                                {renewalHikePercent > 50 ? (
                                                    <>Lock in the low price for 36 months to avoid the <span className="text-destructive font-bold">{renewalHikePercent}% hike</span> later.</>
                                                ) : (
                                                    <>Fair renewal pricing. Safe to choose for short or long term.</>
                                                )}
                                            </p>
                                        )}

                                        <Button className="w-full rounded-full text-lg font-bold shadow-md" size="lg" asChild>
                                            <a
                                                href={affiliateUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Get Started Now <ArrowRight className="ml-2 w-4 h-4" />
                                            </a>
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-center text-muted-foreground mt-6 opacity-70">
                                * Prices may vary based on term length (12/24/36 months).
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
