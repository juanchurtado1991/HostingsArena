"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useVideoStudio } from '@/contexts/VideoStudioContext';
import { Button } from '@/components/ui/button';
import { VoicePicker } from '@/components/video/VoicePicker';
import { AudioPicker } from '@/components/video/AudioPicker';
import {
    BookmarkPlus, Trash2, Check, ChevronUp, ChevronDown,
    Mic, Music, Sparkles, Timer, Bookmark, Zap, Settings2,
    Play, Pause, Volume2, Upload, CheckCircle
} from 'lucide-react';
import { usePresets } from './usePresets';
import { ALL_AUDIO } from '@/components/video/audioLibrary';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';
import type { StudioPreset } from '@/contexts/video-studio/types';

function Stepper({ value, onChange, min = 1, max = 60 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
    return (
        <div className="flex items-center gap-1.5">
            <button onClick={(e) => { e.stopPropagation(); onChange(Math.max(min, value - 1)); }}
                className="w-6 h-6 rounded-lg flex items-center justify-center bg-zinc-100 border border-zinc-200 hover:bg-studio-accent/10 hover:border-studio-accent/30 text-zinc-500 hover:text-studio-accent transition-all active:scale-90">
                <ChevronDown className="w-3 h-3" />
            </button>
            <span className="w-8 text-center text-sm font-bold text-studio-accent tabular-nums">{value}s</span>
            <button onClick={(e) => { e.stopPropagation(); onChange(Math.min(max, value + 1)); }}
                className="w-6 h-6 rounded-lg flex items-center justify-center bg-zinc-100 border border-zinc-200 hover:bg-studio-accent/10 hover:border-studio-accent/30 text-zinc-500 hover:text-studio-accent transition-all active:scale-90">
                <ChevronUp className="w-3 h-3" />
            </button>
        </div>
    );
}

function ConfigRow({
    icon, label, value, checked, onClick, children
}: {
    icon: React.ReactNode; label: string; value: string;
    checked?: boolean; onClick?: () => void; children?: React.ReactNode;
}) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 py-2.5 border-b border-zinc-100 last:border-0",
                onClick && "cursor-pointer hover:bg-zinc-50 -mx-2 px-2 rounded-xl transition-colors group/row"
            )}
        >
            <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 bg-zinc-100 text-zinc-400 group-hover/row:bg-studio-accent/10 group-hover/row:text-studio-accent transition-colors">
                {icon}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 w-20 shrink-0">{label}</span>
            <span className="text-xs font-bold text-zinc-700 truncate flex-1">{value}</span>
            {checked && <CheckCircle className="w-3.5 h-3.5 text-studio-accent shrink-0" />}
            {onClick && !checked && <Settings2 className="w-3 h-3 text-zinc-300 group-hover/row:text-studio-accent shrink-0 transition-colors" />}
            {children}
        </div>
    );
}

