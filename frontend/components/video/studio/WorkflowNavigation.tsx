"use client";

import React from 'react';
import { useVideoStudio } from '@/contexts/VideoStudioContext';
import { Button } from '@/components/ui/button';
import { ChevronRight, Loader2, AlertCircle, Smartphone, Monitor, ArrowLeft, Film } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudioStore } from '@/store/useStudioStore';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const PHASES = [
    { id: 1, label: "Scripting & Ideation" },
    { id: 2, label: "Storyboard & Assets" },
    { id: 3, label: "Visual Flow & Sync" },
    { id: 4, label: "Render & Export" }
];

export function WorkflowNavigation() {
    const { 
        currentPhase, setCurrentPhase,
        isPreparingAssembly, syncEta, prepareAssemblyData,
        isGeneratingVideo, scenes, error, setError,
        scriptLang,
        bgMusicUrl, selectedVoice, customVoiceUrl,
        resetProject,
        layers, title, format, setFormat, durationInFrames
    } = useVideoStudio();

    const params = useParams();
    const lang = params?.lang as string || 'en';

    const setStoreLayers = useStudioStore(s => s.setLayers);
    const setStoreScenes = useStudioStore(s => s.setScenes);
    const setStoreTitle = useStudioStore(s => s.setTitle);
    const setStoreFormat = useStudioStore(s => s.setFormat);
    const setStoreDuration = useStudioStore(s => s.setDurationInFrames);
    const pushStoreHistory = useStudioStore(s => s.pushToHistory);

    const handleResetProject = () => {
        if (!confirm(scriptLang === 'es' 
            ? "¿Estás seguro de que quieres reiniciar el proyecto? Esto no se puede deshacer."
            : "Are you sure you want to reset the project? This cannot be undone.")) return;
        resetProject();
    };

    const handleProceed = async () => {
        if (currentPhase === 2) {
            const hasVoice = (selectedVoice !== 'custom' && selectedVoice) || (selectedVoice === 'custom' && customVoiceUrl);
            const hasMusic = !!bgMusicUrl;

            if (!hasVoice || !hasMusic) {
                setError(
                    !hasVoice && !hasMusic 
                        ? "Please select a Voice and Background Music before proceeding." 
                        : !hasVoice 
                            ? "Please select a Voice (or upload one) before proceeding."
                            : "Please select Background Music before proceeding."
                );
                return;
            }

            try {
                setError(null);
                await prepareAssemblyData();
                
                setStoreLayers(layers);
                setStoreScenes(scenes);
                setStoreTitle(title);
                setStoreFormat(format);
                setStoreDuration(durationInFrames);
                pushStoreHistory();
                
                setCurrentPhase(3);
            } catch (err) {
                console.error("Assembly preparation blocked due to error.");
            }
        } else {
            setCurrentPhase(Math.min(4, currentPhase + 1));
        }
    };


    return (
        <div className="w-full sticky top-0 z-[100] px-8 pt-4 pb-2 flex justify-center">
            <div className="flex items-center justify-between bg-studio-surface/80 backdrop-blur-[32px] rounded-full border border-studio-border px-6 h-12 shadow-[0_8px_32px_rgba(0,0,0,0.06)] ring-1 ring-black/5 w-full max-w-5xl">
                
                <div className="flex items-center gap-10">
                    <Link href={`/${lang}/dashboard`} className="flex items-center gap-3 text-zinc-400 hover:text-zinc-900 transition-all text-[9px] font-black uppercase tracking-[0.2em] group/back shrink-0">
                        <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center border border-black/5 group-hover/back:border-black/10 group-hover/back:bg-black/10 transition-all">
                            <ArrowLeft className="w-3.5 h-3.5" />
                        </div>
                        <span className="hidden lg:block whitespace-nowrap">Dashboard</span>
                    </Link>

                    <div className="h-6 w-px bg-studio-border hidden md:block" />

                    <div className="flex items-center gap-4">
                        <div className="p-1.5 bg-studio-accent/10 rounded-lg text-studio-accent border border-studio-accent/20">
                            <Film className="w-3.5 h-3.5" />
                        </div>
                        <h1 className="text-[10px] font-black tracking-[0.1em] uppercase text-zinc-900 hidden sm:block">Video Studio</h1>
                    </div>
                </div>

                <div className="flex items-center gap-10">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-studio-accent/10 px-3 py-1.5 rounded-full border border-studio-accent/20 shrink-0">
                            <span className="text-[8px] font-black text-studio-accent uppercase tracking-[0.25em]">
                                {currentPhase}/4
                            </span>
                        </div>
                        <h3 className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-900/90 hidden xl:block">
                            {PHASES[currentPhase - 1].label}
                        </h3>
                    </div>

                    <div className="hidden lg:flex items-center gap-1.5">
                        {PHASES.map((p) => (
                            <div 
                                key={p.id} 
                                className={cn(
                                    "w-6 h-1 rounded-full transition-all duration-500",
                                    p.id < currentPhase ? "bg-studio-accent/30" : 
                                    p.id === currentPhase ? "bg-studio-accent shadow-[0_4px_12px_rgba(0,122,255,0.3)] w-10" : 
                                    "bg-zinc-200"
                                )} 
                            />
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        className="h-8 px-4 rounded-full text-[8px] font-black uppercase tracking-widest text-red-400/80 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all hidden md:flex"
                        onClick={handleResetProject}
                        disabled={isGeneratingVideo || isPreparingAssembly}
                    >
                        {scriptLang === 'es' ? 'Reiniciar' : 'Reset'}
                    </Button>

                    <Button
                        variant="ghost"
                        className="h-8 px-4 rounded-full text-[8px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 hover:bg-black/5 border border-transparent transition-all"
                        onClick={() => setCurrentPhase(Math.max(2, currentPhase - 1))}
                        disabled={isGeneratingVideo || isPreparingAssembly || currentPhase <= 2}
                    >
                        Back
                    </Button>
                    <Button
                        className={cn(
                            "h-9 px-5 rounded-full text-[8px] font-black uppercase tracking-[0.15em] gap-2 transition-all active:scale-95 text-white",
                            currentPhase === 4 
                                ? "bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200" 
                                : "bg-studio-accent hover:opacity-90 shadow-[0_4px_16px_rgba(0,122,255,0.3)] hover:shadow-[0_6px_20px_rgba(0,122,255,0.4)]"
                        )}
                        onClick={handleProceed}
                        disabled={currentPhase === 4 || isGeneratingVideo || isPreparingAssembly || (currentPhase === 1 && scenes.length === 0)}
                    >
                        {isPreparingAssembly ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-3 animate-spin" />
                                SYNC ({syncEta}S)
                            </span>
                        ) : (
                            <>
                                {currentPhase === 3 ? 'Export' : 'Next'}
                                <ChevronRight className="w-3 h-3 stroke-[3px]" />
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {error && (
                <div className="px-6 py-4 bg-red-500/5 backdrop-blur-xl border border-red-500/20 rounded-[1.25rem] flex items-start gap-4 animate-in slide-in-from-top-2 duration-500">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-red-500 tracking-[0.2em]">Engine Alert</p>
                        <p className="text-[10px] text-red-400/90 font-bold leading-relaxed">{error}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
