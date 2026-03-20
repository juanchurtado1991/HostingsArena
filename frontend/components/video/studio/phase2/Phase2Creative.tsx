import React, { useRef, useState, useEffect } from 'react';
import { useVideoStudio } from '@/contexts/VideoStudioContext';
import { Button } from '@/components/ui/button';
import { VoicePicker } from '@/components/video/VoicePicker';
import { AudioPicker } from '@/components/video/AudioPicker';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { Music, Mic, Play, Pause, Languages, Settings2, CheckCircle, Sparkles, Volume2, Trash } from 'lucide-react';
import { ALL_AUDIO } from '@/components/video/audioLibrary';
import { findBestMixedMediaBatch, type MediaItem } from '@/components/video/mediaLibrary';
import { SceneScriptEditor } from './SceneScriptEditor';

export function Phase2Creative() {
    const {
        scenes, setScenes, scriptLang,
        customVoiceUrl, setCustomVoiceUrl, setSelectedVoice, selectedVoice,
        bgMusicUrl, setBgMusicUrl, bgMusicVolume, setBgMusicVolume,
        introSfxUrl, setIntroSfxUrl, outroSfxUrl, setOutroSfxUrl, newsCardSfxUrl, setNewsCardSfxUrl
    } = useVideoStudio();

    const [isPlayingBgMusic, setIsPlayingBgMusic] = useState(false);
    const bgMusicPreviewRef = useRef<HTMLAudioElement | null>(null);
    const [isVoicePickerOpen, setIsVoicePickerOpen] = useState(false);
    const [isAudioPickerOpen, setIsAudioPickerOpen] = useState(false);
    const [activeSfxTarget, setActiveSfxTarget] = useState<'intro' | 'outro' | 'news' | 'bg' | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const musicInputRef = useRef<HTMLInputElement>(null);
    const voiceInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { return () => { if (bgMusicPreviewRef.current) bgMusicPreviewRef.current.pause(); }; }, []);

    const toggleBgMusicPreview = () => {
        if (!bgMusicUrl) return;
        if (isPlayingBgMusic) { bgMusicPreviewRef.current?.pause(); setIsPlayingBgMusic(false); }
        else {
            if (bgMusicPreviewRef.current) bgMusicPreviewRef.current.pause();
            const audio = new Audio(bgMusicUrl); audio.volume = bgMusicVolume; audio.loop = true; audio.play();
            bgMusicPreviewRef.current = audio; setIsPlayingBgMusic(true);
        }
    };

    const handleAudioConfirm = (url: string) => {
        if (activeSfxTarget === 'intro') setIntroSfxUrl(url);
        else if (activeSfxTarget === 'outro') setOutroSfxUrl(url);
        else if (activeSfxTarget === 'news') setNewsCardSfxUrl(url);
        else if (activeSfxTarget === 'bg') setBgMusicUrl(url);
        setIsAudioPickerOpen(false); setActiveSfxTarget(null);
    };

    const genSegId = () => Math.random().toString(36).substr(2, 9);

    const addExtraScene = (index: number) => {
        const visual = "Technology news visualization, cinematic style";
        const batch = findBestMixedMediaBatch(visual, 2, 2, new Set());
        const segs = batch.map((media: MediaItem) => ({ id: genSegId(), source: 'library' as const, type: media.type, url: media.url, durationPct: Math.round(100 / batch.length), motionEffect: 'ken-burns' as const }));
        const newScenes = [...scenes];
        newScenes.splice(index + 1, 0, { speech: "Escribe la narración para este bloque aquí...", visual, transition: 'crossfade', duration: 5, mediaSegments: segs, assetUrl: batch[0]?.url, assetType: batch[0]?.type, titleCardEnabled: true });
        setScenes(newScenes);
    };

    const duplicateScene = (index: number) => {
        const source = scenes[index]; const dup = { ...source, mediaSegments: source.mediaSegments?.map(s => ({ ...s, id: genSegId() })) };
        const newScenes = [...scenes]; newScenes.splice(index + 1, 0, dup); setScenes(newScenes);
    };

    const removeScene = (index: number) => { if (scenes.length <= 1) return; const newScenes = [...scenes]; newScenes.splice(index, 1); setScenes(newScenes); };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'music' | 'voice') => {
        const file = event.target.files?.[0]; if (!file) return;
        setIsUploading(true);
        const formData = new FormData(); formData.append("file", file);
        try {
            const res = await fetch("/api/admin/video/upload", { method: "POST", body: formData });
            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();
            if (type === 'music') setBgMusicUrl(data.url); else { setCustomVoiceUrl(data.url); setSelectedVoice("custom"); }
        } catch (err: any) { logger.error("Upload Error:", err); alert("Error al subir archivo."); }
        finally { setIsUploading(false); if (event.target) event.target.value = ""; }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2 relative z-10">
                <div className="space-y-1">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-studio-accent/10 rounded-2xl text-studio-accent border border-studio-accent/20 shadow-[0_0_15px_rgba(0,122,255,0.1)]"><Sparkles className="w-6 h-6" /></div>
                        <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Creative Engine</h2>
                    </div>
                    <p className="text-[11px] text-zinc-500 font-medium mt-1 uppercase tracking-widest">Master Studio Controller</p>
                </div>
                <div className="flex items-center gap-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2">
                {/* Neural Narrator Card */}
                <div className="p-8 glass-card border-studio-border relative group cursor-pointer overflow-hidden transition-all hover:bg-black/[0.01]" onClick={() => setIsVoicePickerOpen(true)}>
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4"><div className="p-3 bg-studio-accent/10 rounded-2xl text-studio-accent border border-studio-accent/20"><Mic className="w-5 h-5" /></div><h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Neural Narrator</h3></div>
                        <Settings2 className="w-4 h-4 text-zinc-600 transition-colors" />
                    </div>
                    <div className="flex items-center gap-7">
                        <div className="w-20 h-20 rounded-2xl bg-zinc-100/80 border border-zinc-200/50 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform group-hover:border-studio-accent/10"><Volume2 className="w-10 h-10 text-studio-accent/40 group-hover:text-studio-accent transition-colors" /></div>
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3"><p className="text-2xl font-bold tracking-tight text-zinc-900 truncate max-w-[180px]">{selectedVoice === 'custom' ? 'Custom Voice' : (selectedVoice || 'Select Talent')}</p>{selectedVoice && <CheckCircle className="w-5 h-5 text-studio-accent" />}</div>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-2 uppercase tracking-wider bg-studio-surface px-3 py-1.5 rounded-full border border-studio-border transition-all"><Languages className="w-3 h-3 text-studio-accent" /> {scriptLang === 'es' ? 'Spanish' : 'English'}</span>
                                <span className="text-[10px] font-bold text-studio-accent uppercase tracking-widest hover:text-studio-accent/80 transition-colors">Change 🎙</span>
                            </div>
                        </div>
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-studio-accent/5 rounded-full blur-[80px] opacity-20 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>

                {/* Audio Scape Card */}
                <div className="p-8 glass-card border-studio-border relative group cursor-pointer overflow-hidden transition-all hover:bg-black/[0.01]" onClick={() => { setActiveSfxTarget('bg'); setIsAudioPickerOpen(true); }}>
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4"><div className="p-3 bg-studio-accent/10 rounded-2xl text-studio-accent border border-studio-accent/20"><Music className="w-5 h-5" /></div><h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Audio Scape</h3></div>
                        <div className="flex items-center gap-3 bg-studio-surface px-4 py-2 rounded-2xl border border-studio-border transition-all">
                            <input type="range" min="0" max="1" step="0.01" value={bgMusicVolume} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} onChange={(e) => { e.stopPropagation(); setBgMusicVolume(parseFloat(e.target.value)); }} className="w-16 md:w-24 h-1 bg-zinc-200 rounded-full appearance-none accent-studio-accent cursor-pointer" />
                            <span className="text-[10px] font-mono font-bold text-studio-accent w-8 text-right tracking-tighter">{Math.round(bgMusicVolume * 100)}%</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-7">
                        <button onClick={(e) => { e.stopPropagation(); toggleBgMusicPreview(); }} className={cn("w-20 h-20 rounded-2xl flex items-center justify-center transition-all shadow-xl active:scale-95 border", isPlayingBgMusic ? "bg-studio-accent border-transparent text-white shadow-lg shadow-studio-accent/30" : "bg-studio-surface border-studio-border text-zinc-500 hover:text-white")}>{isPlayingBgMusic ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}</button>
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3"><p className="text-2xl font-bold tracking-tight text-zinc-900 truncate max-w-[180px]">{bgMusicUrl ? (ALL_AUDIO.find(a => a.url === bgMusicUrl)?.label || bgMusicUrl.split('/').pop()?.split('?')[0]) : "No Background Music"}</p>{bgMusicUrl && <CheckCircle className="w-5 h-5 text-studio-accent" />}</div>
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-2 uppercase tracking-wider bg-studio-surface px-3 py-1.5 rounded-full border border-studio-border transition-all"><Settings2 className="w-3 h-3 text-studio-accent" /> MASTER EQ</span>
                                <span className="text-[10px] font-bold text-studio-accent uppercase tracking-widest hover:text-studio-accent/80 transition-colors">Library 🎵</span>
                            </div>
                        </div>
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-indigo-500/5 rounded-full blur-[80px] opacity-20 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>

                {/* Audio FX Engine Card */}
                <div className="p-8 glass-card border-studio-border relative group overflow-hidden transition-all hover:bg-black/[0.01]">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4"><div className="p-3 bg-studio-accent/10 rounded-2xl text-studio-accent border border-studio-accent/20"><Sparkles className="w-5 h-5" /></div><h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Audio FX Engine</h3></div>
                    </div>
                    <div className="space-y-4">
                        {[
                            { label: 'Intro SFX', url: introSfxUrl, setter: setIntroSfxUrl, target: 'intro' as const },
                            { label: 'News Card', url: newsCardSfxUrl, setter: setNewsCardSfxUrl, target: 'news' as const },
                            { label: 'Outro SFX', url: outroSfxUrl, setter: setOutroSfxUrl, target: 'outro' as const }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between gap-4 p-3 bg-studio-surface rounded-2xl border border-studio-border hover:border-studio-accent/20 transition-all">
                                <div className="min-w-0 flex-1">
                                    <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-1">{item.label}</p>
                                    <p className="text-xs font-bold text-zinc-900 truncate">{item.url ? (ALL_AUDIO.find(a => a.url === item.url)?.label || 'Selected SFX') : 'NONE'}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-studio-accent/10 text-studio-accent" onClick={() => { setActiveSfxTarget(item.target); setIsAudioPickerOpen(true); }}><Music className="w-3.5 h-3.5" /></Button>
                                    {item.url && <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-red-50 text-red-400" onClick={() => item.setter(undefined)}><Trash className="w-3.5 h-3.5" /></Button>}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-amber-500/5 rounded-full blur-[80px] opacity-20 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
            </div>

            <SceneScriptEditor onAddScene={addExtraScene} onDuplicateScene={duplicateScene} onRemoveScene={removeScene} />

            <div className="px-2 text-center mt-12">
                <div className="inline-flex items-center gap-4 px-10 py-5 bg-studio-bg border border-studio-border rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] text-studio-accent/80 shadow-2xl">
                    <Sparkles className="w-5 h-5 animate-pulse" /> Neural Assembly Engine: Visuals and layers mapped in the Next Step.
                </div>
            </div>

            <VoicePicker isOpen={isVoicePickerOpen} onClose={() => setIsVoicePickerOpen(false)} onSelect={(vid) => { setSelectedVoice(vid); setIsVoicePickerOpen(false); }} selectedVoiceId={selectedVoice || ""} lang={scriptLang} customVoiceUrl={customVoiceUrl} onTriggerUpload={() => voiceInputRef.current?.click()} />
            <AudioPicker isOpen={isAudioPickerOpen} onClose={() => { setIsAudioPickerOpen(false); setActiveSfxTarget(null); }} onConfirm={handleAudioConfirm} title={activeSfxTarget === 'bg' ? "Librería de Música" : "Librería de SFX"} selectedUrl={activeSfxTarget === 'intro' ? introSfxUrl : activeSfxTarget === 'outro' ? outroSfxUrl : activeSfxTarget === 'news' ? newsCardSfxUrl : bgMusicUrl} />
            <input type="file" ref={musicInputRef} className="hidden" accept="audio/*" onChange={(e) => handleFileUpload(e, 'music')} />
            <input type="file" ref={voiceInputRef} className="hidden" accept="audio/*" onChange={(e) => handleFileUpload(e, 'voice')} />
        </div>
    );
}
