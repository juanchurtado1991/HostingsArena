import React, { useState, useEffect } from 'react';
import { useVideoStudio } from '@/contexts/VideoStudioContext';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, AlertTriangle, RotateCcw, Smartphone, Monitor } from 'lucide-react';
import { findBestMixedMediaBatch, type MediaItem } from '@/components/video/mediaLibrary';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { parseScript } from './scriptParser';

export function Phase1Ideation() {
    const { 
        title, setTitle, format, setFormat, scriptLang, setScriptLang, newsFocus, setNewsFocus, 
        setScenes, setCurrentPhase, isGeneratingScript, setIsGeneratingScript,
        error, setError, targetDuration, setTargetDuration,
    } = useVideoStudio();

    const [rssHeadlines, setRssHeadlines] = useState<{ title: string; source: string; link?: string; date?: string }[]>([]);
    const [rssLoading, setRssLoading] = useState(false);
    const [rssSources, setRssSources] = useState<string[]>([]);
    const [rssFailedFeeds, setRssFailedFeeds] = useState<string[]>([]);

    useEffect(() => {
        setRssLoading(true);
        fetch('/api/admin/video/headlines')
            .then(res => res.json())
            .then(data => { setRssHeadlines(data.headlines || []); setRssSources(data.sources || []); setRssFailedFeeds(data.failedFeeds || []); })
            .catch(() => { })
            .finally(() => setRssLoading(false));
    }, []);

    const decodeHtml = (html: string): string => {
        try { const txt = document.createElement('textarea'); txt.innerHTML = html; return txt.value; } catch { return html; }
    };

    const handleGenerateScript = async () => {
        setIsGeneratingScript(true);
        setError(null);
        try {
            const response = await fetch("/api/admin/video/script", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newsContext: newsFocus, format, lang: scriptLang, targetDuration })
            });
            const data = await response.json();
            if (!response.ok) { setError(data.details || data.error || "Failed to generate script"); return; }

            if (data.failedFeeds?.length > 0) {
                const msg = scriptLang === 'es'
                    ? `⚠️ Algunos feeds RSS fallaron: ${data.failedFeeds.join(', ')}. El script se generó con ${data.newsCount} noticias de: ${data.sources?.join(', ')}`
                    : `⚠️ Some RSS feeds failed: ${data.failedFeeds.join(', ')}. Script generated from ${data.newsCount} articles from: ${data.sources?.join(', ')}`;
                alert(msg);
            } else if (data.sources && data.newsCount) {
                console.log(`[Script] Generated from ${data.newsCount} articles: ${data.sources.join(', ')}`);
            }

            if (data.script) {
                const parsed = parseScript(data.script, format);
                const usedUrls = new Set<string>();
                const scenesWithMedia = await Promise.all(parsed.map(async (s, i) => {
                    let batch: MediaItem[] = [];
                    const searchQuery = s.pexelsQuery || s.visual;
                    try {
                        const res = await fetch('/api/admin/video/assets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: searchQuery, type: 'both', count: 4 }) });
                        if (res.ok) { const { results } = await res.json(); if (results?.length > 0) batch = results.filter((r: MediaItem) => !usedUrls.has(r.url)); }
                    } catch (e) { logger.warn('Live Pexels search failed, falling back to static library', e); }
                    if (batch.length === 0) batch = findBestMixedMediaBatch(s.visual, 2, 2, usedUrls);
                    batch.forEach((m: MediaItem) => usedUrls.add(m.url));
                    const segs = batch.map((media: MediaItem) => ({ id: Math.random().toString(36).substr(2, 9), source: 'library' as const, type: media.type, url: media.url, durationPct: Math.round(100 / batch.length), motionEffect: 'ken-burns' as const }));
                    return { ...s, assetUrl: batch[0]?.url || undefined, assetType: batch[0]?.type || 'video', mediaSegments: segs.length > 0 ? segs : undefined, voiceUrl: undefined, titleCardEnabled: true };
                }));
                setScenes(scenesWithMedia);
                setCurrentPhase(2);
            }
        } catch (err: any) { logger.error("Error generating script: ", err); setError(err.message || "Could not generate content."); }
        finally { setIsGeneratingScript(false); }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
            <div className="glass-card p-6 space-y-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-studio-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-studio-accent/10 flex items-center justify-center text-studio-accent border border-studio-accent/20 shadow-[0_0_15px_rgba(70,130,255,0.1)]">
                        <Sparkles className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold tracking-tight text-zinc-900">Phase 1: Retention Scripting</h2>
                        <p className="text-[11px] text-zinc-500 font-medium mt-1">Define your hook and news context. Act as the Executive Producer.</p>
                    </div>
                    <div className="flex gap-1 bg-zinc-100/80 p-1.5 rounded-2xl border border-zinc-200/50 backdrop-blur-2xl">
                        <button onClick={() => setFormat("9:16")} className={cn("flex items-center gap-2 h-9 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all", format === "9:16" ? "bg-studio-accent text-white shadow-[0_0_15px_rgba(0,122,255,0.4)]" : "text-zinc-500 hover:text-zinc-900")}><Smartphone className="w-4 h-4" /> 9:16</button>
                        <button onClick={() => setFormat("16:9")} className={cn("flex items-center gap-2 h-9 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all", format === "16:9" ? "bg-studio-accent text-white shadow-[0_0_15px_rgba(0,122,255,0.4)]" : "text-zinc-500 hover:text-zinc-900")}><Monitor className="w-4 h-4" /> 16:9</button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-studio-accent shadow-[0_0_8px_rgba(0,122,255,0.4)]" /> Global Intelligence Feed
                        </h3>
                        {rssSources.length > 0 && (
                            <span className="text-[9px] font-bold text-zinc-600 tracking-wider">
                                {rssSources.join(' · ')}
                                {rssFailedFeeds.length > 0 && <span className="text-red-500/60 ml-1"> · ⚠️ {rssFailedFeeds.join(', ')}</span>}
                            </span>
                        )}
                    </div>
                    <div className="max-h-[180px] overflow-y-auto rounded-2xl border border-zinc-200/50 bg-white/40 backdrop-blur-md divide-y divide-zinc-100/50 custom-scrollbar">
                        {rssLoading ? (
                            <div className="flex flex-col items-center justify-center py-8 gap-3 text-zinc-600"><Loader2 className="w-5 h-5 animate-spin text-studio-accent" /><span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Fetching World Intelligence...</span></div>
                        ) : rssHeadlines.length === 0 ? (
                            <div className="flex items-center justify-center py-8 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">No headlines available. Check your internet connection.</div>
                        ) : (
                            rssHeadlines.slice(0, 25).map((h, i) => (
                                <div key={i} className="flex items-start gap-4 px-5 py-4 hover:bg-white/60 transition-all cursor-default group">
                                    <span className={cn("text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 mt-0.5 border", h.source === 'TechCrunch' ? 'bg-green-500/10 text-green-400 border-green-500/20' : h.source === 'The Verge' ? 'bg-studio-accent/10 text-studio-accent border-studio-accent/20' : h.source === 'Ars Technica' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : h.source === 'Hacker News' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-studio-surface text-zinc-400 border-studio-border')}>{h.source.slice(0, 5)}</span>
                                    <span className="text-sm text-zinc-600 font-medium leading-relaxed group-hover:text-zinc-900 transition-colors">{decodeHtml(h.title)}</span>
                                    {h.date && <span className="text-[10px] font-mono text-zinc-700 shrink-0 mt-0.5">{Math.round((Date.now() - new Date(h.date).getTime()) / 3600000)}h</span>}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.25em] px-2">Project Name</h3>
                    <div className="relative group">
                        <input className="w-full bg-zinc-50 border border-black/10 rounded-2xl px-6 py-5 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:ring-4 focus:ring-studio-accent/10 focus:border-studio-accent/20 transition-all outline-none" placeholder="e.g. Apple M5 Chip News, Weekly Tech Roundup..." value={title} onChange={(e) => setTitle(e.target.value)} />
                        <div className="absolute inset-0 rounded-2xl pointer-events-none border border-studio-accent/0 group-focus-within:border-studio-accent/10 transition-all" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.25em] px-2">Strategic Focus</h3>
                    <div className="relative group">
                        <input className="w-full bg-zinc-50 border border-black/10 rounded-2xl px-6 py-5 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:ring-4 focus:ring-studio-accent/10 focus:border-studio-accent/20 transition-all outline-none" placeholder="e.g. AI breakthroughs, cybersecurity, startups..." value={newsFocus} onChange={(e) => setNewsFocus(e.target.value)} />
                        <div className="absolute inset-0 rounded-2xl pointer-events-none border border-studio-accent/0 group-focus-within:border-studio-accent/10 transition-all" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-black/5">
                    <div className="space-y-4">
                        <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.25em] px-2">Neural Translation</h3>
                        <div className="flex bg-zinc-100/80 p-1.5 rounded-2xl border border-zinc-200/50">
                            <button onClick={() => setScriptLang("en")} className={cn("flex-1 py-4 rounded-xl transition-all text-[10px] font-bold uppercase tracking-[0.2em]", scriptLang === "en" ? "bg-studio-accent text-white shadow-xl shadow-studio-accent/30" : "text-zinc-500 hover:text-zinc-900")}>English</button>
                            <button onClick={() => setScriptLang("es")} className={cn("flex-1 py-4 rounded-xl transition-all text-[10px] font-bold uppercase tracking-[0.2em]", scriptLang === "es" ? "bg-studio-accent text-white shadow-xl shadow-studio-accent/30" : "text-zinc-500 hover:text-zinc-900")}>Español</button>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.25em] px-2">Target Duration</h3>
                        <div className="flex bg-zinc-100/80 p-1.5 rounded-2xl border border-zinc-200/50">
                            {[{ label: '1', value: 60 }, { label: '5', value: 300 }, { label: '10', value: 600 }, { label: '15', value: 900 }, { label: '20', value: 1200 }, { label: '25', value: 1500 }, { label: '30', value: 1800 }].map(opt => (
                                <button key={opt.value} onClick={() => setTargetDuration(opt.value)} className={cn("flex-1 py-4 rounded-xl transition-all text-[10px] font-bold uppercase tracking-[0.2em]", targetDuration === opt.value ? "bg-studio-accent text-white shadow-xl shadow-studio-accent/30" : "text-zinc-500 hover:text-zinc-900")}>{opt.label}<span className="text-[8px] ml-0.5 opacity-60">min</span></button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col justify-end gap-4">
                        {error && (
                            <div className="bg-red-500/5 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-wider p-4 rounded-[1.25rem] flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
                                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                <div className="flex-1"><span className="font-black block mb-1">Engine Error</span><span className="opacity-80">{error}</span></div>
                            </div>
                        )}
                        <Button onClick={handleGenerateScript} disabled={isGeneratingScript || rssHeadlines.length === 0 || !title.trim()} className={cn("w-full h-16 rounded-2xl text-[11px] font-bold uppercase tracking-wider gap-3 transition-all active:scale-95 text-white", error ? "bg-amber-500 hover:bg-amber-600 text-black" : "bg-studio-accent hover:opacity-90 shadow-lg shadow-studio-accent/20")}>
                            {isGeneratingScript ? <Loader2 className="w-5 h-5 animate-spin" /> : error ? <RotateCcw className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                            {error ? "Retry Neural Synth" : "Craft Retention Script"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
