"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, Mic, Play, Pause, CheckCircle, PlusCircle, Volume2, Globe, Sparkles } from "lucide-react";

interface Voice {
    id: string;
    name: string;
    gender?: 'male' | 'female';
    category?: 'premade' | 'professional' | 'cloned' | 'generated' | 'other';
    accent?: string;
    descriptive?: string;
    preview_url?: string;
}

interface VoicePickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (voiceId: string) => void;
    selectedVoiceId: string;
    lang: string;
    onTriggerUpload: () => void;
    customVoiceUrl?: string;
}

export function VoicePicker({ 
    isOpen, 
    onClose, 
    onSelect, 
    selectedVoiceId, 
    lang, 
    onTriggerUpload,
    customVoiceUrl 
}: VoicePickerProps) {
    const [voices, setVoices] = useState<Voice[]>([]);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<'all' | 'professional' | 'premade' | 'cloned' | 'generated'>('all');
    const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);
    const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [localSelectedId, setLocalSelectedId] = useState<string>(selectedVoiceId);
    
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Sync local selection when prop changes (e.g. initial open)
    useEffect(() => {
        setLocalSelectedId(selectedVoiceId);
    }, [selectedVoiceId]);

    useEffect(() => {
        if (!isOpen) return;
        
        setIsLoading(true);
        fetch(`/api/admin/video/voice?lang=${lang}`)
            .then(r => r.json())
            .then(d => {
                if (d.voices) setVoices(d.voices);
            })
            .catch(err => console.error("Failed to fetch voices:", err))
            .finally(() => setIsLoading(false));
            
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [isOpen, lang]);

    const filteredVoices = useMemo(() => {
        let items = voices;
        if (categoryFilter !== 'all') {
            items = items.filter(v => v.category === categoryFilter);
        }
        if (search) {
            const q = search.toLowerCase();
            items = items.filter(v => 
                v.name.toLowerCase().includes(q) || 
                v.accent?.toLowerCase().includes(q) || 
                v.descriptive?.toLowerCase().includes(q)
            );
        }
        return items;
    }, [voices, search, categoryFilter]);

    const handlePreview = (voice: Voice) => {
        if (previewingVoiceId === voice.id) {
            audioRef.current?.pause();
            setPreviewingVoiceId(null);
            return;
        }

        if (audioRef.current) audioRef.current.pause();

        if (voice.id === 'custom' && customVoiceUrl) {
            const audio = new Audio(customVoiceUrl);
            audio.onended = () => setPreviewingVoiceId(null);
            audio.play().catch(() => setPreviewingVoiceId(null));
            audioRef.current = audio;
            setPreviewingVoiceId(voice.id);
            return;
        }

        if (voice.preview_url) {
            const audio = new Audio(voice.preview_url);
            audio.onended = () => setPreviewingVoiceId(null);
            audio.play().catch(() => setPreviewingVoiceId(null));
            audioRef.current = audio;
            setPreviewingVoiceId(voice.id);
        } else {
            setPreviewLoadingId(voice.id);
            const sampleText = lang === 'es' ? 'Hola, soy una de las voces para tu video.' : 'Hello, I am one of the voices for your video.';
            fetch('/api/admin/video/voice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: sampleText, voice: voice.id })
            })
            .then(res => res.json())
            .then(data => {
                if (data.url) {
                    const audio = new Audio(data.url);
                    audio.onended = () => setPreviewingVoiceId(null);
                    audio.play().catch(() => setPreviewingVoiceId(null));
                    audioRef.current = audio;
                    setPreviewingVoiceId(voice.id);
                }
            })
            .catch(() => {})
            .finally(() => setPreviewLoadingId(null));
        }
    };

    const selectedVoice = useMemo(() => 
        voices.find(v => v.id === localSelectedId) || (localSelectedId === 'custom' ? { id: 'custom', name: 'Master Clone', descriptive: 'High-fidelity voice synthesis', accent: 'Derived' } : null) as Voice | null
    , [voices, localSelectedId]);

    const handleConfirm = () => {
        if (localSelectedId) {
            onSelect(localSelectedId);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/5 backdrop-blur-2xl animate-in fade-in duration-300" 
                onClick={onClose} 
            />
            
            <div className="relative w-full max-w-5xl bg-studio-surface rounded-none border border-studio-border shadow-2xl overflow-hidden glass-card animate-in zoom-in-95 duration-300 h-[85vh] flex flex-col">
                {/* Header Area */}
                <div className="p-8 border-b border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-black/[0.01]">
                    <div className="flex items-center gap-5">
                        <div className="p-3.5 bg-studio-accent/20 rounded-2xl text-studio-accent border border-studio-accent/30 shadow-[0_0_20px_rgba(0,122,255,0.15)]">
                            <Mic className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Neural Narratives</h2>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1">Select voice character for your story</p>
                        </div>
                    </div>
                        <div className="flex p-1.5 bg-black/5 rounded-[1.25rem] border border-black/5 shadow-inner">
                            {(['all', 'professional', 'premade', 'cloned', 'generated'] as const).map(cat => (
                                <button 
                                    key={cat} 
                                    onClick={() => setCategoryFilter(cat)}
                                    className={cn(
                                        "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap tracking-widest", 
                                        categoryFilter === cat 
                                            ? "bg-studio-accent text-white shadow-[0_4px_12px_rgba(0,122,255,0.3)]" 
                                            : "text-zinc-500 hover:text-zinc-900 hover:bg-black/5"
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <button onClick={onClose} className="w-12 h-12 flex items-center justify-center hover:bg-black/5 rounded-2xl transition-all text-zinc-400 hover:text-studio-accent group">
                            <PlusCircle className="rotate-45 w-6 h-6 group-hover:text-studio-accent transition-colors" />
                        </button>
                    </div>

                <div className="flex-1 flex overflow-hidden bg-studio-bg/30">
                    
                    {/* Browser Area */}
                    <div className="flex-1 flex flex-col p-8 min-w-0 border-r border-studio-border">
                        <div className="relative mb-8 shrink-0">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <Input 
                                placeholder="Locate voice by name, engine origin or accent..." 
                                value={search} 
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-14 h-14 bg-white border-studio-border text-zinc-900 placeholder:text-zinc-300 focus:ring-4 focus:ring-studio-accent/5 focus:border-studio-accent/30 rounded-2xl font-medium transition-all shadow-sm"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-6 opacity-40">
                                    <Sparkles className="w-12 h-12 animate-pulse text-studio-accent" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-studio-accent/60 font-black">Synchronizing neural pathways...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Special: Custom Uploaded Voice */}
                                    <div
                                        onClick={() => setLocalSelectedId('custom')}
                                        className={cn(
                                            "flex items-center gap-6 p-4 rounded-2xl border transition-all cursor-pointer group/item",
                                            localSelectedId === 'custom' 
                                                ? "bg-studio-accent/5 border-studio-accent/50 shadow-[0_4px_12px_rgba(0,122,255,0.05)]" 
                                                : "bg-white border-black/5 hover:border-studio-accent/20 hover:bg-zinc-50"
                                        )}
                                    >
                                        <div className="relative group/btn">
                                            <div 
                                                onClick={(e) => { 
                                                    if (customVoiceUrl) {
                                                        e.stopPropagation(); 
                                                        handlePreview({ id: 'custom', name: 'Master Clone' }); 
                                                    } else {
                                                        e.stopPropagation();
                                                        onTriggerUpload();
                                                    }
                                                }}
                                                className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xl transition-all active:scale-90",
                                                previewingVoiceId === 'custom' 
                                                    ? "bg-studio-accent text-white shadow-[0_4px_12px_rgba(0,122,255,0.4)] animate-pulse" 
                                                    : "bg-black/5 text-zinc-400 border border-black/5 hover:text-zinc-900"
                                            )}>
                                                {customVoiceUrl ? (
                                                    previewingVoiceId === 'custom' ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />
                                                ) : (
                                                    <Globe className="w-6 h-6" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={cn("text-sm font-black uppercase tracking-tight italic", localSelectedId === 'custom' ? "text-studio-accent" : "text-zinc-900")}>Master Clone</p>
                                            <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest mt-1">
                                                {customVoiceUrl ? 'ENGINE LINKED' : 'UPLOAD DNA'}
                                            </p>
                                        </div>
                                        {localSelectedId === 'custom' && <CheckCircle className="w-5 h-5 text-studio-accent" />}
                                    </div>

                                    {filteredVoices.map((voice) => (
                                        <div
                                            key={voice.id}
                                            onClick={() => setLocalSelectedId(voice.id)}
                                            className={cn(
                                                "flex items-center gap-6 p-4 rounded-2xl border transition-all cursor-pointer group/item",
                                                localSelectedId === voice.id 
                                                    ? "bg-studio-accent/5 border-studio-accent/40 shadow-[0_4px_12px_rgba(0,122,255,0.05)]" 
                                                    : "bg-white border-black/5 hover:border-black/10 hover:bg-zinc-50 shadow-sm"
                                            )}
                                        >
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handlePreview(voice); }}
                                                className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all shadow-xl active:scale-90",
                                                    previewingVoiceId === voice.id 
                                                        ? "bg-studio-accent text-white shadow-[0_4px_12px_rgba(0,122,255,0.4)] animate-pulse" 
                                                        : "bg-black/5 text-zinc-500 border border-black/5 hover:text-zinc-900 hover:border-studio-accent/30"
                                                )}
                                                disabled={previewLoadingId === voice.id}
                                            >
                                                {previewLoadingId === voice.id ? (
                                                    <Sparkles className="w-5 h-5 animate-spin" />
                                                ) : previewingVoiceId === voice.id ? (
                                                    <Pause className="w-5 h-5 fill-current" />
                                                ) : (
                                                    <Play className="w-5 h-5 fill-current ml-1" />
                                                )}
                                            </button>
                                            
                                            <div className="flex-1 min-w-0">
                                                <p className={cn("text-sm font-black uppercase tracking-tight italic transition-colors truncate", localSelectedId === voice.id ? "text-studio-accent" : "text-zinc-900 group-hover/item:text-studio-accent")}>
                                                    {voice.name}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1.5 opacity-60">
                                                    <span className="text-[9px] font-black uppercase text-zinc-500">
                                                        {voice.accent || 'Neural'}
                                                    </span>
                                                    <div className="w-1 h-1 bg-zinc-200 rounded-full" />
                                                    <span className="text-[9px] font-black uppercase text-zinc-400">
                                                        {voice.gender?.charAt(0).toUpperCase()} ENGINE
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {localSelectedId === voice.id && (
                                                <CheckCircle className="w-5 h-5 text-studio-accent shrink-0" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Monitor */}
                    <div className="w-96 p-10 flex flex-col bg-zinc-50 shrink-0 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-studio-accent/5 rounded-full blur-[100px] -mr-32 -mt-32 opacity-20" />

                        <div className="relative z-10 flex items-center gap-3 mb-10 shrink-0">
                            <Sparkles className="w-4 h-4 text-studio-accent" />
                            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.3em]">Master Monitor v4</span>
                        </div>
                        
                        <div className="flex-1 space-y-10 text-center relative z-10 overflow-y-auto custom-scrollbar pr-2 mb-6">
                            {/* Waveform area */}
                            <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-studio-border bg-white shadow-inner flex flex-col items-center justify-center group/monitor">
                                <div className="absolute inset-0 bg-gradient-to-b from-studio-accent/[0.02] to-transparent" />
                                
                                {previewingVoiceId ? (
                                    <div className="flex items-center gap-1.5 h-16 w-full justify-center px-10">
                                        {[...Array(12)].map((_, i) => (
                                            <div 
                                                key={i} 
                                                className="w-1.5 bg-studio-accent rounded-full animate-pulse shadow-[0_0_15px_rgba(70,130,255,0.4)]" 
                                                style={{ 
                                                    height: `${40 + Math.random() * 60}%`, 
                                                    animationDuration: `${0.3 + Math.random() * 0.7}s`,
                                                    animationDelay: `${i * 0.05}s` 
                                                }} 
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-6 opacity-40">
                                        <Volume2 className="w-12 h-12 text-zinc-900" />
                                        <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                                    </div>
                                )}
                                
                                <div className="absolute bottom-6 left-0 right-0 px-6 flex justify-between items-center">
                                    <div className="flex gap-1">
                                        <div className="w-1 h-1 rounded-full bg-studio-accent/40 animate-pulse" />
                                        <div className="w-1 h-1 rounded-full bg-studio-accent/40 animate-pulse delay-75" />
                                    </div>
                                    <span className="text-[8px] font-black text-studio-accent/40 uppercase tracking-[0.2em]">Neural Signal</span>
                                </div>
                            </div>
                            
                            {selectedVoice ? (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="text-left bg-white p-6 rounded-[2rem] border border-studio-border shadow-md relative overflow-hidden group/info">
                                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-4 block italic">Neural Metadata</span>
                                        <h4 className="text-zinc-900 font-black uppercase text-sm leading-relaxed mb-4 tracking-[0.05em] italic">{selectedVoice.name}</h4>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-3 py-1 rounded-lg bg-studio-accent/5 border border-studio-accent/10 text-[9px] text-zinc-500 font-black uppercase tracking-widest">{selectedVoice.accent || 'Neural'}</span>
                                            <span className="px-3 py-1 rounded-lg bg-studio-accent/5 border border-studio-accent/10 text-[9px] text-zinc-500 font-black uppercase tracking-widest">{selectedVoice.gender === 'male' ? 'Male' : 'Female'}</span>
                                            {selectedVoice.descriptive && (
                                                <span className="px-3 py-1 rounded-lg bg-studio-accent/5 border border-studio-accent/10 text-[9px] text-studio-accent font-black uppercase tracking-widest italic">{selectedVoice.descriptive}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-10 opacity-30">
                                    <Mic className="w-10 h-10 mx-auto text-zinc-500 mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 leading-relaxed text-center">Neural Standby<br/>Awaiting Input Selection</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-auto pt-4 border-t border-studio-border relative z-10 shrink-0">
                            <Button 
                                className="w-full h-14 rounded-2xl bg-studio-accent hover:opacity-90 text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-[0_8px_24px_rgba(0,122,255,0.3)] transition-all active:scale-95 disabled:opacity-20 flex items-center justify-center gap-4 group/confirm" 
                                disabled={!localSelectedId}
                                onClick={handleConfirm}
                            >
                                <CheckCircle className="w-4 h-4" />
                                Use this Voice
                            </Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
}
