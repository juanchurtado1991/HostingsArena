import React from "react";
import { BookOpen } from "lucide-react";

export function AffiliateGuide() {
    const guideItems = [
        {
            step: "1",
            title: "Find the Program",
            desc: "Go to the provider's website → scroll to the footer → look for \"Affiliates\" or \"Partners\" link. Most hosting/VPN companies have one.",
            color: "text-blue-400",
            bg: "bg-blue-500/10",
        },
        {
            step: "2",
            title: "Check Networks",
            desc: "Many programs run through networks like ShareASale, CJ Affiliate, Impact, or Awin. Search the provider name on these platforms.",
            color: "text-purple-400",
            bg: "bg-purple-500/10",
        },
        {
            step: "3",
            title: "Apply & Get Approved",
            desc: "Sign up, describe your site (comparison/review platform), and wait for approval. Most approve within 1-3 business days.",
            color: "text-amber-400",
            bg: "bg-amber-500/10",
        },
        {
            step: "4",
            title: "Generate Your Link",
            desc: "Once approved, go to the dashboard → \"Links\" or \"Creatives\" → generate a tracking URL. This is your affiliate link.",
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
        },
        {
            step: "5",
            title: "Add It Here",
            desc: "Click \"Add Partner\", paste the link, and set the commission rate and cookie duration from the program details page.",
            color: "text-cyan-400",
            bg: "bg-cyan-500/10",
        },
        {
            step: "6",
            title: "Verify & Monitor",
            desc: "Use \"Test Link\" to verify it redirects correctly. Check the network dashboard periodically for clicks and conversions.",
            color: "text-rose-400",
            bg: "bg-rose-500/10",
        },
    ];

    return (
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/5 via-card/80 to-blue-500/5 backdrop-blur-sm overflow-hidden animate-in slide-in-from-top-2 duration-300">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 rounded-xl bg-indigo-500/15">
                        <BookOpen className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">How to Get Affiliate Links</h3>
                        <p className="text-xs text-muted-foreground">Step-by-step guide to start earning commissions</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {guideItems.map((item) => (
                        <div key={item.step} className="flex gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                            <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center font-bold text-sm ${item.color}`}>
                                {item.step}
                            </div>
                            <div>
                                <p className={`text-sm font-semibold ${item.color} mb-1`}>{item.title}</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/15 text-xs text-emerald-400">
                    <span className="font-semibold">💡 Pro tip:</span> Search Google for <span className="font-mono">"[provider name] affiliate program"</span> — it often leads directly to the sign-up page.
                </div>
            </div>
        </div>
    );
}
