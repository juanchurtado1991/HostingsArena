"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Search, Music, Volume2, Play, Pause, 
    CheckCircle, X, Loader2, Waves, Activity, Upload, Sparkles
} from "lucide-react";
import { MUSIC_LIBRARY, SFX_LIBRARY, ALL_AUDIO, getRandomAudio, type AudioItem, loadAudioData, isAudioLibraryLoaded } from "@/components/video/audioLibrary";
import { logger } from "@/lib/logger";
import { cn } from "@/lib/utils";

interface AudioPickerProps {
    isOpen: boolean;
    onConfirm: (url: string, label: string) => void;
    onClose: () => void;
    selectedUrl?: string;
    title?: string;
    activeSegmentId?: string; 
}

export function AudioPicker({ isOpen, onConfirm, onClose, selectedUrl, title = "Audio Library", activeSegmentId }: AudioPickerProps) {
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState<'music' | 'sfx' | 'upload' | 'random'>(
        title.toLowerCase().includes('sfx') ? 'sfx' : 'music'
    );
    const [playingId, setPlayingId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [selectedItem, setSelectedItem] = useState<AudioItem | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [visibleCount, setVisibleCount] = useState(30);
    const [libraryLoaded, setLibraryLoaded] = useState(isAudioLibraryLoaded());

    // Load library on mount
    useEffect(() => {
        if (isOpen && !isAudioLibraryLoaded()) {
            loadAudioData().then(() => setLibraryLoaded(true));
        }
    }, [isOpen]);

    const filteredAudio = useMemo(() => {
        const library = tab === 'music' ? MUSIC_LIBRARY : 
                       tab === 'sfx' ? SFX_LIBRARY : 
                       ALL_AUDIO;
        
        const uniqueMap = new Map<string, AudioItem>();
        library.forEach(item => {
            if (!uniqueMap.has(item.id)) uniqueMap.set(item.id, item);
        });
        
        return Array.from(uniqueMap.values()).filter(item => 
            item.label.toLowerCase().includes(search.toLowerCase()) ||
            item.keywords.some(k => k.toLowerCase().includes(search.toLowerCase()))
        );
    }, [search, tab, libraryLoaded]);

    // Reset pagination
    useEffect(() => {
        setVisibleCount(30);
    }, [tab, search, libraryLoaded]);

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (selectedUrl) {
            const item = ALL_AUDIO.find(a => a.url === selectedUrl);
            if (item) setSelectedItem(item);
        }
    }, [selectedUrl]);

    const togglePlay = (item: AudioItem) => {
        if (playingId === item.id) {
            audioRef.current?.pause();
            setPlayingId(null);
        } else {
            if (audioRef.current) audioRef.current.pause();
            audioRef.current = new Audio(item.url);
            audioRef.current.play().catch(err => logger.error("Audio error", { err }));
            audioRef.current.onended = () => setPlayingId(null);
            setPlayingId(item.id);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = URL.createObjectURL(file);
            const newItem: AudioItem = {
                id: `upload-${Date.now()}`,
                label: file.name,
                url: url,
                keywords: ['upload', 'custom'],
                type: 'sfx'
            };
            setSelectedItem(newItem);
            setTab('upload');
        } catch (error) {
            logger.error("Upload failed", { error });
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <div className="absolute inset-0 bg-black/5 backdrop-blur-2xl" onClick={onClose} />
            
            <div className="relative w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden bg-studio-surface rounded-none border border-studio-border shadow-[0_32px_64px_rgba(0,0,0,0.1)] animate-in fade-in zoom-in duration-500 glass-card">
                
                <div className="p-8 border-b border-black/5 flex items-center justify-between gap-8 bg-black/[0.01]">
                    <div className="flex items-center gap-8">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black uppercase tracking-[0.1em] text-zinc-900 italic">
                                {title}
                            </h3>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Curated high-fidelity audio assets</p>
                        </div>
                        <div className="flex p-1.5 bg-black/5 rounded-[1.25rem] border border-black/5 shadow-inner">
                            {(['music', 'sfx', 'upload', 'random'] as const).map(t => (
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
                                    {t === 'music' ? '🎵 Studio' : t === 'sfx' ? '🔊 FX' : t === 'upload' ? '📤 Import' : '🎲 Chaos'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 flex items-center justify-center hover:bg-black/5 rounded-2xl transition-all text-zinc-400 hover:text-studio-accent group">
                        <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden bg-studio-bg/30">
                    
                    <div className="flex-1 flex flex-col p-8 min-w-0 border-r border-studio-border">
                        {tab === 'music' || tab === 'sfx' ? (
                            <>
                                <div className="relative mb-8">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    <Input 
                                        placeholder={tab === 'music' ? "Scrutinize genres, technical moods..." : "Locate click, kinetic swoosh, digital glitch..."} 
                                        value={search} 
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-14 h-14 bg-white border-studio-border text-zinc-900 placeholder:text-zinc-300 focus:ring-4 focus:ring-studio-accent/5 focus:border-studio-accent/30 rounded-2xl font-medium transition-all shadow-sm"
                                    />
                                </div>

                                <div 
                                    className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-3"
                                    onScroll={(e) => {
                                        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                                        if (scrollHeight - scrollTop <= clientHeight + 400) {
                                            setVisibleCount(prev => Math.min(prev + 30, filteredAudio.length));
                                        }
                                    }}
                                >
                                    {filteredAudio.slice(0, visibleCount).map((item) => (
                                        <div 
                                            key={item.id}
                                            onClick={() => setSelectedItem(item)}
                                            className={cn(
                                                "flex items-center gap-6 p-4 rounded-2xl border transition-all cursor-pointer group/item",
                                                selectedItem?.id === item.id 
                                                    ? "bg-studio-accent/5 border-studio-accent/30 shadow-[0_4px_12px_rgba(0,122,255,0.05)]" 
                                                    : "bg-white border-black/5 hover:border-black/10 hover:bg-zinc-50 shadow-sm"
                                            )}
                                        >
                                            {/* Play Button */}
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); togglePlay(item); }}
                                                className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-xl active:scale-90",
                                                    playingId === item.id 
                                                        ? "bg-studio-accent text-white shadow-[0_4px_12px_rgba(0,122,255,0.4)]" 
                                                        : "bg-black/5 text-zinc-500 border border-black/5 group-hover/item:text-zinc-900 group-hover/item:border-studio-accent/30 font-black"
                                                )}
                                            >
                                                {playingId === item.id ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                                            </button>

                                            <div className="flex-1 min-w-0">
                                                <p className={cn("text-sm font-black uppercase tracking-tight italic transition-colors", selectedItem?.id === item.id ? "text-studio-accent" : "text-zinc-900 group-hover/item:text-studio-accent")}>
                                                    {item.label}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    <span className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.2em] px-2 py-0.5 rounded-md bg-black/5 border border-black/5">
                                                        {item.keywords[0]}
                                                    </span>
                                                    <div className="w-1 h-1 rounded-full bg-zinc-800" />
                                                    <span className="text-[10px] font-black text-studio-accent/40 uppercase tracking-widest italic">
                                                        {item.duration ? `${Math.floor(item.duration / 60)}:${(item.duration % 60).toString().padStart(2, '0')}` : 'STREAM'}
                                                    </span>
                                                </div>
                                            </div>

                                            {selectedItem?.id === item.id && (
                                                <div className="p-1 px-3 rounded-full bg-studio-accent/10 border border-studio-accent/20 shadow-[0_0_10px_rgba(70,130,255,0.1)]">
                                                    <CheckCircle className="w-4 h-4 text-studio-accent animate-in zoom-in" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : tab === 'random' ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8 animate-in fade-in zoom-in">
                                <div className="w-32 h-32 rounded-[2.5rem] bg-studio-accent/10 flex items-center justify-center text-studio-accent shadow-[0_0_50px_rgba(70,130,255,0.1)] border border-studio-accent/20 relative group">
                                    <Waves className="w-14 h-14 animate-pulse group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute inset-0 rounded-[2.5rem] border border-studio-accent/40 animate-ping opacity-10" />
                                </div>
                                <div className="space-y-3">
                                    <h4 className="text-3xl font-black uppercase tracking-[0.1em] text-zinc-900 italic">Sonic Roulette</h4>
                                    <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-[0.2em] max-w-[320px] leading-relaxed mx-auto opacity-70 italic">Neural engine selector processing optimal frequencies for your production.</p>
                                </div>
                                <Button 
                                    onClick={() => {
                                        const random = getRandomAudio();
                                        setSelectedItem(random);
                                    }}
                                    className="h-16 px-12 rounded-2xl bg-studio-accent hover:opacity-90 text-white font-black uppercase tracking-[0.3em] text-[10px] gap-4 shadow-[0_8px_24px_rgba(0,122,255,0.3)] transition-all active:scale-95"
                                >
                                    Engage AI Selection
                                </Button>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8 animate-in fade-in zoom-in">
                                <div className="w-32 h-32 rounded-[2.5rem] bg-black/5 flex items-center justify-center text-zinc-400 border border-black/5 shadow-inner group">
                                    {isUploading ? <Loader2 className="w-14 h-14 animate-spin text-studio-accent" /> : <Upload className="w-14 h-14 group-hover:translate-y-[-5px] transition-transform duration-500" />}
                                </div>
                                <div className="space-y-4 text-center">
                                    <h4 className="text-3xl font-black uppercase tracking-[0.1em] text-zinc-900 italic">Import Asset</h4>
                                    <p className="text-[10px] text-zinc-400 max-w-[320px] leading-relaxed mx-auto uppercase font-black tracking-[0.25em] opacity-80">Master-grade support for RAW WAV, High-Bitrate FLAC and Pro MP3 standards.</p>
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
                                    accept="audio/*" 
                                    onChange={handleFileUpload}
                                />
                            </div>
                        )}
                    </div>

                    <div className="w-96 p-10 flex flex-col bg-zinc-50 shrink-0 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-studio-accent/5 rounded-full blur-[100px] -mr-32 -mt-32 opacity-20" />

                        <div className="relative z-10 flex items-center gap-3 mb-10 shrink-0">
                            <Activity className="w-4 h-4 text-studio-accent" />
                            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.3em]">Master Monitor v4</span>
                        </div>
                        
                        <div className="flex-1 space-y-10 text-center relative z-10 overflow-y-auto custom-scrollbar pr-2 mb-6">
                            <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-studio-border bg-white shadow-inner flex flex-col items-center justify-center group/monitor">
                                <div className="absolute inset-0 bg-gradient-to-b from-studio-accent/[0.02] to-transparent" />
                                
                                {playingId ? (
                                    <div className="flex items-center gap-2 h-24 px-8 w-full justify-center">
                                        {[...Array(12)].map((_, i) => (
                                            <div 
                                                key={i} 
                                                className="w-2 bg-studio-accent rounded-full animate-pulse shadow-[0_0_15px_rgba(70,130,255,0.4)]" 
                                                style={{ 
                                                    height: `${30 + Math.random() * 70}%`, 
                                                    animationDuration: `${0.4 + Math.random() * 0.6}s`,
                                                    animationDelay: `${i * 0.05}s` 
                                                }} 
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-6 opacity-40 group-hover/monitor:opacity-60 transition-opacity duration-500">
                                        <Music className="w-16 h-16 text-zinc-900" />
                                        <div className="h-[2px] w-32 bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                                    </div>
                                )}
                                
                                <div className="absolute bottom-6 left-0 right-0 px-6 flex justify-between items-center">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-studio-accent/40 animate-pulse" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-studio-accent/40 animate-pulse delay-75" />
                                    </div>
                                    <span className="text-[8px] font-black text-studio-accent/40 uppercase tracking-[0.2em]">Live Spectral Data</span>
                                </div>
                            </div>
                            
                            {selectedItem ? (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="text-left bg-white p-6 rounded-[2rem] border border-studio-border shadow-md relative overflow-hidden group/info">
                                        <div className="absolute top-0 right-0 p-3">
                                            <Sparkles className="w-4 h-4 text-studio-accent/20 group-hover/info:text-studio-accent transition-colors" />
                                        </div>
                                        <h4 className="text-zinc-900 font-black uppercase text-xs leading-relaxed mb-4 tracking-[0.1em] italic">{selectedItem.label}</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedItem.keywords.map(kw => (
                                                <span key={kw} className="px-3 py-1 rounded-lg bg-studio-accent/5 border border-studio-accent/10 text-[9px] text-studio-accent font-black uppercase tracking-[0.15em] shadow-sm transition-all hover:bg-studio-accent/10">#{kw}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        onClick={() => togglePlay(selectedItem)}
                                        className="w-full h-14 text-[10px] font-black uppercase tracking-[0.3em] text-studio-accent border border-studio-accent/20 hover:bg-studio-accent/5 bg-black/[0.02] rounded-2xl shadow-sm transition-all"
                                    >
                                        {playingId === selectedItem.id ? 'Suspend Stream' : 'Initialize Preview'}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4 opacity-30 py-10">
                                    <Activity className="w-10 h-10 mx-auto text-zinc-500" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 leading-relaxed">System standby<br/>Awaiting asset selection</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-auto pt-4 border-t border-studio-border relative z-10 shrink-0">
                                <Button 
                                    className="w-full h-14 rounded-2xl bg-studio-accent hover:opacity-90 text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-[0_8px_24px_rgba(0,122,255,0.3)] transition-all active:scale-95 flex items-center justify-center gap-4" 
                                    disabled={!selectedItem}
                                    onClick={() => selectedItem && onConfirm(selectedItem.url, selectedItem.label)}
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Use this Audio
                                </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}