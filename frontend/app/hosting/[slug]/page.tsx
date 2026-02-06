import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import CommentSection from "@/components/comments/CommentSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Check, X, Shield, Globe, Zap, Server, ChevronRight, AlertTriangle, Info, ArrowRight, CheckCircle2, HardDrive, Clock, ShieldCheck, Lock } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const title = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return {
        title: `${title} - In-Depth Review & Benchmarks | HostingArena`,
        description: `Performance tests, uptime stats, and pricing analysis for ${title}.`,
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
    const features = provider.features || {};
    const raw = provider.raw_data || {};

    // Helper for performance color (Apple style: Green is functional, Red is destructive, Blue is neutral)
    // We'll use Badge colors or text colors.

    return (
        <main className="min-h-screen bg-background">
            {/* HERO SECTION */}
            <div className="relative pt-32 pb-20 overflow-hidden">
                {/* Blur Backdrop */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl opacity-50 -z-10" />

                <div className="container mx-auto px-4 text-center relative z-10">
                    <Badge variant="outline" className="mb-6 border-primary/20 text-primary px-3 py-1 text-sm font-medium tracking-wide">
                        Web Hosting Review
                    </Badge>
                    <h1 className="text-6xl md:text-7xl font-semibold tracking-tight mb-6 text-foreground">
                        {provider.provider_name}
                    </h1>
                    <p className="text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 font-light leading-relaxed">
                        {provider.plan_name} Plan Analysis
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-bold tracking-tight text-foreground">${provider.pricing_monthly}</span>
                            <span className="text-xl text-muted-foreground font-medium">/mo</span>
                        </div>
                        <div className="h-12 w-px bg-border/50 hidden sm:block"></div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-medium text-foreground">Performance Grade:</span>
                            <span className="text-3xl font-bold text-indigo-500">{provider.performance_grade || 'B'}</span>
                        </div>
                    </div>

                    <div className="mt-12 flex justify-center">
                        <div className="mt-12 flex justify-center">
                            <a
                                href={provider.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-full h-14 px-10 text-lg bg-foreground text-background hover:bg-foreground/90 transition-transform hover:scale-105 duration-300 shadow-xl inline-flex items-center justify-center font-medium"
                            >
                                Visit Website <ChevronRight className="ml-2 w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* TECH SPECS BENTO GRID */}
            <div className="container mx-auto px-4 py-16 max-w-6xl">
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

                    <div className="bg-card p-8 rounded-[2rem] shadow-sm border border-border/50 flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
                        <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center mb-4 text-pink-500">
                            <Clock size={24} />
                        </div>
                        <div>
                            <div className="text-3xl font-bold mb-1">{provider.support_score}%</div>
                            <div className="text-muted-foreground font-medium">Support Score</div>
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
                            <h3 className="text-2xl font-bold mb-8 tracking-tight">Included Features</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(features).map(([key, val]) => (
                                    <div key={key} className="flex items-center gap-4 p-4 rounded-xl border border-border/30 bg-secondary/20">
                                        {val ? <CheckCircle2 className="text-green-500 w-6 h-6 shrink-0" /> : <div className="w-6 h-6 rounded-full border border-muted shrink-0" />}
                                        <span className="capitalize font-medium">{key.replace(/_/g, ' ')}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* PLANS COMPARISON TABLE (NEW) */}
                        {raw.plans && raw.plans.length > 0 && (
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
                                            {raw.plans.map((plan: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-secondary/10 transition-colors">
                                                    <td className="p-4 font-bold text-lg">{plan.name}</td>
                                                    <td className="p-4 text-green-600 font-bold">${plan.price_monthly}</td>
                                                    <td className="p-4 text-muted-foreground">${plan.renewal_price_monthly}</td>
                                                    <td className="p-4 font-medium">{plan.storage_gb} GB</td>
                                                    <td className="p-4 hidden sm:table-cell text-xs text-muted-foreground space-y-1">
                                                        {plan.features?.slice(0, 3).map((f: string, i: number) => (
                                                            <div key={i} className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-green-500" /> {f}</div>
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
                                {raw.web_server && (
                                    <div className="bg-secondary/20 p-4 rounded-2xl border border-border/30">
                                        <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Web Server</div>
                                        <div className="font-bold">{raw.web_server}</div>
                                    </div>
                                )}
                                {raw.php_versions && (
                                    <div className="bg-secondary/20 p-4 rounded-2xl border border-border/30 col-span-2">
                                        <div className="text-xs text-muted-foreground uppercase font-bold mb-1">PHP Versions</div>
                                        <div className="font-bold truncate" title={raw.php_versions.join(", ")}>{raw.php_versions.join(", ")}</div>
                                    </div>
                                )}
                                {raw.storage_type && (
                                    <div className="bg-secondary/20 p-4 rounded-2xl border border-border/30">
                                        <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Storage Type</div>
                                        <div className="font-bold flex items-center gap-1.5">
                                            {raw.storage_type.includes("NVMe") ? <HardDrive className="w-4 h-4 text-purple-500" /> : null}
                                            {raw.storage_type}
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
                                    <div className="bg-primary/5 rounded-2xl p-8 border border-primary/10 text-center">
                                        <h3 className="text-2xl font-bold mb-4">Ready to choose {provider.provider_name}?</h3>
                                        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                                            Get started with the plan that best fits your needs. 30-day money-back guarantee included.
                                        </p>
                                        <a
                                            href={provider.website_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full mt-8 h-12 rounded-full text-lg shadow-md inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors"
                                        >
                                            Get Started Now <ArrowRight className="ml-2 w-4 h-4" />
                                        </a>
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
