"use client";

import { Check, X } from "lucide-react";
import { GlassCard } from "./GlassCard";

interface ProsConsSectionProps {
    pros?: string[];
    cons?: string[];
    title?: string;
}

export function ProsConsSection({ pros = [], cons = [], title }: ProsConsSectionProps) {
    if (pros.length === 0 && cons.length === 0) return null;

    return (
        <section className="space-y-6">
            {title && <h3 className="text-2xl font-bold tracking-tight">{title}</h3>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pros */}
                <GlassCard className="border-green-500/10 bg-green-500/[0.02]">
                    <h4 className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold mb-4">
                        <Check className="w-5 h-5" /> What we Liked
                    </h4>
                    <ul className="space-y-3">
                        {pros.map((pro, i) => (
                            <li key={i} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-green-500 mt-2" />
                                {pro}
                            </li>
                        ))}
                        {pros.length === 0 && <li className="text-sm text-muted-foreground italic">Solid across the board.</li>}
                    </ul>
                </GlassCard>

                {/* Cons */}
                <GlassCard className="border-red-500/10 bg-red-500/[0.02]">
                    <h4 className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold mb-4">
                        <X className="w-5 h-5" /> What to Consider
                    </h4>
                    <ul className="space-y-3">
                        {cons.map((con, i) => (
                            <li key={i} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-red-500 mt-2" />
                                {con}
                            </li>
                        ))}
                        {cons.length === 0 && <li className="text-sm text-muted-foreground italic">No major drawbacks found.</li>}
                    </ul>
                </GlassCard>
            </div>
        </section>
    );
}
