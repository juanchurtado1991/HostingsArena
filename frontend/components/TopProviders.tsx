"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Check, Star, Trophy, ArrowRight } from "lucide-react";
import Link from "next/link";
import { AffiliateButton } from "@/components/conversion/AffiliateButton";

const TOP_PROVIDERS = [
    {
        rank: 1,
        name: "Hostinger",
        slug: "hostinger",
        price: "2.99",
        discount: "75%",
        features: ["Free Domain", "Unmetered Bandwidth", "24/7 Support"],
        color: "from-purple-500/20 to-blue-500/20",
        badge: "Best Overall 2026",
        affiliateLink: "https://www.hostg.xyz/SH..." // Placeholder for real link
    },
    {
        rank: 2,
        name: "A2 Hosting",
        slug: "a2-hosting",
        price: "2.99",
        discount: "66%",
        features: ["20x Faster Turbo", "Free Migration", "Money Back Guarantee"],
        color: "from-orange-500/20 to-red-500/20",
        badge: "Fastest Speed",
        affiliateLink: "#"
    },
    {
        rank: 3,
        name: "Bluehost",
        slug: "bluehost",
        price: "2.95",
        discount: "70%",
        features: ["Recommended by WP", "Free SSL", "1-Click Install"],
        color: "from-blue-400/20 to-cyan-400/20",
        badge: "Best for WordPress",
        affiliateLink: "#"
    }
];

export interface TopProviderData {
    rank: number;
    name: string;
    slug: string;
    price: string | number;
    discount: string;
    features: string[];
    color: string;
    badge?: string;
    affiliateLink: string;
}

export function TopProviders({ dict, lang = 'en', providers }: { dict?: any, lang?: string, providers?: TopProviderData[] }) {
    const displayProviders = providers || TOP_PROVIDERS;
    return (
        <section className="container mx-auto px-4 md:px-6 relative z-20 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-fr">
                {/* Re-order array to put Rank 1 in the middle for visual symmetry if desired, 
            but for a standard grid 1-2-3 is often better. 
            User asked for symmetry. A 1-2-3 grid is symmetrical in alignment. 
            Let's keep the array order but make them identical in size.
        */}
                {displayProviders.sort((a, b) => a.rank - b.rank).map((provider) => (
                    <GlassCard
                        key={provider.name}
                        className={`
              relative overflow-hidden border-2 transition-all duration-300 flex flex-col h-full
              ${provider.rank === 1
                                ? 'border-primary shadow-2xl shadow-primary/20 z-10 ring-1 ring-primary/50'
                                : 'border-white/5 hover:border-white/20'
                            }
            `}
                    >
                        {/* Background Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${provider.color} opacity-10`} />

                        {/* Badge (Only for Rank 1 & 2 to balance? Or just Rank 1) */}
                        {provider.badge && (
                            <div className={`absolute top-0 right-0 text-xs font-bold px-3 py-1 rounded-bl-xl border-l border-b backdrop-blur-md
                 ${provider.rank === 1 ? 'bg-primary text-primary-foreground border-primary' : 'bg-white/10 text-muted-foreground border-white/10'}
               `}>
                                {provider.badge}
                            </div>
                        )}

                        <div className="relative z-10 flex flex-col h-full p-6">
                            {/* Header */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`flex items-center justify-center w-12 h-12 rounded-2xl font-bold border shadow-inner text-lg
                    ${provider.rank === 1 ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-background/50 border-white/10 text-muted-foreground'}
                `}>
                                    {provider.rank === 1 ? <Trophy className="w-6 h-6" /> : <span>#{provider.rank}</span>}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold">{provider.name}</h3>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Hosting</p>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="mb-8 p-4 rounded-2xl bg-background/40 border border-white/5 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <span className="text-sm text-muted-foreground line-through opacity-70">$10.99</span>
                                    <span className="text-green-400 text-xs font-bold bg-green-400/10 px-2 py-0.5 rounded-full">-{provider.discount}</span>
                                </div>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-5xl font-black tracking-tighter text-foreground">${provider.price}</span>
                                    <span className="text-sm text-muted-foreground font-medium">{dict?.price_monthly?.replace("{price}", "") || "/mo"}</span>
                                </div>
                            </div>

                            {/* Features */}
                            <ul className="space-y-4 mb-8 flex-grow">
                                {provider.features.map(f => (
                                    <li key={f} className="flex items-start gap-3 text-sm text-muted-foreground">
                                        <div className="mt-0.5 min-w-[16px]">
                                            <Check className={`w-4 h-4 ${provider.rank === 1 ? 'text-primary' : 'text-green-500/70'}`} />
                                        </div>
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            {/* CTAs */}
                            <div className="space-y-3 mt-auto">
                                <AffiliateButton
                                    className={`w-full font-bold text-lg h-12 rounded-xl shadow-lg transition-all
                                        ${provider.rank === 1 ? 'bg-primary hover:bg-primary/90 hover:shadow-primary/25 text-primary-foreground' : 'bg-white/5 hover:bg-white/10 text-foreground border border-white/10'}
                                    `}
                                    providerName={provider.name}
                                    visitUrl={provider.affiliateLink}
                                    position="top_providers_card"
                                    showIcon={false}
                                >
                                    {dict?.view_deal || "View Deal"} {provider.rank === 1 && '⚡️'}
                                </AffiliateButton>
                                <Link href={`/${lang}/hosting/${provider.slug}`} className="block text-center text-xs text-muted-foreground hover:text-primary transition-colors">
                                    {dict?.read_review?.replace("{provider}", "") || "Read detailed review"}
                                </Link>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </section>
    );
}
