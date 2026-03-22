"use client";

import React from "react";
import { AlertTriangle, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PostSidebarProps {
    editLang: 'en' | 'es';
    excerpt: string;
    setExcerpt: (val: string) => void;
    excerptEs: string;
    setExcerptEs: (val: string) => void;
    category: string;
    setCategory: (val: string) => void;
    categories: string[];
    relatedProvider: string;
    setRelatedProvider: (val: string) => void;
    wordCount: number;
    error: string | null;
    onClose: () => void;
    saving: boolean;
    post?: any;
}

const INPUT_CLASS = "w-full px-4 py-3 rounded-2xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-200 placeholder:text-muted-foreground/50";

export function PostSidebar({
    editLang,
    excerpt, setExcerpt,
    excerptEs, setExcerptEs,
    category, setCategory, categories,
    relatedProvider, setRelatedProvider,
    wordCount,
    error,
    onClose,
    saving,
    post
}: PostSidebarProps) {
    return (
        <div className="flex flex-col overflow-y-auto bg-muted/20">
            <div className="p-6 space-y-6">
                <div>
                    <label className="block text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2.5 text-inherit">Excerpt {editLang === 'es' ? '(ES)' : '(EN)'}</label>
                    <textarea
                        value={editLang === 'es' ? excerptEs : excerpt}
                        onChange={(e) => editLang === 'es' ? setExcerptEs(e.target.value) : setExcerpt(e.target.value)}
                        placeholder="Short summary that appears in post cards and social sharing..."
                        className={`${INPUT_CLASS} h-24 resize-none`}
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2.5 text-inherit">Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className={INPUT_CLASS}>
                        <option value="">Select category...</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2.5 text-inherit">Related Provider</label>
                    <input type="text" value={relatedProvider} onChange={(e) => setRelatedProvider(e.target.value)} placeholder="e.g. NordVPN, Hostinger" className={INPUT_CLASS} />
                    <p className="text-[10px] text-muted-foreground mt-1.5 opacity-60 italic">Links to affiliate partner for "Check Deal" button</p>
                </div>

                {post?.is_ai_generated && post?.ai_quality_score && (
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/15">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-2">AI Quality Score</p>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-primary to-sky-500 transition-all duration-500"
                                    style={{ width: `${post.ai_quality_score}%` }}
                                />
                            </div>
                            <span className="text-sm font-bold text-primary tabular-nums">{post.ai_quality_score}</span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50 text-center">
                        <p className="text-lg font-bold tabular-nums text-foreground">{wordCount}</p>
                        <p className="text-[9px] uppercase tracking-widest text-muted-foreground/50 font-bold mt-0.5">Words</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/50 text-center">
                        <p className="text-lg font-bold tabular-nums text-foreground">{Math.max(1, Math.ceil(wordCount / 200))}</p>
                        <p className="text-[9px] uppercase tracking-widest text-muted-foreground/50 font-bold mt-0.5">Min Read</p>
                    </div>
                </div>

                {error && (
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> {error}
                    </div>
                )}
            </div>

            <div className="mt-auto p-6 border-t border-border/50">
                <Button variant="outline" onClick={onClose} className="w-full rounded-2xl text-sm h-10 font-bold tracking-tight" disabled={saving}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}
