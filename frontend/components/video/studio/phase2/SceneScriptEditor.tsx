import React from 'react';
import { useVideoStudio } from '@/contexts/VideoStudioContext';
import { Button } from '@/components/ui/button';
import { PlusCircle, Copy, Trash, Mic, Type, Info, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SyncEngine } from '@/lib/video-sync/SyncEngine';
import { findBestMixedMediaBatch, type MediaItem } from '@/components/video/mediaLibrary';

interface SceneScriptEditorProps {
    onAddScene: (index: number) => void;
    onDuplicateScene: (index: number) => void;
    onRemoveScene: (index: number) => void;
}

export function SceneScriptEditor({ onAddScene, onDuplicateScene, onRemoveScene }: SceneScriptEditorProps) {
    const { scenes, updateScene } = useVideoStudio();

    return (
        <div className="px-2 space-y-8">
            <div className="flex items-center justify-between border-b border-black/5 pb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-studio-accent/10 rounded-2xl text-studio-accent border border-studio-accent/20 shadow-[0_0_15px_rgba(0,122,255,0.1)]">
                        <Type className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight text-zinc-900">Narrative Script</h3>
                </div>
                <Button variant="ghost" onClick={() => onAddScene(scenes.length - 1)} className="h-12 rounded-full bg-zinc-100/80 border border-zinc-200/50 hover:border-studio-accent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50 font-bold tracking-tight text-xs uppercase px-8 transition-all shadow-sm">
                    <PlusCircle className="w-5 h-5 mr-3" /> New Sequence
                </Button>
            </div>

            <div className="space-y-6">
                {scenes.map((scene, idx) => (
                    <div key={idx} className="glass-card border-studio-border p-10 group hover:bg-black/[0.01] transition-all relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-studio-accent/0 via-studio-accent/0 to-studio-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <div className="flex flex-col md:flex-row gap-8 relative z-10">
                            <div className="flex flex-row md:flex-col items-center justify-between md:justify-start gap-6 md:w-24">
                                <div className="w-14 h-14 rounded-full bg-studio-surface border border-studio-border flex items-center justify-center text-lg font-bold text-studio-accent shadow-xl ring-2 ring-studio-accent/10 transition-all">{idx + 1}</div>
                                <div className="flex md:flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => onDuplicateScene(idx)} className="p-3 bg-studio-surface hover:bg-studio-accent/10 rounded-full text-zinc-600 hover:text-studio-accent border border-studio-border transition-all shadow-md" title="Duplicate"><Copy className="w-4 h-4" /></button>
                                    <button onClick={() => onRemoveScene(idx)} className="p-3 bg-studio-surface hover:bg-red-500/10 rounded-full text-zinc-600 hover:text-red-400 border border-studio-border transition-all shadow-md" title="Delete"><Trash className="w-4 h-4" /></button>
                                </div>
                            </div>

                            <div className="flex-1 space-y-5">
                                <div className="flex items-center justify-between px-2">
                                    <span className="text-[11px] font-bold uppercase text-zinc-500 tracking-widest flex items-center gap-2"><Mic className="w-3.5 h-3.5 text-studio-accent" /> Narrator</span>
                                    <span className="text-[10px] font-mono text-zinc-500 font-bold bg-studio-surface px-3 py-1 rounded-full border border-studio-border">{scene.speech.length}c · ~{SyncEngine.estimateDuration(scene.speech, 1.0).toFixed(1)}s</span>
                                </div>
                                <div className="relative group/textarea">
                                    <textarea value={scene.speech} onChange={(e) => updateScene(idx, { speech: e.target.value })} className="w-full bg-studio-surface border border-studio-border rounded-[1.5rem] p-8 text-lg leading-relaxed text-zinc-800 focus:ring-4 focus:ring-studio-accent/5 focus:border-studio-accent/30 outline-none transition-all min-h-[160px] font-medium placeholder:text-zinc-300 custom-scrollbar" placeholder="Write the narration for this sequence..." />
                                    <div className="absolute inset-0 rounded-[1.5rem] pointer-events-none border border-studio-accent/0 group-focus-within/textarea:border-studio-accent/5 transition-all" />
                                </div>

                                <div className="flex items-center gap-4 px-6 py-4 bg-studio-surface/30 rounded-2xl border border-studio-border focus-within:border-studio-accent/30 transition-all group/hint">
                                    <Info className="w-4 h-4 text-studio-accent/60 shrink-0 group-focus-within/hint:text-studio-accent transition-all" />
                                    <input value={scene.visual} onChange={(e) => updateScene(idx, { visual: e.target.value })} placeholder="Visual Intent (Context for AI)..." className="bg-transparent border-none outline-none flex-1 text-[11px] font-bold uppercase tracking-widest text-zinc-500 placeholder:text-zinc-300 focus:text-zinc-900 transition-all" />
                                </div>

                                <div className="flex flex-col gap-4 p-6 bg-studio-accent/5 rounded-3xl border border-studio-accent/10 relative overflow-hidden group/news">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-studio-accent/20 rounded-xl text-studio-accent"><Type className="w-4 h-4" /></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Breaking News Overlay</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const isEnabled = scene.titleCardEnabled !== false;
                                                const newState = !isEnabled;
                                                const updates: any = { titleCardEnabled: newState };
                                                if (newState && !scene.headline) {
                                                    const context = scene.visual.split(',')[0] || scene.speech.split('.')[0];
                                                    updates.headline = context.trim().substring(0, 40);
                                                }
                                                updateScene(idx, updates);
                                            }}
                                            className={cn("px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all", (scene.titleCardEnabled !== false) ? "bg-studio-accent text-white shadow-[0_4px_12px_rgba(0,122,255,0.4)]" : "bg-zinc-100/80 text-zinc-500 hover:text-zinc-900 border border-zinc-200/50 shadow-sm")}
                                        >
                                            {(scene.titleCardEnabled !== false) ? 'Active' : 'Disabled'}
                                        </button>
                                    </div>
                                    {(scene.titleCardEnabled !== false) && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <input value={scene.headline || ""} onChange={(e) => updateScene(idx, { headline: e.target.value })} placeholder="MAIN HEADLINE..." className="w-full bg-zinc-100/80 border border-zinc-200/50 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-tight text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-studio-accent/30 transition-all shadow-inner" />
                                            <input value={scene.subHeadline || ""} onChange={(e) => updateScene(idx, { subHeadline: e.target.value })} placeholder="Sub-headline detail..." className="w-full bg-zinc-100/50 border border-zinc-200/50 rounded-xl px-4 py-2 text-[10px] font-medium text-zinc-500 placeholder:text-zinc-400 outline-none focus:border-studio-accent/20 transition-all" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-studio-accent/5 rounded-full blur-[60px] opacity-10 pointer-events-none" />
                    </div>
                ))}
            </div>
        </div>
    );
}
