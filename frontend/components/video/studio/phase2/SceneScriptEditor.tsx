import React, { useState } from 'react';
import { useVideoStudio } from '@/contexts/VideoStudioContext';
import { Button } from '@/components/ui/button';
import { PlusCircle, Copy, Trash, Mic, Type, Info, Sparkles, RefreshCw, Image as ImageIcon, Video, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SyncEngine } from '@/lib/video-sync/SyncEngine';
import { MediaPicker } from '@/components/video/MediaPicker';
import { StudioPhaseHeader } from '../common/StudioPhaseHeader';

interface SceneScriptEditorProps {
    onAddScene: (index: number) => void;
    onDuplicateScene: (index: number) => void;
    onRemoveScene: (index: number) => void;
}

export function SceneScriptEditor({ onAddScene, onDuplicateScene, onRemoveScene }: SceneScriptEditorProps) {
    const { scenes, updateScene } = useVideoStudio();
    const [pickerOpen, setPickerOpen] = useState(false);
    const [activeSceneIdx, setActiveSceneIdx] = useState<number | null>(null);
    const [activeSegmentIdx, setActiveSegmentIdx] = useState<number | null>(null);

    const handleReplaceMedia = (sceneIdx: number, segmentIdx: number | null = null) => {
        setActiveSceneIdx(sceneIdx);
        setActiveSegmentIdx(segmentIdx);
        setPickerOpen(true);
    };

    return (
        <div className="px-2 space-y-12 pb-0">
            <StudioPhaseHeader 
                icon={Type}
                title="Visual Narrative Editor"
                subtitle="Refine your sequences before AI assembly"
                action={
                    <Button variant="ghost" onClick={() => onAddScene(scenes.length - 1)} className="h-12 rounded-full bg-zinc-100/80 border border-zinc-200/50 hover:border-studio-accent text-zinc-500 hover:text-studio-accent hover:bg-zinc-200/50 font-bold tracking-tight text-xs uppercase px-8 transition-all shadow-sm">
                        <PlusCircle className="w-5 h-5 mr-3" /> New Sequence
                    </Button>
                }
            />

            <div className="space-y-10">
                {scenes.map((scene, idx) => (
                    <div key={idx} className="glass-card border-studio-border p-8 group hover:bg-black/[0.01] transition-all relative overflow-hidden flex flex-col gap-8">
                        <div className="absolute inset-0 bg-gradient-to-br from-studio-accent/0 to-studio-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        
                        {/* Visual Sequence Rail */}
                        <div className="w-full space-y-4 relative z-10">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-studio-accent shadow-[0_0_8px_rgba(0,122,255,0.4)]" />
                                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-900">Sequence {idx + 1}</h4>
                                    </div>
                                    <div className="h-4 w-px bg-zinc-200" />
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{scene.mediaSegments?.length || 1} Clips — Visión Continua</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => onDuplicateScene(idx)} className="p-2 hover:bg-zinc-100 rounded-xl text-zinc-400 hover:text-studio-accent transition-all" title="Duplicate Sequence"><Copy className="w-4 h-4" /></button>
                                    <button onClick={() => onRemoveScene(idx)} className="p-2 hover:bg-red-50 rounded-xl text-zinc-400 hover:text-red-500 transition-all" title="Delete Sequence"><Trash className="w-4 h-4" /></button>
                                </div>
                            </div>
                            
                            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                                {scene.mediaSegments && scene.mediaSegments.length > 0 ? (
                                    scene.mediaSegments.map((mod, midx) => (
                                        <div key={midx} className="relative group/clip shrink-0 w-48 aspect-video rounded-2xl overflow-hidden bg-zinc-900 shadow-lg ring-1 ring-black/5 hover:ring-studio-accent/30 transition-all">
                                            {mod.type === 'video' ? (
                                                <video src={mod.url} className="w-full h-full object-cover" muted playsInline />
                                            ) : (
                                                <img src={mod.url} className="w-full h-full object-cover" alt="Segment" />
                                            )}
                                            <div className="absolute inset-0 bg-black/20 group-hover/clip:bg-black/40 transition-colors" />
                                            
                                            {/* Clip Label */}
                                            <div className="absolute top-3 left-3 px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[8px] font-black text-white uppercase tracking-widest border border-white/10 flex items-center gap-1.5 pointer-events-none">
                                                {mod.type === 'video' ? <Video className="w-2.5 h-2.5" /> : <ImageIcon className="w-2.5 h-2.5" />}
                                                Clip {midx + 1} — {((scene.duration || 5) / (scene.mediaSegments?.length || 1)).toFixed(1)}s
                                            </div>

                                            {/* Replacement Trigger */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/clip:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleReplaceMedia(idx, midx); }}
                                                    className="bg-white text-black px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform flex items-center gap-2"
                                                >
                                                    <Search className="w-3.5 h-3.5" /> REEMPLAZAR
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="relative group/clip shrink-0 w-full aspect-[21/9] rounded-2xl overflow-hidden bg-zinc-900 shadow-lg ring-1 ring-black/5">
                                        {scene.assetUrl ? (
                                            <>
                                                {scene.assetType === 'video' ? (
                                                    <video src={scene.assetUrl} className="w-full h-full object-cover" muted playsInline />
                                                ) : (
                                                    <img src={scene.assetUrl} className="w-full h-full object-cover" alt="Scene preview" />
                                                )}
                                                <div className="absolute inset-0 bg-black/20" />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/clip:opacity-100 transition-opacity">
                                                    <button onClick={() => handleReplaceMedia(idx, null)} className="bg-white text-black px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-transform flex items-center gap-3">
                                                        <Search className="w-4 h-4" /> ASIGNAR MEDIA
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-zinc-500">
                                                <ImageIcon className="w-8 h-8 opacity-20" />
                                                <button onClick={() => handleReplaceMedia(idx, null)} className="bg-studio-accent text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-transform flex items-center gap-3">
                                                    <Search className="w-4 h-4" /> VINCULAR MEDIA
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="flex-1 space-y-6 relative z-10">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[11px] font-bold uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                                    <Mic className="w-3.5 h-3.5 text-studio-accent" /> Narrator
                                </span>
                                <span className="text-[10px] font-mono text-zinc-400 font-bold bg-zinc-50 px-3 py-1 rounded-full border border-zinc-200/50">
                                    {scene.speech.length}c · ~{SyncEngine.estimateDuration(scene.speech, 1.0).toFixed(1)}s
                                </span>
                            </div>
                            
                            <textarea value={scene.speech} onChange={(e) => updateScene(idx, { speech: e.target.value })} className="w-full bg-white/50 border border-zinc-200/60 rounded-[1.5rem] p-6 text-base leading-relaxed text-zinc-800 focus:ring-4 focus:ring-studio-accent/5 focus:border-studio-accent/20 outline-none transition-all min-h-[140px] font-medium custom-scrollbar" />

                            <div className="flex flex-col lg:flex-row items-center gap-4">
                                <div className="flex-1 flex items-center gap-3 px-5 py-3.5 bg-zinc-50 rounded-2xl border border-zinc-200/50 focus-within:border-studio-accent/20 transition-all w-full">
                                    <Info className="w-4 h-4 text-studio-accent/60 shrink-0" />
                                    <input value={scene.visual} onChange={(e) => updateScene(idx, { visual: e.target.value })} placeholder="Visual Intent (AI Context)..." className="bg-transparent border-none outline-none flex-1 text-[11px] font-bold uppercase tracking-widest text-zinc-500 placeholder:text-zinc-300 focus:text-zinc-900 transition-all" />
                                </div>

                                <div className="flex items-center gap-2 p-1 bg-zinc-100 rounded-2xl border border-zinc-200/50 shrink-0">
                                    <button
                                        onClick={() => {
                                            const isEnabled = scene.titleCardEnabled !== false;
                                            updateScene(idx, { titleCardEnabled: !isEnabled, headline: !isEnabled && !scene.headline ? scene.visual.split(',')[0].substring(0, 40) : scene.headline });
                                        }}
                                        className={cn("px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all", (scene.titleCardEnabled !== false) ? "bg-white text-studio-accent shadow-sm border border-zinc-200/50" : "text-zinc-400")}
                                    >
                                        Overlay: {(scene.titleCardEnabled !== false) ? 'ON' : 'OFF'}
                                    </button>
                                </div>
                            </div>

                            {(scene.titleCardEnabled !== false) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1 duration-300">
                                    <input value={scene.headline || ""} onChange={(e) => updateScene(idx, { headline: e.target.value })} placeholder="MAIN HEADLINE..." className="bg-zinc-50/50 border border-zinc-200/50 rounded-xl px-5 py-3 text-xs font-black uppercase tracking-tight text-zinc-900 placeholder:text-zinc-300 outline-none focus:border-studio-accent/30 transition-all" />
                                    <input value={scene.subHeadline || ""} onChange={(e) => updateScene(idx, { subHeadline: e.target.value })} placeholder="Sub-headline..." className="bg-zinc-50/30 border border-zinc-200/50 rounded-xl px-5 py-3 text-[10px] font-medium text-zinc-500 placeholder:text-zinc-300 outline-none focus:border-studio-accent/20 transition-all" />
                                </div>
                            )}

                            {/* Cinematic Effects Section */}
                            <div className="pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                <div className="space-y-2 flex-1 w-full">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 block px-1">Visual Transition</label>
                                    <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-50 rounded-xl border border-zinc-200/50">
                                        {['none', 'crossfade', 'fade', 'slide-left', 'slide-right'].map(t => (
                                            <button 
                                                key={t}
                                                onClick={() => updateScene(idx, { transition: t as any })}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all border border-transparent",
                                                    (scene.transition || 'none') === t 
                                                        ? "bg-studio-accent text-white shadow-sm" 
                                                        : "text-zinc-400 hover:text-zinc-600 hover:bg-white"
                                                )}
                                            >
                                                {t.replace('-', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2 flex-1 w-full">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 block px-1">Camera Motion</label>
                                    <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-50 rounded-xl border border-zinc-200/50">
                                        {['none', 'ken-burns', 'pan-left', 'pan-right', 'zoom-in', 'zoom-out'].map(m => {
                                            const currentMotion = scene.mediaSegments?.[0]?.motionEffect || 'none';
                                            return (
                                                <button 
                                                    key={m}
                                                    onClick={() => {
                                                        const segments = [...(scene.mediaSegments || [])];
                                                        if (segments.length > 0) {
                                                            segments[0] = { ...segments[0], motionEffect: m as any };
                                                            updateScene(idx, { mediaSegments: segments });
                                                        }
                                                    }}
                                                    className={cn(
                                                        "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all border border-transparent",
                                                        currentMotion === m 
                                                            ? "bg-indigo-500 text-white shadow-sm" 
                                                            : "text-zinc-400 hover:text-zinc-600 hover:bg-white"
                                                    )}
                                                >
                                                    {m.replace('-', ' ')}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <MediaPicker 
                isOpen={pickerOpen} 
                onClose={() => setPickerOpen(false)}
                onConfirm={(url, type) => {
                    if (activeSceneIdx !== null) {
                        const scene = scenes[activeSceneIdx];
                        
                        if (activeSegmentIdx !== null && scene.mediaSegments) {
                            const newSegments = [...scene.mediaSegments];
                            newSegments[activeSegmentIdx] = { ...newSegments[activeSegmentIdx], url, type: type as any };
                            updateScene(activeSceneIdx, { mediaSegments: newSegments, assetUrl: url, assetType: type as any });
                        } else {
                            // Default behavior for main replacement
                            updateScene(activeSceneIdx, { assetUrl: url, assetType: type as any, mediaSegments: undefined });
                        }
                    }
                    setPickerOpen(false);
                    setActiveSceneIdx(null);
                    setActiveSegmentIdx(null);
                }}
            />
        </div>
    );
}

