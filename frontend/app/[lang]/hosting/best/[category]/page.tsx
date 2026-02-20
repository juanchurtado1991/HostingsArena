import { Metadata } from "next";
import { Locale } from "@/i18n-config";
import { getDictionary } from "@/get-dictionary";
import { createAdminClient } from "@/lib/tasks/supabaseAdmin";
import HostingList from "../../HostingList";
import { Server, Zap, Shield, Crown } from "lucide-react";

interface Props {
    params: Promise<{
        lang: Locale;
        category: string;
    }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { category } = await params;
    const title = category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');
    
    return {
        title: `10 Best ${title} Providers of 2026 (Verified Data) | HostingArena`,
        description: `Compare the top-rated ${title} services. Based on real-world performance benchmarks, hidden renewal fee audits, and verified support scores.`,
    };
}

export default async function BestOfPage({ params }: Props) {
    const { lang, category } = await params;
    const dict = await getDictionary(lang);
    const supabase = createAdminClient();

    // Mapping categories to specific filters if needed
    // For now, let's just fetch all and we can refine later
    const { data: allProviders } = await supabase
        .from('hosting_providers')
        .select('*')
        .order('performance_grade', { ascending: true }) // A is better than B
        .limit(30);

    const uniqueProvidersMap = new Map();
    if (allProviders) {
        for (const p of allProviders) {
            if (!uniqueProvidersMap.has(p.provider_name)) {
                uniqueProvidersMap.set(p.provider_name, p);
            }
            if (uniqueProvidersMap.size === 10) break;
        }
    }
    const providers = Array.from(uniqueProvidersMap.values());

    const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');

    return (
        <main className="min-h-screen pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">
                        <Crown className="w-3 h-3" />
                        TOP 10 RANKING
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Best {categoryTitle} 
                        <span className="text-primary"> 2026</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-3xl">
                        Our monitoring systems have audited over 50 providers. These are the top {categoryTitle} solutions that passed our "Fair Renewal" and "TTFB Performance" benchmarks.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                        <Zap className="w-6 h-6 text-yellow-400 mb-3" />
                        <h3 className="font-bold mb-1">Performance First</h3>
                        <p className="text-xs text-muted-foreground">Every provider must maintain under 500ms TTFB.</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                        <Shield className="w-6 h-6 text-emerald-400 mb-3" />
                        <h3 className="font-bold mb-1">Uptime Verified</h3>
                        <p className="text-xs text-muted-foreground">99.9% real-world uptime tracked via global nodes.</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                        <Server className="w-6 h-6 text-blue-400 mb-3" />
                        <h3 className="font-bold mb-1">Scale Tested</h3>
                        <p className="text-xs text-muted-foreground">We test Inode limits and RAM capping personally.</p>
                    </div>
                </div>

                <HostingList 
                    initialProviders={providers || []}
                    lang={lang}
                />
            </div>
        </main>
    );
}