function PresetRow({ preset, onLoad, onDelete, justLoaded }: {
    preset: StudioPreset; onLoad: () => void; onDelete: () => void; justLoaded: boolean;
}) {
    return (
        <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border border-zinc-100 hover:border-studio-accent/20 hover:shadow-sm transition-all group/row">
            <div className="w-8 h-8 rounded-xl bg-studio-accent/8 flex items-center justify-center shrink-0">
                <Bookmark className="w-3.5 h-3.5 text-studio-accent" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-zinc-800 truncate">{preset.name}</p>
                <p className="text-[9px] text-zinc-400 font-medium mt-0.5 truncate">
                    {preset.selectedVoice?.split('-').slice(0, 3).join('-')} · {preset.introDuration}s / {preset.newsCardDuration}s / {preset.outroDuration}s
                </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={onLoad}
                    className={cn(
                        "flex items-center gap-1 px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-wider border transition-all",
                        justLoaded
                            ? "bg-emerald-500 text-white border-transparent shadow-md shadow-emerald-200"
                            : "text-studio-accent border-studio-accent/25 hover:bg-studio-accent hover:text-white hover:border-transparent"
                    )}>
                    {justLoaded ? <Check className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                    {justLoaded ? 'Done' : 'Apply'}
                </button>
                <button onClick={onDelete}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-zinc-300 hover:text-red-400 hover:bg-red-50 transition-all opacity-0 group-hover/row:opacity-100">
                    <Trash2 className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}

export function ConfigCard() {
    const {
        selectedVoice, setSelectedVoice, scriptLang, voiceSpeed, setVoiceSpeed,
        bgMusicUrl, setBgMusicUrl, bgMusicVolume, setBgMusicVolume,
        introSfxUrl, setIntroSfxUrl, outroSfxUrl, setOutroSfxUrl, newsCardSfxUrl, setNewsCardSfxUrl,
        introDuration, setIntroDuration, newsCardDuration, setNewsCardDuration, outroDuration, setOutroDuration,
        customVoiceUrl, setCustomVoiceUrl,
    } = useVideoStudio();

    const { presets, savePreset, loadPreset, deletePreset } = usePresets({
        selectedVoice, voiceSpeed, bgMusicUrl, bgMusicVolume,
        introSfxUrl, outroSfxUrl, newsCardSfxUrl,
        introDuration, newsCardDuration, outroDuration,
        setSelectedVoice, setVoiceSpeed, setBgMusicUrl, setBgMusicVolume,
        setIntroSfxUrl, setOutroSfxUrl, setNewsCardSfxUrl,
        setIntroDuration, setNewsCardDuration, setOutroDuration,
    });

    const [isVoicePickerOpen, setIsVoicePickerOpen] = useState(false);
    const [isAudioPickerOpen, setIsAudioPickerOpen] = useState(false);
    const [activeSfxTarget, setActiveSfxTarget] = useState<'intro' | 'outro' | 'news' | 'bg' | null>(null);

    const [isPlayingBgMusic, setIsPlayingBgMusic] = useState(false);
    const bgMusicPreviewRef = useRef<HTMLAudioElement | null>(null);
    useEffect(() => () => { bgMusicPreviewRef.current?.pause(); }, []);

    const toggleBgMusicPreview = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!bgMusicUrl) return;
        if (isPlayingBgMusic) { bgMusicPreviewRef.current?.pause(); setIsPlayingBgMusic(false); }
        else {
            bgMusicPreviewRef.current?.pause();
            const audio = new Audio(bgMusicUrl); audio.volume = bgMusicVolume; audio.loop = true; audio.play();
            bgMusicPreviewRef.current = audio; setIsPlayingBgMusic(true);
        }
    };

    const [isUploading, setIsUploading] = useState(false);
    const voiceInputRef = useRef<HTMLInputElement>(null);
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        setIsUploading(true);
        const formData = new FormData(); formData.append('file', file);
        try {
            const res = await fetch('/api/admin/video/upload', { method: 'POST', body: formData });
            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            setCustomVoiceUrl(data.url); setSelectedVoice('custom');
        } catch (err: any) { logger.error('Upload Error:', err); alert('Error al subir archivo.'); }
        finally { setIsUploading(false); if (e.target) e.target.value = ''; }
    };

    const handleAudioConfirm = (url: string) => {
        if (activeSfxTarget === 'intro') setIntroSfxUrl(url);
        else if (activeSfxTarget === 'outro') setOutroSfxUrl(url);
        else if (activeSfxTarget === 'news') setNewsCardSfxUrl(url);
        else if (activeSfxTarget === 'bg') setBgMusicUrl(url);
        setIsAudioPickerOpen(false); setActiveSfxTarget(null);
    };

    const [newPresetName, setNewPresetName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [justLoaded, setJustLoaded] = useState<string | null>(null);

    const handleSave = () => {
        const name = newPresetName.trim() || `Preset ${presets.length + 1}`;
        savePreset(name); setNewPresetName(''); setIsSaving(false);
    };
    const handleLoad = (preset: StudioPreset) => {
        loadPreset(preset); setJustLoaded(preset.id);
        setTimeout(() => setJustLoaded(null), 2000);
    };

    const audioLabel = (url?: string) =>
        url ? (ALL_AUDIO.find(a => a.url === url)?.label || url.split('/').pop()?.split('?')[0] || 'Custom') : '— None —';

    const voiceShort = selectedVoice === 'custom'
        ? `Custom Upload`
        : selectedVoice ? selectedVoice.replace('Neural', '').replace(/-/g, ' ').trim() : 'Not selected';

    return (
        <>
            <div className="glass-card border-studio-border overflow-hidden">
                <div className="flex items-center justify-between px-8 py-6 border-b border-studio-border">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-studio-accent/10 rounded-2xl text-studio-accent border border-studio-accent/15">
                            <Bookmark className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Studio Preset Manager</h3>
                            <p className="text-[10px] text-zinc-400 mt-0.5">Click any setting to change it. Save a preset to capture everything at once.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsSaving(!isSaving)}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all",
                            isSaving
                                ? "bg-studio-accent text-white border-transparent shadow-lg shadow-studio-accent/25"
                                : "bg-studio-surface text-zinc-600 border-studio-border hover:border-studio-accent/40 hover:text-studio-accent"
                        )}>
                        <BookmarkPlus className="w-3.5 h-3.5" />
                        Save Preset
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-100">

                    <div className="px-8 py-6">
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                            <span className="flex-1 h-px bg-zinc-100" />
                            Current Configuration
                            <span className="flex-1 h-px bg-zinc-100" />
                        </p>

                        <ConfigRow
                            icon={<Mic className="w-3.5 h-3.5" />}
                            label="Voice"
                            value={voiceShort}
                            checked={!!selectedVoice && selectedVoice !== 'custom'}
                            onClick={() => setIsVoicePickerOpen(true)}
                        >
                            <span className="text-[9px] font-bold bg-zinc-100 text-zinc-400 px-2 py-0.5 rounded-full">
                                {scriptLang === 'es' ? 'ES' : 'EN'}
                            </span>
                        </ConfigRow>

                        <div className="flex items-center gap-3 py-2.5 border-b border-zinc-100">
                            <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 bg-zinc-100 text-zinc-400">
                                <Upload className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 w-20 shrink-0">Upload</span>
                            <span className="text-xs font-bold text-zinc-700 truncate flex-1">
                                {selectedVoice === 'custom' ? 'Custom file active' : 'Custom voice file'}
                            </span>
                            <button
                                onClick={() => voiceInputRef.current?.click()}
                                disabled={isUploading}
                                className="text-[9px] font-bold text-studio-accent uppercase tracking-wider hover:underline"
                            >
                                {isUploading ? 'Uploading…' : 'Browse'}
                            </button>
                        </div>

                        <ConfigRow
                            icon={<Music className="w-3.5 h-3.5" />}
                            label="BG Music"
                            value={audioLabel(bgMusicUrl)}
                            checked={!!bgMusicUrl}
                            onClick={() => { setActiveSfxTarget('bg'); setIsAudioPickerOpen(true); }}
                        />

                        <div className="flex items-center gap-3 py-2.5 border-b border-zinc-100">
                            <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 bg-zinc-100 text-zinc-400">
                                <Volume2 className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 w-20 shrink-0">Volume</span>
                            <input
                                type="range" min="0" max="1" step="0.01" value={bgMusicVolume}
                                onChange={e => setBgMusicVolume(parseFloat(e.target.value))}
                                className="flex-1 h-1 bg-zinc-200 rounded-full appearance-none accent-studio-accent cursor-pointer"
                            />
                            <span className="text-[10px] font-mono font-bold text-studio-accent w-8 text-right">{Math.round(bgMusicVolume * 100)}%</span>
                            {bgMusicUrl && (
                                <button onClick={toggleBgMusicPreview}
                                    className={cn("w-6 h-6 rounded-full flex items-center justify-center transition-all border", isPlayingBgMusic ? "bg-studio-accent border-transparent text-white" : "bg-zinc-100 border-zinc-200 text-zinc-400 hover:text-studio-accent")}>
                                    {isPlayingBgMusic ? <Pause className="w-2.5 h-2.5 fill-current" /> : <Play className="w-2.5 h-2.5 fill-current ml-px" />}
                                </button>
                            )}
                        </div>

                        {([
                            { label: 'Intro SFX', url: introSfxUrl, target: 'intro' as const },
                            { label: 'Card SFX', url: newsCardSfxUrl, target: 'news' as const },
                            { label: 'Outro SFX', url: outroSfxUrl, target: 'outro' as const },
                        ]).map(item => (
                            <ConfigRow key={item.target}
                                icon={<Sparkles className="w-3.5 h-3.5" />}
                                label={item.label}
                                value={audioLabel(item.url)}
                                checked={!!item.url}
                                onClick={() => { setActiveSfxTarget(item.target); setIsAudioPickerOpen(true); }}
                            />
                        ))}

                        <div className="mt-5 pt-4 border-t border-zinc-100">
                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-1.5">
                                <Timer className="w-3 h-3" /> Durations
                            </p>
                            <div className="space-y-2">
                                {[
                                    { label: 'Intro', value: introDuration, onChange: setIntroDuration, min: 2, max: 30 },
                                    { label: 'News Card', value: newsCardDuration, onChange: setNewsCardDuration, min: 1, max: 15 },
                                    { label: 'Outro', value: outroDuration, onChange: setOutroDuration, min: 5, max: 60 },
                                ].map(({ label, value, onChange, min, max }) => (
                                    <div key={label} className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-studio-accent/15 transition-all">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{label}</span>
                                        <Stepper value={value} onChange={onChange} min={min} max={max} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="px-8 py-6 flex flex-col">
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                            <span className="flex-1 h-px bg-zinc-100" />
                            Saved Presets
                            {presets.length > 0 && (
                                <span className="ml-1 px-2 py-0.5 bg-studio-accent/10 text-studio-accent rounded-full text-[9px] font-bold">{presets.length}</span>
                            )}
                            <span className="flex-1 h-px bg-zinc-100" />
                        </p>

                        {isSaving && (
                            <div className="flex items-center gap-2 mb-4 animate-in slide-in-from-top-2 duration-200">
                                <input
                                    autoFocus type="text" placeholder="Preset name…"
                                    value={newPresetName}
                                    onChange={e => setNewPresetName(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setIsSaving(false); }}
                                    className="flex-1 text-sm font-medium bg-white border border-studio-accent/30 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-studio-accent/20 text-zinc-900 placeholder:text-zinc-400"
                                />
                                <Button size="sm" onClick={handleSave} className="rounded-xl bg-studio-accent hover:bg-studio-accent/90 text-white text-[10px] font-bold uppercase tracking-wider h-9 px-4 shrink-0">
                                    Save
                                </Button>
                            </div>
                        )}

                        {presets.length === 0 && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-10 gap-3">
                                <div className="w-16 h-16 rounded-3xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                                    <Bookmark className="w-7 h-7 text-zinc-200" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-zinc-400">No presets yet</p>
                                    <p className="text-[11px] text-zinc-300 mt-1">Configure your voice, music, SFX and timings on the left, then save a preset.</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2 overflow-y-auto flex-1" style={{ maxHeight: 400 }}>
                            {presets.map(preset => (
                                <PresetRow
                                    key={preset.id}
                                    preset={preset}
                                    onLoad={() => handleLoad(preset)}
                                    onDelete={() => deletePreset(preset.id)}
                                    justLoaded={justLoaded === preset.id}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <VoicePicker
                isOpen={isVoicePickerOpen}
                onClose={() => setIsVoicePickerOpen(false)}
                onConfirm={(vid) => { setSelectedVoice(vid); setIsVoicePickerOpen(false); }}
                selectedWid={selectedVoice || ''}
            />
            <AudioPicker
                isOpen={isAudioPickerOpen}
                onClose={() => { setIsAudioPickerOpen(false); setActiveSfxTarget(null); }}
                onConfirm={handleAudioConfirm}
                title={activeSfxTarget === 'bg' ? 'Librería de Música' : 'Librería de SFX'}
                selectedUrl={
                    activeSfxTarget === 'intro' ? introSfxUrl :
                    activeSfxTarget === 'outro' ? outroSfxUrl :
                    activeSfxTarget === 'news' ? newsCardSfxUrl : bgMusicUrl
                }
            />
            <input type="file" ref={voiceInputRef} className="hidden" accept="audio/*" onChange={handleFileUpload} />
        </>
    );
}
