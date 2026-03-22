"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Search, Plus, Loader2, Sparkles,
    FileText, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";
import { PostEditorModal } from "./post-editor/PostEditorModal";
import { GenerationConfigModal } from "./post-editor/GenerationConfigModal";
import { PostCard } from "./post-editor/PostCard";
import { Post, AffiliateLink } from "./post-editor/types";
import { PublishSummaryModal } from "./PublishSummaryModal"; 

export function PostEditor({ onNavigateToAffiliates }: { onNavigateToAffiliates?: () => void }) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [editingPost, setEditingPost] = useState<Post | null | "new">(null);
    const [generating, setGenerating] = useState(false);
    const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([]);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [generationStatus, setGenerationStatus] = useState("");
    const [showProgressOverlay, setShowProgressOverlay] = useState(false);
    const [showGenModal, setShowGenModal] = useState(false);
    const [summaryPost, setSummaryPost] = useState<Post | null>(null);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: '12' });
            if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
            if (search) params.set('search', search);

            const res = await fetch(`/api/admin/posts?${params}`);
            const data = await res.json();
            setPosts(data.posts || []);
            setTotal(data.total || 0);
        } catch (e) {
            console.error("Failed to fetch posts:", e);
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, search]);

    const fetchAffiliateLinks = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/affiliates?status=active');
            const data = await res.json();
            setAffiliateLinks(
                (data.affiliates || [])
                    .filter((a: AffiliateLink) => a.status === 'active')
            );
        } catch (e) {
            console.error("Failed to fetch affiliates:", e);
        }
    }, []);

    useEffect(() => { fetchPosts(); }, [fetchPosts]);
    useEffect(() => { fetchAffiliateLinks(); }, [fetchAffiliateLinks]);

    const handleSavePost = async (data: Partial<Post>) => {
        const method = data.id ? "PATCH" : "POST";
        const res = await fetch("/api/admin/posts", {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Failed to save");
        fetchPosts();
        return result;
    };

    const handleManualIndex = async (post: Post) => {
        try {
            const urls = [
                `https://hostingsarena.com/en/news/${post.slug}`,
                `https://hostingsarena.com/es/news/${post.slug}`
            ];

            for (const url of urls) {
                await fetch("/api/admin/posts/index-google", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url }),
                });
            }
            alert("Index requests sent for both languages!");
        } catch (e) {
            console.error("Manual indexing error:", e);
            alert("Failed to send indexing request.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this post permanently?")) return;
        setDeletingId(id);
        try {
            const res = await fetch(`/api/admin/posts?id=${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            fetchPosts();
        } catch (e) {
            console.error("Delete error:", e);
        } finally {
            setDeletingId(null);
        }
    };

    const handleGenerate = async (config: any) => {
        setShowGenModal(false);
        setGenerating(true);
        setGenerationProgress(0);
        setShowProgressOverlay(true);

        const totalToGenerate = 1;

        for (let i = 0; i < totalToGenerate; i++) {
            setGenerationStatus(`Initializing AI Agent (${config.model || 'gemini-2.0-flash'})...`);

            try {
                const response = await fetch("/api/admin/posts/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        count: 1,
                        provider_name: config.provider_name,
                        scenario: config.scenario,
                        custom_category: config.category,
                        model: config.model,
                        target_word_count: config.target_word_count,
                        extra_instructions: config.extra_instructions
                    }),
                });

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || "Connection failed");
                }

                const reader = response.body?.getReader();
                if (!reader) throw new Error("No reader available");

                const decoder = new TextDecoder();
                let partialBuffer = "";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    partialBuffer += chunk;

                    const lines = partialBuffer.split("\n\n");
                    partialBuffer = lines.pop() || "";

                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            try {
                                const data = JSON.parse(line.slice(6));
                                if (data.status) setGenerationStatus(data.status);
                                const currentPostProgress = (data.progress || 0) / 100;
                                setGenerationProgress(Math.round(((i + currentPostProgress) / totalToGenerate) * 100));
                            } catch (e) { console.error("Error parsing progress chunk", e); }
                        }
                    }
                }
            } catch (e: any) {
                console.error(`Post ${i + 1} failed:`, e);
                setGenerationStatus(`Error: ${e.message}`);
                await new Promise(r => setTimeout(r, 2000));
            }
        }

        setShowProgressOverlay(false);
        setGenerating(false);
        fetchPosts();
    };

    const totalPages = Math.ceil(total / 12);

    return (
        <div className="space-y-6">
            {affiliateLinks.length === 0 && !loading && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-amber-500">AI Generation Locked</h3>
                            <p className="text-xs text-muted-foreground italic">You need at least one active affiliate partner to generate content.</p>
                        </div>
                    </div>
                    {onNavigateToAffiliates && (
                        <Button size="sm" onClick={onNavigateToAffiliates} className="bg-amber-500 text-white hover:bg-amber-600 rounded-full font-bold px-6">
                            Configure Partners
                        </Button>
                    )}
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex gap-2 items-center">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search articles..."
                            className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-medium"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="px-3 py-2 rounded-xl bg-muted/50 border border-border text-xs font-bold uppercase tracking-wider focus:outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="draft">Drafts</option>
                        <option value="published">Published</option>
                    </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center">
                    <Button
                        size="sm"
                        onClick={() => setShowGenModal(true)}
                        disabled={generating || affiliateLinks.length === 0}
                        className="rounded-full shadow-lg gap-2 transition-all bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold px-6"
                    >
                        {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-studio-accent" />}
                        Generate Feed
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => setEditingPost("new")}
                        disabled={affiliateLinks.length === 0}
                        className="rounded-full shadow-lg gap-2 transition-all bg-studio-accent text-white font-bold px-6"
                    >
                        <Plus className="w-4 h-4" />
                        New Draft
                    </Button>
                </div>
            </div>

            <div className="flex gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                <span>{total} total posts</span>
                <span>•</span>
                <span>{affiliateLinks.length} active partners</span>
            </div>

            {loading ? (
                <div className="text-center py-24 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-studio-accent" />
                    <p className="text-xs font-bold uppercase tracking-widest opacity-40 italic">Retrieving News Feed...</p>
                </div>
            ) : posts.length === 0 ? (
                <GlassCard className="p-20 text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-6">
                        <FileText className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                    <p className="text-sm font-bold mb-2 uppercase tracking-widest text-foreground">Empty Archive</p>
                    <p className="text-xs text-muted-foreground mb-8 max-w-xs leading-relaxed italic">No articles found matching your criteria. Start by generating an AI post or creating a manual entry.</p>
                    <Button onClick={() => setShowGenModal(true)} disabled={generating || affiliateLinks.length === 0} className="rounded-full gap-2 bg-studio-accent text-white font-bold px-8 py-6">
                        <Sparkles className="w-4 h-4" /> Generate News
                    </Button>
                </GlassCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map(post => (
                        <PostCard 
                            key={post.id} 
                            post={post} 
                            onEdit={setEditingPost} 
                            onDelete={handleDelete}
                            onIndex={handleManualIndex}
                            onSocialSummary={(p) => setSummaryPost(p)}
                            isDeleting={deletingId === post.id}
                        />
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <Button
                            key={i}
                            size="sm"
                            variant={page === i + 1 ? "default" : "outline"}
                            onClick={() => setPage(i + 1)}
                            className="w-8 h-8 p-0 rounded-lg text-xs font-bold"
                        >
                            {i + 1}
                        </Button>
                    ))}
                </div>
            )}

            {showProgressOverlay && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
                    <GlassCard className="w-full max-w-md p-8 shadow-2xl border-primary/20 bg-card/80">
                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                                <div className="relative p-4 rounded-full bg-primary/10 border border-primary/20">
                                    <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-bold tracking-tight">AI Newsroom Working</h3>
                                <p className="text-sm text-muted-foreground min-h-[40px] px-4">
                                    {generationStatus}
                                </p>
                            </div>

                            <div className="w-full space-y-3">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                    <span className="animate-pulse">Generating Mega-Guides</span>
                                    <span>{generationProgress}%</span>
                                </div>
                                <div className="h-3 w-full bg-muted/50 rounded-full overflow-hidden border border-border/50">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary via-sky-500 to-blue-600 transition-all duration-500 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                        style={{ width: `${generationProgress}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground/40 italic">
                                    This takes ~3 minutes per post for deep research.
                                </p>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}

            {showGenModal && (
                <GenerationConfigModal
                    affiliateLinks={affiliateLinks}
                    onGenerate={handleGenerate}
                    onClose={() => setShowGenModal(false)}
                    loading={generating}
                />
            )}

            {summaryPost && (
                <PublishSummaryModal
                    isOpen={!!summaryPost}
                    onClose={() => setSummaryPost(null)}
                    status="success"
                    postUrl={`https://hostingsarena.com/news/${summaryPost.slug}`}
                    socialContent={{
                        twitter: summaryPost.social_tw_text || "",
                        facebook: summaryPost.social_fb_text || "",
                        linkedin: summaryPost.social_li_text || "",
                        hashtags: summaryPost.social_hashtags || []
                    }}
                    socialContentEs={{
                        twitter: summaryPost.social_tw_text_es || "",
                        facebook: summaryPost.social_fb_text_es || "",
                        linkedin: summaryPost.social_li_text_es || "",
                        hashtags: summaryPost.social_hashtags_es || []
                    }}
                    indexingStatus="idle"
                />
            )}
            {editingPost !== null && (
                <PostEditorModal
                    post={editingPost === "new" ? null : editingPost}
                    affiliateLinks={affiliateLinks}
                    onSave={handleSavePost}
                    onClose={() => setEditingPost(null)}
                />
            )}
        </div>
    );
}
