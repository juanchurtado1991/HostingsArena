import React from 'react';
import { useStudioStore } from '@/store/useStudioStore';
import { Clip } from '@/types/studio';
import { Button } from '@/components/ui/button';
import { Sliders, Sparkles, Trash, ChevronRight, Maximize2, Music } from 'lucide-react';
import { SyncEngine } from '@/lib/video-sync/SyncEngine';

interface ClipInspectorProps {
    selectedClip: Clip | null;
    onDelete: () => void;
    onReplaceAsset: () => void;
    onAttachSfx: () => void;
}

export function ClipInspector({ selectedClip, onDelete, onReplaceAsset, onAttachSfx }: ClipInspectorProps) {
    const updateClip = useStudioStore(s => s.updateClip);
    const pushToHistory = useStudioStore(s => s.pushToHistory);
    const fps = SyncEngine.FPS;

    return (
        <div className="lg:col-span-4 flex flex-col h-full ring-1 ring-black/5 rounded-3xl overflow-hidden bg-transparent backdrop-blur-md border border-black/5 min-h-0">
            <div className="glass-card flex flex-col h-full overflow-hidden border-none rounded-none p-5 pb-0">
                <div className="flex items-center justify-between mb-4 border-b border-studio-border pb-3">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-studio-accent/10 rounded-xl text-studio-accent border border-studio-accent/20"><Sliders className="w-5 h-5" /></div>
                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Clip Inspector</p>
                    </div>
                </div>

                {!selectedClip ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center relative p-8">
                        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-inner transition-transform duration-500"><Maximize2 className="w-8 h-8 text-studio-accent/40" /></div>
                        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">Neural Intelligence <br/><span className="text-[9px] font-medium opacity-40 lowercase italic mt-2 block text-zinc-600">select an asset to modify</span></p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-8 min-h-0 max-h-[calc(100vh-250px)]">
                        {/* Asset Preview */}
                        <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/40 shadow-inner flex-shrink-0 group/preview cursor-pointer" onClick={onReplaceAsset}>
                            {selectedClip.type === 'image' || selectedClip.type === 'video' ? (
                                selectedClip.type === 'video'
                                    ? <video src={selectedClip.src} className="w-full h-full object-cover opacity-90 group-hover/preview:opacity-100 transition-opacity" muted />
                                    : <img src={selectedClip.src} className="w-full h-full object-cover opacity-90 group-hover/preview:opacity-100 transition-opacity" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-black/5"><Sparkles className="w-10 h-10 text-studio-accent/40 animate-pulse" /><span className="text-[9px] font-black text-studio-accent/60 uppercase tracking-widest">{selectedClip.type} Stream</span></div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                            <div className="absolute inset-0 bg-studio-accent/10 opacity-0 group-hover/preview:opacity-100 flex flex-col items-center justify-center transition-all duration-300">
                                <div className="bg-white/90 backdrop-blur-md p-4 rounded-full border border-studio-accent/30 scale-90 group-hover/preview:scale-100 transition-transform shadow-xl"><Sparkles className="w-6 h-6 text-studio-accent" /></div>
                                <span className="mt-4 text-[10px] font-black uppercase text-white tracking-[0.3em] drop-shadow-md">Swap Asset</span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <Button variant="ghost" className="flex-1 h-14 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white hover:border-red-500 shadow-sm transition-all font-black uppercase tracking-widest text-[10px]" onClick={onDelete}><Trash className="w-4 h-4 mr-3" /> Purge Asset</Button>
                            </div>

                            <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/5 space-y-8 shadow-sm">
                                {/* Opacity */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Global Opacity</span>
                                        <span className="text-[10px] font-mono font-bold text-studio-accent bg-studio-accent/10 px-2.5 py-1 rounded-lg border border-studio-accent/20">{Math.round((selectedClip.opacity ?? 1) * 100)}%</span>
                                    </div>
                                    <div className="relative h-6 flex items-center px-1">
                                        <input type="range" min="0" max="1" step="0.01" value={selectedClip.opacity ?? 1} onChange={(e) => updateClip(selectedClip.id, { opacity: parseFloat(e.target.value) })} className="w-full h-1 bg-white/10 rounded-full appearance-none accent-studio-accent cursor-pointer" />
                                    </div>
                                </div>

                                {/* Overlay fields */}
                                {selectedClip.type === 'overlay' && (
                                    <div className="space-y-5 pt-5 border-t border-white/5 mt-5">
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest px-1">Primary Header</span>
                                            <input type="text" value={selectedClip.title || ''} onChange={(e) => updateClip(selectedClip.id, { title: e.target.value })} placeholder="Enter headline..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-[11px] font-bold text-white outline-none focus:border-studio-accent/50 transition-all placeholder:text-white/20" />
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest px-1">Sub-Headline</span>
                                            <textarea value={selectedClip.subtitle || ''} onChange={(e) => updateClip(selectedClip.id, { subtitle: e.target.value })} placeholder="Enter description..." rows={3} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-[11px] font-bold text-white outline-none focus:border-studio-accent/50 transition-all resize-none placeholder:text-white/20" />
                                        </div>
                                    </div>
                                )}

                                {/* Motion Effect */}
                                <div className="space-y-3">
                                    <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest px-1">Neural Transitions</span>
                                    <div className="relative group/select">
                                        <select value={selectedClip.motionEffect || 'none'} onChange={(e) => updateClip(selectedClip.id, { motionEffect: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-[11px] font-bold uppercase text-zinc-400 outline-none focus:ring-2 focus:ring-studio-accent/10 focus:border-studio-accent/50 transition-all appearance-none cursor-pointer">
                                            <option value="none">STATIC ENGINE</option>
                                            <option value="fade-in">SMOOTH DISSOLVE</option>
                                            <option value="zoom-in">HYPER ZOOM IN</option>
                                            <option value="zoom-out">SPACE ZOOM OUT</option>
                                            <option value="slide-up">KINETIC UP</option>
                                            <option value="slide-down">KINETIC DOWN</option>
                                            <option value="slide-left">SWIPE LEFT</option>
                                            <option value="slide-right">SWIPE RIGHT</option>
                                            <option value="glitch">NEURAL GLITCH</option>
                                            <option value="bounce">KINETIC BOUNCE</option>
                                            <option value="whip-pan">CINEMATIC WHIP</option>
                                        </select>
                                        <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none rotate-90" />
                                    </div>
                                </div>

                                {/* SFX Section */}
                                <div className="space-y-3">
                                    <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest px-1">Linked Audio (SFX)</span>
                                    <div className="flex gap-3">
                                        <Button variant="ghost" className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 bg-black/40 text-white/60 hover:text-white hover:border-studio-accent/50 transition-all truncate px-5" onClick={onAttachSfx}>
                                            <Music className="w-3.5 h-3.5 mr-2 text-studio-accent/60" />
                                            {selectedClip.sfxUrl ? (selectedClip.sfxUrl.split('/').pop()?.split('?')[0] || 'SFX Attached') : "ATTACH SFX"}
                                        </Button>
                                        {selectedClip.sfxUrl && (
                                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 shadow-lg" onClick={() => { updateClip(selectedClip.id, { sfxUrl: undefined, sfxDurationFrames: undefined, sfxVolume: undefined }); pushToHistory(); }}>
                                                <Trash className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                    {selectedClip.sfxUrl && (
                                        <div className="space-y-3 pt-3">
                                            <div className="flex justify-between items-center px-1"><span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">SFX Duration</span><span className="text-[10px] font-mono font-bold text-studio-accent bg-studio-accent/10 px-2.5 py-1 rounded-lg border border-studio-accent/20">{((selectedClip.sfxDurationFrames || 30) / fps).toFixed(1)}s</span></div>
                                            <div className="relative h-6 flex items-center px-1"><input type="range" min={Math.round(fps * 0.5)} max={Math.round(fps * 5)} step="1" value={selectedClip.sfxDurationFrames || 30} onChange={(e) => updateClip(selectedClip.id, { sfxDurationFrames: parseInt(e.target.value) })} className="w-full h-1 bg-white/10 rounded-full appearance-none accent-studio-accent cursor-pointer" /></div>
                                            
                                            <div className="flex justify-between items-center px-1 pt-1"><span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">SFX Volume</span><span className="text-[10px] font-mono font-bold text-studio-accent bg-studio-accent/10 px-2.5 py-1 rounded-lg border border-studio-accent/20">{Math.round((selectedClip.sfxVolume ?? 0.8) * 100)}%</span></div>
                                            <div className="relative h-6 flex items-center px-1"><input type="range" min={0} max={100} step="1" value={Math.round((selectedClip.sfxVolume ?? 0.8) * 100)} onChange={(e) => updateClip(selectedClip.id, { sfxVolume: parseInt(e.target.value) / 100 })} className="w-full h-1 bg-white/10 rounded-full appearance-none accent-studio-accent cursor-pointer" /></div>
                                            
                                            <div className="grid grid-cols-2 gap-4 pt-2">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center px-1"><span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Fade In</span><span className="text-[10px] font-mono font-bold text-white/60">{((selectedClip.sfxFadeInFrames ?? 0) / fps).toFixed(1)}s</span></div>
                                                    <div className="relative h-6 flex items-center px-1"><input type="range" min={0} max={selectedClip.sfxDurationFrames || 30} step="1" value={selectedClip.sfxFadeInFrames ?? 0} onChange={(e) => updateClip(selectedClip.id, { sfxFadeInFrames: parseInt(e.target.value) })} className="w-full h-1 bg-white/10 rounded-full appearance-none accent-studio-accent cursor-pointer" /></div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center px-1"><span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Fade Out</span><span className="text-[10px] font-mono font-bold text-white/60">{((selectedClip.sfxFadeOutFrames ?? 8) / fps).toFixed(1)}s</span></div>
                                                    <div className="relative h-6 flex items-center px-1"><input type="range" min={0} max={selectedClip.sfxDurationFrames || 30} step="1" value={selectedClip.sfxFadeOutFrames ?? 8} onChange={(e) => updateClip(selectedClip.id, { sfxFadeOutFrames: parseInt(e.target.value) })} className="w-full h-1 bg-white/10 rounded-full appearance-none accent-studio-accent cursor-pointer" /></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
