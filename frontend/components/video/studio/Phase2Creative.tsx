import React, { useRef, useState, useEffect } from 'react';
import { useVideoStudio } from '@/contexts/VideoStudioContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { VoicePicker } from '@/components/video/VoicePicker';
import { AudioPicker } from '@/components/video/AudioPicker';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { 
    PlusCircle, Copy, Trash, Music, Mic, Play, Pause, 
    Type, Languages, Settings2, Info, CheckCircle, Sparkles,
    Volume2
} from 'lucide-react';
import { ALL_AUDIO } from '@/components/video/audioLibrary';
import { SyncEngine } from '@/lib/video-sync/SyncEngine';
import { findBestMixedMediaBatch, type MediaItem } from '@/components/video/mediaLibrary';

export function Phase2Creative() {
    const {
        scenes, setScenes, updateScene,
        scriptLang, format,
        customVoiceUrl, setCustomVoiceUrl, setSelectedVoice, selectedVoice,
        bgMusicUrl, setBgMusicUrl, bgMusicVolume, setBgMusicVolume,

        introSfxUrl, setIntroSfxUrl,
        outroSfxUrl, setOutroSfxUrl,
        newsCardSfxUrl, setNewsCardSfxUrl
    } = useVideoStudio();

    const [isPlayingBgMusic, setIsPlayingBgMusic] = useState(false);
    const bgMusicPreviewRef = useRef<HTMLAudioElement | null>(null);

    // Modal states
    const [isVoicePickerOpen, setIsVoicePickerOpen] = useState(false);
    const [isAudioPickerOpen, setIsAudioPickerOpen] = useState(false);
    const [activeSfxTarget, setActiveSfxTarget] = useState<'intro' | 'outro' | 'news' | 'bg' | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    
    const musicInputRef = useRef<HTMLInputElement>(null);
    const voiceInputRef = useRef<HTMLInputElement>(null);
    

    useEffect(() => {
        return () => {
            if (bgMusicPreviewRef.current) bgMusicPreviewRef.current.pause();
        };
    }, []);

    const toggleBgMusicPreview = () => {
        if (!bgMusicUrl) return;
        
        if (isPlayingBgMusic) {
            bgMusicPreviewRef.current?.pause();
            setIsPlayingBgMusic(false);
        } else {
            if (bgMusicPreviewRef.current) {
                bgMusicPreviewRef.current.pause();
            }
            const audio = new Audio(bgMusicUrl);
            audio.volume = bgMusicVolume;
            audio.loop = true;
            audio.play();
            bgMusicPreviewRef.current = audio;
            setIsPlayingBgMusic(true);
        }
    };

    const handleAudioConfirm = (url: string) => {
        if (activeSfxTarget === 'intro') setIntroSfxUrl(url);
        else if (activeSfxTarget === 'outro') setOutroSfxUrl(url);
        else if (activeSfxTarget === 'news') setNewsCardSfxUrl(url);
        else if (activeSfxTarget === 'bg') setBgMusicUrl(url);
        
        setIsAudioPickerOpen(false);
        setActiveSfxTarget(null);
    };

    const genSegId = () => Math.random().toString(36).substr(2, 9);

    const addExtraScene = (index: number) => {
        const visual = "Technology news visualization, cinematic style";
        const batch = findBestMixedMediaBatch(visual, 2, 2, new Set());
        
        const segs = batch.map((media: MediaItem) => ({
            id: genSegId(),
            source: 'library' as const,
            type: media.type,
            url: media.url,
            durationPct: Math.round(100 / batch.length),
            motionEffect: 'ken-burns' as const
        }));

        const newScenes = [...scenes];
        newScenes.splice(index + 1, 0, {
            speech: "Escribe la narración para este bloque aquí...",
            visual,
            transition: 'crossfade',
            duration: 5,
            mediaSegments: segs,
            assetUrl: batch[0]?.url,
            assetType: batch[0]?.type,
            titleCardEnabled: true
        });
        setScenes(newScenes);
    };

    const duplicateScene = (index: number) => {
        const source = scenes[index];
        const dup = { ...source, mediaSegments: source.mediaSegments?.map(s => ({ ...s, id: genSegId() })) };
        const newScenes = [...scenes];
        newScenes.splice(index + 1, 0, dup);
        setScenes(newScenes);
    };

    const removeScene = (index: number) => {
        if (scenes.length <= 1) return;
        const newScenes = [...scenes];
        newScenes.splice(index, 1);
        setScenes(newScenes);
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'music' | 'voice') => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/admin/video/upload", { method: "POST", body: formData });
            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();
            const uploadedUrl = data.url;

            if (type === 'music') {
                setBgMusicUrl(uploadedUrl);
            } else {
                setCustomVoiceUrl(uploadedUrl);
                setSelectedVoice("custom");
            }
        } catch (err: any) {
            logger.error("Upload Error:", err);
            alert("Error al subir archivo.");
        } finally {
            setIsUploading(false);
            if (event.target) event.target.value = "";
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 max-w-6xl mx-auto">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2 relative z-10">
                <div className="space-y-1">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-studio-accent/10 rounded-2xl text-studio-accent border border-studio-accent/20 shadow-[0_0_15px_rgba(0,122,255,0.1)]">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Creative Engine</h2>
                    </div>
                    <p className="text-[11px] text-zinc-500 font-medium mt-1 uppercase tracking-widest">Master Studio Controller</p>
                </div>
                
                <div className="flex items-center gap-4" />
            </div>

            {/* Global Selections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2">
                {/* Voice Selection Card */}
                <div 
                    className="p-8 glass-card border-studio-border relative group cursor-pointer overflow-hidden transition-all hover:bg-black/[0.01]"
                    onClick={() => setIsVoicePickerOpen(true)}
                >
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-studio-accent/10 rounded-2xl text-studio-accent border border-studio-accent/20">
                                <Mic className="w-5 h-5" />
                            </div>
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Neural Narrator</h3>
                        </div>
                        <Settings2 className="w-4 h-4 text-zinc-600 transition-colors" />
                    </div>

                    <div className="flex items-center gap-7">
                        <div className="w-20 h-20 rounded-2xl bg-zinc-100/80 border border-zinc-200/50 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform group-hover:border-studio-accent/10">
                            <Volume2 className="w-10 h-10 text-studio-accent/40 group-hover:text-studio-accent transition-colors" />
                        </div>
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                                <p className="text-2xl font-bold tracking-tight text-zinc-900 truncate max-w-[180px]">
                                    {selectedVoice === 'custom' ? 'Custom Voice' : (selectedVoice || 'Select Talent')}
                                </p>
                                {selectedVoice && <CheckCircle className="w-5 h-5 text-studio-accent" />}
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-2 uppercase tracking-wider bg-studio-surface px-3 py-1.5 rounded-full border border-studio-border transition-all">
                                    <Languages className="w-3 h-3 text-studio-accent" /> {scriptLang === 'es' ? 'Spanish' : 'English'}
                                </span>
                                <span className="text-[10px] font-bold text-studio-accent uppercase tracking-widest hover:text-studio-accent/80 transition-colors">
                                    Change 🎙
                                </span>
                            </div>
                        </div>
                    </div>


                    {/* Gradient Accent */}
                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-studio-accent/5 rounded-full blur-[80px] opacity-20 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>

                {/* Music Selection Card */}
                <div 
                    className="p-8 glass-card border-studio-border relative group cursor-pointer overflow-hidden transition-all hover:bg-black/[0.01]"
                    onClick={() => { setActiveSfxTarget('bg'); setIsAudioPickerOpen(true); }}
                >
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-studio-accent/10 rounded-2xl text-studio-accent border border-studio-accent/20">
                                <Music className="w-5 h-5" />
                            </div>
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Audio Scape</h3>
                        </div>
                        <div className="flex items-center gap-3 bg-studio-surface px-4 py-2 rounded-2xl border border-studio-border transition-all">
                            <input 
                                type="range" 
                                min="0" max="1" step="0.01" 
                                value={bgMusicVolume}
                                onClick={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    setBgMusicVolume(parseFloat(e.target.value));
                                }}
                                className="w-16 md:w-24 h-1 bg-zinc-200 rounded-full appearance-none accent-studio-accent cursor-pointer"
                            />
                            <span className="text-[10px] font-mono font-bold text-studio-accent w-8 text-right tracking-tighter">{Math.round(bgMusicVolume * 100)}%</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-7">
                        <button 
                            onClick={(e) => { e.stopPropagation(); toggleBgMusicPreview(); }}
                            className={cn(
                                "w-20 h-20 rounded-2xl flex items-center justify-center transition-all shadow-xl active:scale-95 border",
                                isPlayingBgMusic 
                                    ? "bg-studio-accent border-transparent text-white shadow-lg shadow-studio-accent/30" 
                                    : "bg-studio-surface border-studio-border text-zinc-500 hover:text-white"
                            )}
                        >
                            {isPlayingBgMusic ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                        </button>
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                                <p className="text-2xl font-bold tracking-tight text-zinc-900 truncate max-w-[180px]">
                                    {bgMusicUrl ? (ALL_AUDIO.find(a => a.url === bgMusicUrl)?.label || bgMusicUrl.split('/').pop()?.split('?')[0]) : "No Background Music"}
                                </p>
                                {bgMusicUrl && <CheckCircle className="w-5 h-5 text-studio-accent" />}
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-2 uppercase tracking-wider bg-studio-surface px-3 py-1.5 rounded-full border border-studio-border transition-all">
                                    <Settings2 className="w-3 h-3 text-studio-accent" /> MASTER EQ
                                </span>
                                <span className="text-[10px] font-bold text-studio-accent uppercase tracking-widest hover:text-studio-accent/80 transition-colors">
                                    Library 🎵
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Gradient Accent */}
                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-indigo-500/5 rounded-full blur-[80px] opacity-20 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>

                {/* SFX Selection Card (NEW) */}
                <div 
                    className="p-8 glass-card border-studio-border relative group overflow-hidden transition-all hover:bg-black/[0.01]"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-studio-accent/10 rounded-2xl text-studio-accent border border-studio-accent/20">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Audio FX Engine</h3>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[
                            { label: 'Intro SFX', url: introSfxUrl, setter: setIntroSfxUrl, target: 'intro' as const },
                            { label: 'News Card' , url: newsCardSfxUrl, setter: setNewsCardSfxUrl, target: 'news' as const },
                            { label: 'Outro SFX', url: outroSfxUrl, setter: setOutroSfxUrl, target: 'outro' as const }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between gap-4 p-3 bg-studio-surface rounded-2xl border border-studio-border hover:border-studio-accent/20 transition-all">
                                <div className="min-w-0 flex-1">
                                    <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-1">{item.label}</p>
                                    <p className="text-xs font-bold text-zinc-900 truncate">
                                        {item.url ? (ALL_AUDIO.find(a => a.url === item.url)?.label || 'Selected SFX') : 'NONE'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button 
                                        variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-studio-accent/10 text-studio-accent"
                                        onClick={() => { setActiveSfxTarget(item.target); setIsAudioPickerOpen(true); }}
                                    >
                                        <Music className="w-3.5 h-3.5" />
                                    </Button>
                                    {item.url && (
                                        <Button 
                                            variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-red-50 text-red-400"
                                            onClick={() => item.setter(undefined)}
                                        >
                                            <Trash className="w-3.5 h-3.5" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Gradient Accent */}
                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-amber-500/5 rounded-full blur-[80px] opacity-20 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
            </div>

            {/* Script Editor Section */}
            <div className="px-2 space-y-8">
                <div className="flex items-center justify-between border-b border-black/5 pb-8 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-studio-accent/10 rounded-2xl text-studio-accent border border-studio-accent/20 shadow-[0_0_15px_rgba(0,122,255,0.1)]">
                            <Type className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold tracking-tight text-zinc-900">Narrative Script</h3>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={() => addExtraScene(scenes.length - 1)}
                        className="h-12 rounded-full bg-zinc-100/80 border border-zinc-200/50 hover:border-studio-accent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50 font-bold tracking-tight text-xs uppercase px-8 transition-all shadow-sm"
                    >
                        <PlusCircle className="w-5 h-5 mr-3" /> New Sequence
                    </Button>
                </div>

                <div className="space-y-6">
                    {scenes.map((scene, idx) => (
                        <div key={idx} className="glass-card border-studio-border p-10 group hover:bg-black/[0.01] transition-all relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-studio-accent/0 via-studio-accent/0 to-studio-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            <div className="flex flex-col md:flex-row gap-8 relative z-10">
                                {/* Scene Header/Counter */}
                                <div className="flex flex-row md:flex-col items-center justify-between md:justify-start gap-6 md:w-24">
                                    <div className="w-14 h-14 rounded-full bg-studio-surface border border-studio-border flex items-center justify-center text-lg font-bold text-studio-accent shadow-xl ring-2 ring-studio-accent/10 transition-all">
                                        {idx + 1}
                                    </div>
                                    <div className="flex md:flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button 
                                            onClick={() => duplicateScene(idx)}
                                            className="p-3 bg-studio-surface hover:bg-studio-accent/10 rounded-full text-zinc-600 hover:text-studio-accent border border-studio-border transition-all shadow-md"
                                            title="Duplicate"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => removeScene(idx)}
                                            className="p-3 bg-studio-surface hover:bg-red-500/10 rounded-full text-zinc-600 hover:text-red-400 border border-studio-border transition-all shadow-md"
                                            title="Delete"
                                        >
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Script Editor */}
                                <div className="flex-1 space-y-5">
                                    <div className="flex items-center justify-between px-2">
                                        <span className="text-[11px] font-bold uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                                            <Mic className="w-3.5 h-3.5 text-studio-accent" /> Narrator
                                        </span>
                                        <span className="text-[10px] font-mono text-zinc-500 font-bold bg-studio-surface px-3 py-1 rounded-full border border-studio-border">
                                            {scene.speech.length}c · ~{SyncEngine.estimateDuration(scene.speech, 1.0).toFixed(1)}s
                                        </span>
                                    </div>
                                    <div className="relative group/textarea">
                                        <textarea
                                            value={scene.speech}
                                            onChange={(e) => updateScene(idx, { speech: e.target.value })}
                                            className="w-full bg-studio-surface border border-studio-border rounded-[1.5rem] p-8 text-lg leading-relaxed text-zinc-800 focus:ring-4 focus:ring-studio-accent/5 focus:border-studio-accent/30 outline-none transition-all min-h-[160px] font-medium placeholder:text-zinc-300 custom-scrollbar"
                                            placeholder="Write the narration for this sequence..."
                                        />
                                        <div className="absolute inset-0 rounded-[1.5rem] pointer-events-none border border-studio-accent/0 group-focus-within/textarea:border-studio-accent/5 transition-all" />
                                    </div>
                                    
                                    {/* Brief Visual Hint */}
                                    <div className="flex items-center gap-4 px-6 py-4 bg-studio-surface/30 rounded-2xl border border-studio-border focus-within:border-studio-accent/30 transition-all group/hint">
                                        <Info className="w-4 h-4 text-studio-accent/60 shrink-0 group-focus-within/hint:text-studio-accent transition-all" />
                                        <input 
                                            value={scene.visual}
                                            onChange={(e) => updateScene(idx, { visual: e.target.value })}
                                            placeholder="Visual Intent (Context for AI)..."
                                            className="bg-transparent border-none outline-none flex-1 text-[11px] font-bold uppercase tracking-widest text-zinc-500 placeholder:text-zinc-300 focus:text-zinc-900 transition-all"
                                        />
                                    </div>

                                    {/* News Title Card Extension */}
                                    <div className="flex flex-col gap-4 p-6 bg-studio-accent/5 rounded-3xl border border-studio-accent/10 relative overflow-hidden group/news">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-studio-accent/20 rounded-xl text-studio-accent">
                                                    <Type className="w-4 h-4" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Breaking News Overlay</span>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                const isEnabled = scene.titleCardEnabled !== false;
                                                    const newState = !isEnabled;
                                                    const updates: any = { titleCardEnabled: newState };
                                                    if (newState && !scene.headline) {
                                                        // Auto-generate headline from visual context or first sentence of speech
                                                        const context = scene.visual.split(',')[0] || scene.speech.split('.')[0];
                                                        updates.headline = context.trim().substring(0, 40);
                                                    }
                                                    updateScene(idx, updates);
                                                }}
                                                className={cn(
                                                    "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
                                                    (scene.titleCardEnabled !== false) 
                                                    ? "bg-studio-accent text-white shadow-[0_4px_12px_rgba(0,122,255,0.4)]" 
                                                : "bg-zinc-100/80 text-zinc-500 hover:text-zinc-900 border border-zinc-200/50 shadow-sm"
                                        )}
                                            >
                                                {(scene.titleCardEnabled !== false) ? 'Active' : 'Disabled'}
                                            </button>
                                        </div>

                                        {(scene.titleCardEnabled !== false) && (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <input 
                                                    value={scene.headline || ""}
                                                    onChange={(e) => updateScene(idx, { headline: e.target.value })}
                                                    placeholder="MAIN HEADLINE..."
                                                    className="w-full bg-zinc-100/80 border border-zinc-200/50 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-tight text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-studio-accent/30 transition-all shadow-inner"
                                                />
                                                <input 
                                                    value={scene.subHeadline || ""}
                                                    onChange={(e) => updateScene(idx, { subHeadline: e.target.value })}
                                                    placeholder="Sub-headline detail..."
                                                    className="w-full bg-zinc-100/50 border border-zinc-200/50 rounded-xl px-4 py-2 text-[10px] font-medium text-zinc-500 placeholder:text-zinc-400 outline-none focus:border-studio-accent/20 transition-all"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Decorative line */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-studio-accent/5 rounded-full blur-[60px] opacity-10 pointer-events-none" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Tip */}
            <div className="px-2 text-center mt-12">
                <div className="inline-flex items-center gap-4 px-10 py-5 bg-studio-bg border border-studio-border rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] text-studio-accent/80 shadow-2xl">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                    Neural Assembly Engine: Visuals and layers mapped in the Next Step.
                </div>
            </div>

            {/* Modals */}
            <VoicePicker
                isOpen={isVoicePickerOpen}
                onClose={() => setIsVoicePickerOpen(false)}
                onSelect={(vid) => { setSelectedVoice(vid); setIsVoicePickerOpen(false); }}
                selectedVoiceId={selectedVoice || ""}
                lang={scriptLang}
                customVoiceUrl={customVoiceUrl}
                onTriggerUpload={() => voiceInputRef.current?.click()}
            />

            <AudioPicker
                isOpen={isAudioPickerOpen}
                onClose={() => { setIsAudioPickerOpen(false); setActiveSfxTarget(null); }}
                onConfirm={handleAudioConfirm}
                title={activeSfxTarget === 'bg' ? "Librería de Música" : "Librería de SFX"}
                selectedUrl={
                    activeSfxTarget === 'intro' ? introSfxUrl :
                    activeSfxTarget === 'outro' ? outroSfxUrl :
                    activeSfxTarget === 'news' ? newsCardSfxUrl :
                    bgMusicUrl
                }
            />

            <input type="file" ref={musicInputRef} className="hidden" accept="audio/*" onChange={(e) => handleFileUpload(e, 'music')} />
            <input type="file" ref={voiceInputRef} className="hidden" accept="audio/*" onChange={(e) => handleFileUpload(e, 'voice')} />
        </div>
    );
}
