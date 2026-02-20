import { Metadata } from "next";
import { Locale } from "@/i18n-config";
import { getDictionary } from "@/get-dictionary";
import { createAdminClient } from "@/lib/tasks/supabaseAdmin";
import VpnList from "../../VpnList";
import { Shield, Lock, Globe, Crown } from "lucide-react";

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
        title: `Top 10 ${title} VPNs of 2026 (Privacy Audited) | HostingArena`,
        description: `Compare the highest-rated ${title} VPN providers. Independently verified for No-Log policies, RAM-only servers, and proven court histories.`,
    };
}

export default async function BestOfVPNPage({ params }: Props) {
    const { lang, category } = await params;
    const dict = await getDictionary(lang);
    const supabase = createAdminClient();

    const { data: allProviders } = await supabase
        .from('vpn_providers')
        .select('*')
        .order('countries', { ascending: false })
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
                        PREMIUM PRIVACY RANKING
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Best {categoryTitle} 
                        <span className="text-primary"> 2026</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-3xl">
                        Our privacy experts have audited 60+ VPN infrastructures. These are the top {categoryTitle} providers that passed our strict "No-Logs Ownership" and "RAM-Only" verification.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                        <Lock className="w-6 h-6 text-emerald-400 mb-3" />
                        <h3 className="font-bold mb-1">Privacy Verified</h3>
                        <p className="text-xs text-muted-foreground">Every provider must have independent No-Log audits.</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                        <Shield className="w-6 h-6 text-blue-400 mb-3" />
                        <h3 className="font-bold mb-1">RAM-Only Infrastructure</h3>
                        <p className="text-xs text-muted-foreground">We verify that no data is ever written to physical disks.</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                        <Globe className="w-6 h-6 text-purple-400 mb-3" />
                        <h3 className="font-bold mb-1">Unblocking tested</h3>
                        <p className="text-xs text-muted-foreground">Successfully unblocks 15+ streaming regions.</p>
                    </div>
                </div>

                <VpnList 
                    initialProviders={providers || []}
                    lang={lang}
                />
            </div>
        </main>
    );
}
