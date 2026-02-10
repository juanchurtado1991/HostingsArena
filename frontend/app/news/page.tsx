import { GlassCard } from "@/components/ui/GlassCard";
import { Clock, Tag, ExternalLink } from "lucide-react";
import Image from "next/image";
import { getAffiliateUrl } from "@/lib/affiliates";

// Mock AI News Data
const NEWS = [
    {
        id: 1,
        title: "CyberGhost Audit Confirms No-Logs Policy for 2026",
        excerpt: "Deloitte's independent audit verifies that CyberGhost's server infrastructure strictly adheres to its privacy claims.",
        category: "Privacy",
        date: "Feb 06, 2026",
        readTime: "3 min read",
        provider: "CyberGhost"
    },
    {
        id: 2,
        title: "Bluehost Announces Severe Renewal Price Hikes",
        excerpt: "Starting next month, renewal rates for shared hosting plans are expected to increase by an average of 15%.",
        category: "Hosting Market",
        date: "Feb 05, 2026",
        readTime: "4 min read",
        provider: "Bluehost"
    },
    {
        id: 3,
        title: "NordVPN Introduces Post-Quantum Decryption Protection",
        excerpt: "The new feature aims to protect user traffic against future threats from quantum computing decryption.",
        category: "Technology",
        date: "Feb 04, 2026",
        readTime: "5 min read",
        provider: "NordVPN"
    }
];

export default async function NewsPage() {
    return (
        <div className="min-h-screen pt-24 pb-12 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                        Industry <span className="text-primary">Intelligence</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        AI-curated updates on privacy, price changes, and infrastructure verified by our scrapers.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {await Promise.all(NEWS.map(async (item) => {
                        const affiliateLink = await getAffiliateUrl(item.provider, `https://www.google.com/search?q=${item.provider}`);
                        return (
                            <GlassCard key={item.id} className="flex flex-col h-full hover:scale-[1.01] transition-transform group">
                                <div className="bg-white/5 h-48 w-full rounded-xl mb-6 flex items-center justify-center text-muted-foreground/30 relative overflow-hidden">
                                    {/* Simple gradient placeholder instead of image */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="text-4xl font-bold relative z-10">{item.provider}</span>
                                </div>

                                <div className="flex items-center gap-4 text-xs font-medium text-primary mb-3">
                                    <span className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-md">
                                        <Tag className="w-3 h-3" /> {item.category}
                                    </span>
                                    <span className="flex items-center gap-1 text-muted-foreground">
                                        <Clock className="w-3 h-3" /> {item.readTime}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold mb-3 leading-tight">{item.title}</h3>
                                <p className="text-muted-foreground text-sm line-clamp-3 mb-6">
                                    {item.excerpt}
                                </p>

                                <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center text-xs text-muted-foreground">
                                    <span>{item.date}</span>
                                    <a
                                        href={affiliateLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-primary font-semibold hover:underline"
                                    >
                                        Check Deal <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </GlassCard>
                        );
                    }))}
                </div>
            </div>
        </div>
    );
}
