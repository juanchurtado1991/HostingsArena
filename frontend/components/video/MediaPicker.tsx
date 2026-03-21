"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, Image as ImageIcon, Film, PlusCircle, Upload, CheckCircle, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { ALL_MEDIA, getImageUrl, getRandomMedia, type MediaItem, loadMediaData, isMediaLibraryLoaded } from "@/components/video/mediaLibrary";

interface MediaPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (item: MediaItem | string, isUpload?: boolean) => void;
    activeSegmentId: string | null;
    currentFormat: "9:16" | "16:9";
    onTriggerUpload: () => void;
}

export function MediaPicker({ isOpen, onClose, onConfirm, activeSegmentId, currentFormat, onTriggerUpload }: MediaPickerProps) {
    const [tab, setTab] = useState<'library' | 'upload' | 'random'>('library');
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video'>('all');
    const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
    const [visibleCount, setVisibleCount] = useState(30);
    const [brokenLinks, setBrokenLinks] = useState<Set<string>>(new Set());
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [libraryLoaded, setLibraryLoaded] = useState(isMediaLibraryLoaded());
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load library on mount
    useEffect(() => {
        if (isOpen && !isMediaLibraryLoaded()) {
            loadMediaData().then(() => setLibraryLoaded(true));
        }
    }, [isOpen]);

    // Reset pagination and selection state
    useEffect(() => { 
        setVisibleCount(30); 
    }, [search, typeFilter, tab, libraryLoaded]);

    // Track loading state for preview
    useEffect(() => {
        if (selectedItem) setIsPreviewLoading(true);
    }, [selectedItem]);

    const filteredMedia = useMemo(() => {
        let items = ALL_MEDIA;
        if (typeFilter !== 'all') items = items.filter(it => it.type === typeFilter);
        if (search) {
            const q = search.toLowerCase();
            items = items.filter(it => it.keywords.some(k => k.toLowerCase().includes(q)));
        }
        return items;
    }, [search, typeFilter]);

    const handleLinkError = (url: string) => {
        setBrokenLinks(prev => new Set(prev).add(url));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/admin/video/upload', { method: 'POST', body: formData });
            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            
            const newItem: MediaItem = {
                type: file.type.startsWith('video') ? 'video' : 'image',
                url: data.url,
                keywords: ['custom', 'upload']
            };
            
            setSelectedItem(newItem);
        } catch (err) {
            console.error("Media upload error:", err);
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <div className="absolute inset-0 bg-black/5 backdrop-blur-2xl" onClick={onClose} />
            
            <div className="relative w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden bg-studio-surface rounded-none border border-studio-border shadow-[0_32px_64px_rgba(0,0,0,0.1)] animate-in fade-in zoom-in duration-500 glass-card">
                {/* Header */}
                <div className="p-8 border-b border-black/5 flex items-center justify-between gap-8 bg-black/[0.01]">
                    <div className="flex items-center gap-8">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black uppercase tracking-[0.1em] text-zinc-900 italic">
                                {activeSegmentId ? 'Asset Configuration' : 'Visual Repository'}
                            </h3>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">High-retention cinematic assets</p>
                        </div>
                        <div className="flex p-1.5 bg-black/5 rounded-[1.25rem] border border-black/5 shadow-inner">
                            {(['library', 'upload', 'random'] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTab(t)}
                                    className={cn(
                                        "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest whitespace-nowrap",
                                        tab === t 
                                            ? "bg-studio-accent text-white shadow-[0_4px_12px_rgba(0,122,255,0.3)]" 
                                            : "text-zinc-500 hover:text-zinc-900 hover:bg-black/5"
                                    )}
                                >
                                    {t === 'library' ? '📚 Archive' : t === 'upload' ? '📤 Import' : '🎲 Chaos'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 flex items-center justify-center hover:bg-black/5 rounded-2xl transition-all text-zinc-400 hover:text-studio-accent group">
                        <PlusCircle className="rotate-45 w-6 h-6 group-hover:text-studio-accent transition-colors" />
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Browser Area */}
                    <div className="flex-1 flex flex-col min-w-0 border-r border-studio-border">
                        <div className="p-8 flex flex-col h-full">
                            {tab === 'library' ? (
                                <>
                                    <div className="flex flex-col md:flex-row gap-6 mb-8 shrink-0">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                            <Input 
                                                placeholder="Scrutinize tech assets, kinetic shots..." 
                                                value={search} 
                                                onChange={(e) => setSearch(e.target.value)}
                                                className="pl-14 h-14 bg-white border-studio-border text-zinc-900 placeholder:text-zinc-300 focus:ring-4 focus:ring-studio-accent/5 focus:border-studio-accent/30 rounded-2xl font-medium transition-all shadow-sm"
                                            />
                                        </div>
                                        <div className="flex p-1.5 bg-black/5 rounded-2xl border border-black/5 shadow-inner">
                                            {(['all', 'image', 'video'] as const).map(f => (
                                                <button 
                                                    key={f} 
                                                    onClick={() => setTypeFilter(f)}
                                                    className={cn("px-6 py-2 rounded-xl text-[9px] font-black uppercase transition-all tracking-widest", 
                                                        typeFilter === f ? "bg-white shadow-sm text-studio-accent" : "text-zinc-500 hover:text-zinc-900")}
                                                >
                                                    {f}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div 
                                        className="flex-1 overflow-y-auto pr-4 custom-scrollbar grid grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max"
                                        onScroll={(e) => {
                                            const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                                            if (scrollHeight - scrollTop <= clientHeight + 400) {
                                                setVisibleCount(prev => Math.min(prev + 30, filteredMedia.length));
                                            }
                                        }}
                                    >
                                        {filteredMedia.slice(0, visibleCount).map((item, idx) => (
                                            <div key={`${item.url}-${idx}`} className="relative aspect-video group/card">
                                                <button
                                                    onClick={() => { setSelectedItem(item); setIsPreviewLoading(true); }}
                                                    className={cn(
                                                        "w-full h-full rounded-2xl overflow-hidden border-2 transition-all duration-500 relative bg-zinc-100 flex items-center justify-center",
                                                        selectedItem?.url === item.url 
                                                            ? "border-studio-accent shadow-[0_4px_12px_rgba(0,122,255,0.2)] scale-[0.98]" 
                                                            : "border-black/5 hover:border-black/10 hover:bg-zinc-200"
                                                    )}
                                                >
                                                    {item.type === 'video' ? (
                                                        <video 
                                                            src={`${item.url}#t=0.001`} 
                                                            preload="metadata" 
                                                            muted 
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                                                            onError={() => handleLinkError(item.url)}
                                                            onMouseOver={e => e.currentTarget.play().catch(() => {})}
                                                            onMouseOut={e => { e.currentTarget.pause(); e.currentTarget.currentTime = 0.001; }}
                                                        />
                                                    ) : (
                                                        <img 
                                                            src={getImageUrl(item, 400, 225)} 
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110" 
                                                            referrerPolicy="no-referrer" 
                                                            onError={() => handleLinkError(item.url)}
                                                            alt=""
                                                        />
                                                    )}
                                                    <div className="absolute top-3 right-3 p-1.5 bg-black/60 rounded-xl backdrop-blur-md border border-white/10 z-10 transition-all group-hover/card:border-studio-accent/30">
                                                        {item.type === 'video' ? <Film className="w-3.5 h-3.5 text-studio-accent shadow-[0_0_10px_rgba(70,130,255,0.4)]" /> : <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />}
                                                    </div>
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : tab === 'random' ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8 animate-in fade-in zoom-in">
                                    <div className="w-32 h-32 rounded-[2.5rem] bg-studio-accent/10 flex items-center justify-center text-studio-accent shadow-[0_0_50px_rgba(70,130,255,0.1)] border border-studio-accent/20 relative group">
                                        <PlusCircle className="w-14 h-14 animate-pulse group-hover:scale-110 transition-transform duration-500" />
                                        <div className="absolute inset-0 rounded-[2.5rem] border border-studio-accent/40 animate-ping opacity-10" />
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-3xl font-black uppercase tracking-[0.1em] text-zinc-900 italic">Neural Harvest</h4>
                                        <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-[0.2em] max-w-[320px] leading-relaxed mx-auto opacity-70 italic">Algorithmic selection system extracting the most relevant visual DNA for your production.</p>
                                    </div>
                                    <Button 
                                        onClick={() => {
                                            const random = getRandomMedia();
                                            setSelectedItem(random);
                                            setIsPreviewLoading(true);
                                        }}
                                        className="h-16 px-12 rounded-2xl bg-studio-accent hover:opacity-90 text-white font-black uppercase tracking-[0.3em] text-[10px] gap-4 shadow-[0_8px_24px_rgba(0,122,255,0.3)] transition-all active:scale-95"
                                    >
                                        Engage AI Picker
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8 animate-in fade-in zoom-in">
                                    <div className="w-32 h-32 rounded-[2.5rem] bg-black/5 flex items-center justify-center text-zinc-400 border border-black/5 shadow-inner group">
                                        {isUploading ? <Loader2 className="w-14 h-14 animate-spin text-studio-accent" /> : <Upload className="w-14 h-14 group-hover:translate-y-[-5px] transition-transform duration-500" />}
                                    </div>
                                    <div className="space-y-4 text-center">
                                        <h4 className="text-3xl font-black uppercase tracking-[0.1em] text-zinc-900 italic">Import Asset</h4>
                                        <p className="text-[10px] text-zinc-400 max-w-[320px] leading-relaxed mx-auto uppercase font-black tracking-[0.25em] opacity-80">Master-grade support for RAW 4K Video, High-fidelity Imagery and Professional visual standards.</p>
                                    </div>
                                    <Button 
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="h-16 px-12 rounded-2xl bg-black/5 hover:bg-black/10 border border-black/5 text-studio-accent font-black uppercase tracking-[0.3em] text-[11px] shadow-sm transition-all active:scale-95 group/btn"
                                    >
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin mr-3" />
                                                Encoding Stream...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4 mr-3 group-hover/btn:-translate-y-1 transition-transform" />
                                                Target Local File
                                            </>
                                        )}
                                    </Button>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/*,video/*" 
                                        onChange={handleFileUpload}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar - Master Preview */}
                    <div className="w-96 p-10 flex flex-col bg-zinc-50 shrink-0 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-studio-accent/5 rounded-full blur-[100px] -mr-32 -mt-32 opacity-20" />
                        
                        <div className="relative z-10 flex items-center gap-3 mb-10 shrink-0">
                            <Sparkles className="w-4 h-4 text-studio-accent" />
                            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.3em]">Master Monitor v4</span>
                        </div>
                        
                        <div className="flex-1 space-y-10 relative z-10 overflow-y-auto custom-scrollbar pr-2 mb-6">
                            {selectedItem ? (
                                <div className="space-y-10">
                                    <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border-2 border-studio-accent/30 bg-white shadow-lg group/preview">
                                        {isPreviewLoading && (
                                            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10 backdrop-blur-sm">
                                                <Loader2 className="w-8 h-8 animate-spin text-studio-accent/40" />
                                            </div>
                                        )}
                                        {selectedItem.type === 'video' ? (
                                            <video 
                                                src={selectedItem.url} 
                                                autoPlay 
                                                loop 
                                                muted 
                                                className="w-full h-full object-cover transition-all duration-700"
                                                onLoadedData={() => setIsPreviewLoading(false)}
                                            />
                                        ) : (
                                            <img 
                                                src={getImageUrl(selectedItem, 600, 338)} 
                                                className="w-full h-full object-cover transition-all duration-700" 
                                                referrerPolicy="no-referrer" 
                                                alt="" 
                                                onLoad={() => setIsPreviewLoading(false)}
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                        <div className="absolute bottom-4 left-6 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-studio-accent animate-pulse shadow-[0_0_8px_rgba(70,130,255,0.8)]" />
                                            <span className="text-[8px] font-black text-white/60 uppercase tracking-[0.3em]">Signal Optimized</span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                        <div className="text-left bg-white p-6 rounded-[2rem] border border-studio-border shadow-md">
                                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-4 block">Asset Metadata</span>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedItem.keywords.map(kw => (
                                                    <span key={kw} className="px-3 py-1 rounded-lg bg-studio-accent/5 border border-studio-accent/10 text-[9px] text-studio-accent font-black uppercase tracking-[0.15em] hover:bg-studio-accent/10 transition-colors shadow-sm">#{kw}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="aspect-video flex flex-col items-center justify-center border-2 border-dashed border-black/5 rounded-[2.5rem] bg-zinc-50 opacity-60 shadow-inner">
                                    <ImageIcon className="w-12 h-12 mb-4 text-zinc-300" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 leading-loose text-center">System Standby<br/>Awaiting Visual Input</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-auto pt-4 border-t border-studio-border relative z-10 shrink-0">
                            <Button 
                                className="w-full h-14 rounded-2xl bg-studio-accent hover:opacity-90 text-white font-black uppercase tracking-[0.25em] text-[11px] shadow-[0_8px_24px_rgba(0,122,255,0.3)] transition-all active:scale-95 disabled:opacity-20 flex items-center justify-center gap-4 mt-4" 
                                disabled={!selectedItem}
                                onClick={() => selectedItem && onConfirm(selectedItem)}
                            >
                                <CheckCircle className="w-4 h-4" />
                                Use this Asset
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}