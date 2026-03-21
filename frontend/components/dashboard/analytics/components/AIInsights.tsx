import React from "react";
import { Sparkles, TrendingUp, Target, Lightbulb, AlertCircle, ArrowRight } from "lucide-react";
import { AnalyticsData } from "../types";
import { Button } from "@/components/ui/button";

interface Insight {
    title: string;
    description: string;
    type: 'success' | 'warning' | 'info';
    action?: string;
}

export function AIInsights({ data, onClose }: { data: AnalyticsData, onClose: () => void }) {
    const generateInsights = (data: AnalyticsData): Insight[] => {
        const insights: Insight[] = [];
        const ctr = data.summary.periodViews && data.summary.periodViews > 0 
            ? (data.summary.periodClicks || 0) / data.summary.periodViews 
            : 0;

        // 1. CTR Analysis
        if (ctr < 0.02) {
            insights.push({
                title: "Low Conversion Rate",
                description: "Your click-through rate is below 2%. Consider moving affiliate buttons higher in your top posts or using eye-catching GlassCards.",
                type: 'warning',
                action: "Review Top Posts"
            });
        } else if (ctr > 0.05) {
            insights.push({
                title: "Excellent Conversion!",
                description: "Your CTR is over 5%. This is higher than average. Try to replicate this layout across other high-traffic pages.",
                type: 'success'
            });
        }

        // 2. High Traffic Post
        if (data.topPosts.length > 0) {
            const topPost = data.topPosts[0];
            insights.push({
                title: "Trending Content",
                description: `"${topPost.post_slug}" is your top performer. Creating a follow-up or a "Best of" list including this provider could boost traffic.`,
                type: 'info',
                action: "Create Follow-up"
            });
        }

        // 3. Geographic Opportunity
        if (data.topCountries.length > 0) {
            const topCountry = data.topCountries[0];
            insights.push({
                title: "Geographic Expansion",
                description: `You have significant traffic from ${topCountry.country}. Consider a targeted comparison or localized pricing for this market.`,
                type: 'info'
            });
        }

        // 4. Maintenance Insight
        const now = new Date();
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        
        const dyingPosts = data.topPosts.filter(p => {
            if (!p.last_viewed_at) return false;
            const lastSeen = new Date(p.last_viewed_at);
            return lastSeen < twoWeeksAgo && p.views > 5;
        });

        if (dyingPosts.length > 0) {
            const p = dyingPosts[0];
            insights.push({
                title: "Modificar o Reindexar",
                description: `"${p.post_slug}" tiene buen tráfico histórico (${p.views} views) pero no se ha visto en más de 2 semanas. Una actualización rápida podría reactivarlo.`,
                type: 'warning',
                action: "Revisar Post"
            });
        }

        // 5. General Tip
        insights.push({
            title: "Internal Linking",
            description: "Adding 2-3 internal links from your Top 10 pages to newer posts can help reduce bounce rate and improve SEO rankings.",
            type: 'info'
        });

        return insights.slice(0, 4);
    };

    const insights = generateInsights(data);

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-black tracking-tight">Data-Driven Insights</h3>
                </div>
            </div>

            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {insights.map((insight, i) => (
                    <div 
                        key={i} 
                        className={`p-4 rounded-2xl border transition-all hover:shadow-md ${
                            insight.type === 'success' ? 'bg-green-50/50 border-green-100 text-green-900' :
                            insight.type === 'warning' ? 'bg-amber-50/50 border-amber-100 text-amber-900' :
                            'bg-primary/5 border-primary/10 text-primary-900'
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-xl shrink-0 ${
                                insight.type === 'success' ? 'bg-green-100 text-green-600' :
                                insight.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                                'bg-primary/10 text-primary'
                            }`}>
                                {insight.type === 'success' ? <TrendingUp className="w-4 h-4" /> :
                                 insight.type === 'warning' ? <AlertCircle className="w-4 h-4" /> :
                                 <Target className="w-4 h-4" />}
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-sm">{insight.title}</h4>
                                <p className="text-xs leading-relaxed opacity-80">{insight.description}</p>
                                {insight.action && (
                                    <button className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1 mt-2 hover:gap-2 transition-all">
                                        {insight.action} <ArrowRight className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-border/50">
                <Button onClick={onClose} className="w-full rounded-xl font-bold">
                    Got it, thanks!
                </Button>
            </div>
        </div>
    );
}
