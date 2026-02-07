"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Check, Star, Trophy, ArrowRight } from "lucide-react";
import Link from "next/link";

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

export function TopProviders() {
    return (
        <section className="container mx-auto px-6 -mt-20 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {TOP_PROVIDERS.map((provider) => (
                    <GlassCard
                        key={provider.name}
                        className={`relative overflow-hidden border-2 hover:scale-105 transition-transform duration-300 ${provider.rank === 1 ? 'border-primary/50 shadow-2xl shadow-primary/10' : 'border-white/5'}`}
                    >
                        {/* Background Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${provider.color} opacity-30`} />

                        {/* Badge */}
                        <div className="absolute top-0 right-0 bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-bl-xl border-l border-b border-primary/20 backdrop-blur-md">
                            {provider.badge}
                        </div>

                        <div className="relative z-10 flex flex-col h-full">
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background/50 font-bold border border-white/10">
                                    {provider.rank === 1 ? <Trophy className="w-4 h-4 text-yellow-500" /> : <span className="text-muted-foreground">#{provider.rank}</span>}
                                </div>
                                <h3 className="text-xl font-bold">{provider.name}</h3>
                            </div>

                            {/* Price */}
                            <div className="mb-6">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black tracking-tighter">${provider.price}</span>
                                    <span className="text-sm text-muted-foreground">/mo</span>
                                </div>
                                <div className="text-green-400 text-sm font-bold flex items-center gap-1 mt-1">
                                    Save {provider.discount} <ArrowRight className="w-3 h-3" />
                                </div>
                            </div>

                            {/* Features */}
                            <ul className="space-y-2 mb-8 flex-grow">
                                {provider.features.map(f => (
                                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Check className="w-4 h-4 text-primary" /> {f}
                                    </li>
                                ))}
                            </ul>

                            {/* CTAs */}
                            <div className="space-y-3">
                                <Button className="w-full font-bold text-md rounded-full shadow-lg hover:shadow-primary/25 transition-all" size="lg">
                                    Ver Oferta Exclusiva ⚡️
                                </Button>
                                <Link href={`/hosting/${provider.slug}`} className="block text-center text-xs text-muted-foreground hover:text-white underline decoration-dotted">
                                    Leer análisis completo
                                </Link>
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </section>
    );
}
