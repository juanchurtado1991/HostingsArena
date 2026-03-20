"use client";

import React, { useState } from "react";
import { Sparkles, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AffiliateLink } from "./types";

interface GenerationConfigModalProps {
    affiliateLinks: AffiliateLink[];
    onGenerate: (config: any) => void;
    onClose: () => void;
    loading: boolean;
}

export function GenerationConfigModal({
    affiliateLinks,
    onGenerate,
    onClose,
    loading
}: GenerationConfigModalProps) {
    const [provider, setProvider] = useState("random");
    const [customProvider, setCustomProvider] = useState("");
    const [model, setModel] = useState("gemini-2.5-flash");
    const [wordCount, setWordCount] = useState("1500");
    const [instructions, setInstructions] = useState("");

    const INPUT_CLASS = "w-full px-4 py-3 rounded-2xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-200";

    const handleRun = () => {
        onGenerate({
            provider_name: provider === "custom" ? customProvider : (provider === "random" ? undefined : provider),
            model: model,
            target_word_count: parseInt(wordCount),
            extra_instructions: instructions
        });
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 dark:bg-black/60 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="w-full max-w-lg rounded-3xl border border-[color:var(--glass-border)] bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-6 py-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-lg">AI Command Center</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Provider</label>
                        <select value={provider} onChange={(e) => setProvider(e.target.value)} className={INPUT_CLASS}>
                            <option value="random">🎲 Random Affiliate</option>
                            {affiliateLinks.map(a => (
                                <option key={a.id} value={a.provider_name}>{a.provider_name}</option>
                            ))}
                            <option value="custom">✍️ Custom Name</option>
                        </select>
                        {provider === "custom" && (
                            <input
                                type="text"
                                placeholder="e.g. AWS, Vultr"
                                value={customProvider}
                                onChange={(e) => setCustomProvider(e.target.value)}
                                className={`mt-2 ${INPUT_CLASS}`}
                            />
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">AI Model</label>
                            <select value={model} onChange={(e) => setModel(e.target.value)} className={INPUT_CLASS}>
                                <option value="gemini-2.5-flash">🚀 Gemini 2.5 Flash</option>
                                <option value="gemini-2.0-flash">⚡ Gemini 2.0 Flash</option>
                                <option value="gemini-1.5-flash">✨ Gemini 1.5 Flash</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Article Length</label>
                            <select value={wordCount} onChange={(e) => setWordCount(e.target.value)} className={INPUT_CLASS}>
                                <option value="800">Short (~800 words)</option>
                                <option value="1500">Standard (~1500 words)</option>
                                <option value="2500">Deep Dive (~2500+ words)</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">What do you want the post to be about? <span className="text-red-500">*</span></label>
                        <textarea
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            placeholder="e.g. Write a tutorial on how to install WordPress on this provider, focusing on their custom dashboard. Keep the tone very upbeat."
                            className={`${INPUT_CLASS} min-h-[120px] resize-y`}
                            required
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-border/50">
                        <Button variant="ghost" onClick={onClose} disabled={loading} className="rounded-xl">Cancel</Button>
                        <Button
                            onClick={handleRun}
                            disabled={loading || !instructions.trim()}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-6"
                        >
                            {loading ? <Clock className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                            {loading ? "Generating..." : "Generate Post"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
