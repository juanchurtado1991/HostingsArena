import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Zap, Type, Film } from 'lucide-react';

type TempoMode = 'stable' | 'standard' | 'viral';
type TextStyleMode = 'classic' | 'kinetic' | 'minimal';

const TEMPO_OPTIONS: { value: TempoMode; label: string; desc: string; icon: string }[] = [
    { value: 'stable',   label: 'Cinematic',  desc: 'Slow, professional pacing', icon: '🎬' },
    { value: 'standard', label: 'Standard',   desc: 'Balanced news rhythm',      icon: '📺' },
    { value: 'viral',    label: 'Viral',      desc: 'Fast cuts, high energy',    icon: '⚡' },
];

const TEXT_STYLE_OPTIONS: { value: TextStyleMode; label: string; desc: string }[] = [
    { value: 'classic',  label: 'Classic',  desc: 'Standard subtitles' },
    { value: 'kinetic',  label: 'Kinetic',  desc: 'Animated word pops' },
    { value: 'minimal',  label: 'Minimal',  desc: 'No text overlays' },
];

export function SceneDynamicsCard() {
    const [tempo, setTempo] = useState<TempoMode>('standard');
    const [textStyle, setTextStyle] = useState<TextStyleMode>('classic');

    return (
        <div className="p-8 glass-card border-studio-border relative group overflow-hidden transition-all hover:bg-black/[0.01]">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-studio-accent/10 rounded-2xl text-studio-accent border border-studio-accent/20">
                        <Zap className="w-5 h-5" />
                    </div>
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Scene Dynamics</h3>
                </div>
            </div>

            <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 px-1">
                    <Film className="w-3 h-3 text-studio-accent" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Pacing / Tempo</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {TEMPO_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setTempo(opt.value)}
                            className={cn(
                                "flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all text-center",
                                tempo === opt.value
                                    ? "bg-studio-accent text-white border-transparent shadow-[0_4px_16px_rgba(0,122,255,0.3)]"
                                    : "bg-studio-surface border-studio-border text-zinc-500 hover:border-studio-accent/30 hover:text-zinc-900"
                            )}
                        >
                            <span className="text-lg">{opt.icon}</span>
                            <span className="text-[10px] font-black uppercase tracking-wider">{opt.label}</span>
                            <span className={cn(
                                "text-[8px] font-medium leading-tight",
                                tempo === opt.value ? "text-white/70" : "text-zinc-400"
                            )}>{opt.desc}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <Type className="w-3 h-3 text-studio-accent" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Typography Style</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {TEXT_STYLE_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setTextStyle(opt.value)}
                            className={cn(
                                "flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all text-center",
                                textStyle === opt.value
                                    ? "bg-studio-accent text-white border-transparent shadow-[0_4px_16px_rgba(0,122,255,0.3)]"
                                    : "bg-studio-surface border-studio-border text-zinc-500 hover:border-studio-accent/30 hover:text-zinc-900"
                            )}
                        >
                            <span className="text-[10px] font-black uppercase tracking-wider">{opt.label}</span>
                            <span className={cn(
                                "text-[8px] font-medium leading-tight",
                                textStyle === opt.value ? "text-white/70" : "text-zinc-400"
                            )}>{opt.desc}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-violet-500/5 rounded-full blur-[80px] opacity-20 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
    );
}
