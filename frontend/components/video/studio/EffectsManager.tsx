"use client";

import React from 'react';
import { useVideoStudio } from '@/contexts/VideoStudioContext';
import { Sparkles, ArrowLeftRight, Move, Volume2, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EffectsManager() {
    const { scenes, updateScene, setStudioStep } = useVideoStudio();

    const transitions = ['none', 'crossfade', 'fade', 'slide-left', 'slide-right'];
    const motions = ['none', 'ken-burns', 'pan-left', 'pan-right', 'zoom-in', 'zoom-out'];

    return (
        <div className="h-full flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto overflow-hidden">
            {/* Header del Paso 2 */}
            <div className="flex-none flex items-center gap-5 p-6 glass-card bg-white/5 border-white/10 mt-4 mx-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                    <Wand2 className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Paso 2: Cinematic Effects & SFX</h2>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1 italic">Define el lenguaje visual del video mediante transiciones y movimientos de cámara.</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {scenes.map((scene, idx) => (
                        <div key={idx} className="glass-card bg-white/5 border-white/5 p-4 space-y-4 hover:border-studio-accent/20 transition-all group">
                            {/* Scene Preview Snapshot */}
                            <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/40">
                                {scene.assetUrl ? (
                                    scene.assetType === 'video' 
                                        ? <video src={scene.assetUrl} className="w-full h-full object-cover opacity-60" muted />
                                        : <img src={scene.assetUrl} className="w-full h-full object-cover opacity-60" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-700 font-black uppercase text-[10px] tracking-widest">No Asset</div>
                                )}
                                <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-black text-white/60">
                                    ESCENA {idx + 1}
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="space-y-4">
                                {/* Transition Selection */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-500 px-1">
                                        <ArrowLeftRight className="w-3 h-3" /> Transición
                                    </label>
                                    <div className="flex flex-wrap gap-1.5 p-1 bg-black/20 rounded-lg">
                                        {transitions.map(t => (
                                            <button 
                                                key={t}
                                                onClick={() => updateScene(idx, { transition: t as any })}
                                                className={cn(
                                                    "px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-tighter transition-all border border-transparent",
                                                    (scene.transition || 'none') === t 
                                                        ? "bg-studio-accent/20 text-studio-accent border-studio-accent/30" 
                                                        : "text-zinc-600 hover:text-zinc-400 hover:bg-white/5"
                                                )}
                                            >
                                                {t.replace('-', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Motion Selection */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-500 px-1">
                                        <Move className="w-3 h-3" /> Movimiento
                                    </label>
                                    <div className="flex flex-wrap gap-1.5 p-1 bg-black/20 rounded-lg">
                                        {motions.map(m => (
                                            <button 
                                                key={m}
                                                onClick={() => {
                                                    // Actualizamos el primer segmento si existe, o creamos la propiedad motion
                                                    const segments = [...(scene.mediaSegments || [])];
                                                    if (segments.length > 0) {
                                                        segments[0] = { ...segments[0], motionEffect: m as any };
                                                        updateScene(idx, { mediaSegments: segments });
                                                    }
                                                }}
                                                className={cn(
                                                    "px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-tighter transition-all border border-transparent",
                                                    (scene.mediaSegments?.[0]?.motionEffect || 'none') === m 
                                                        ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" 
                                                        : "text-zinc-600 hover:text-zinc-400 hover:bg-white/5"
                                                )}
                                            >
                                                {m.replace('-', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* SFX Indicator */}
                                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                                        <Volume2 className="w-3.5 h-3.5" /> SFX: {scene.sfxUrl ? "Activo" : "Mudo"}
                                    </div>
                                    <button className="text-[8px] font-black uppercase text-studio-accent hover:underline decoration-studio-accent underline-offset-4 tracking-[0.2em]">Cargar Sonido</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
