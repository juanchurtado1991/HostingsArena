"use client";

import React from 'react';
import { useVideoStudio } from '@/contexts/VideoStudioContext';
import { Phase1Ideation } from '@/components/video/studio/Phase1Ideation';
import { Phase3Editor } from '@/components/video/studio/Phase3Editor';
import { Button } from '@/components/ui/button';
import { X, Sparkles, Layout, Wand2, Film, RotateCcw, Share2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import styles from './VideoStudio.module.css';
import { motion, AnimatePresence } from 'framer-motion';

import { StudioSidebar } from '@/components/video/studio/StudioSidebar';
import Link from 'next/link';

interface VideoStudioProps {
    dict: any;
    lang: string;
}

const STORAGE_KEY_WIDTH = 'ha_studio_sidebar_width';

export function VideoStudio({ dict, lang }: VideoStudioProps) {
    const { 
        studioStep, setStudioStep, resetProject, renderVideo, 
        isGeneratingVideo, renderProgress, renderStep, renderEta, videoUrl 
    } = useVideoStudio();
    const [sidebarWidth, setSidebarWidth] = React.useState(400);
    const [isResizing, setIsResizing] = React.useState(false);

    const handleReset = () => {
        if (confirm("¿Estás seguro de que quieres reiniciar todo el proyecto? Se perderán los cambios actuales.")) {
            resetProject();
        }
    };

    React.useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY_WIDTH);
        if (saved) setSidebarWidth(parseInt(saved, 10));
    }, []);

    const startResizing = React.useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    const stopResizing = React.useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = React.useCallback((e: MouseEvent) => {
        if (isResizing) {
            const newWidth = window.innerWidth - e.clientX;
            if (newWidth >= 300 && newWidth <= 600) {
                setSidebarWidth(newWidth);
                localStorage.setItem(STORAGE_KEY_WIDTH, newWidth.toString());
            }
        }
    }, [isResizing]);

    React.useEffect(() => {
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResizing);
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [resize, stopResizing]);

    const steps = [
        { id: 'scenes', label: 'Escenas', icon: Layout },
        { id: 'editor', label: 'Editor', icon: Film },
        { id: 'export', label: 'Exportar', icon: Download },
    ];

    return (
        <div className={cn("flex h-screen w-full bg-zinc-950 overflow-hidden select-none", isResizing && "cursor-col-resize", styles.glassEngine)}>
            {/* Main Studio Area */}
            <div className="flex-1 flex flex-col min-w-0 relative h-full overflow-hidden">
                {/* Global Controls Panel */}
                <div className="absolute top-6 left-6 z-50 flex items-center gap-2">
                    <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all shadow-2xl group" title="Regresar al Dashboard">
                        <X className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                    </Link>
                    <div className="h-4 w-[1px] bg-white/10 mx-2" />
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5">
                        <Sparkles className="w-4 h-4 text-studio-accent" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Studio v2</span>
                    </div>
                </div>

                {/* Step Tracker (Progress) */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 flex items-center gap-6 shadow-2xl">
                    {steps.map((s, i) => {
                        const Icon = s.icon;
                        const active = studioStep === s.id;
                        const completed = steps.findIndex(x => x.id === studioStep) > i;
                        return (
                            <div key={s.id} className="flex items-center gap-2 relative">
                                <div className={cn(
                                    "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500",
                                    active ? "bg-studio-accent text-white shadow-[0_0_15px_rgba(0,122,255,0.4)]" : 
                                    completed ? "bg-studio-accent/20 text-studio-accent" : "bg-white/5 text-zinc-600"
                                )}>
                                    <Icon className="w-3.5 h-3.5" />
                                </div>
                                <span className={cn("text-[8px] font-black uppercase tracking-widest", active ? "text-white" : "text-zinc-600")}>{s.label}</span>
                                {i < steps.length - 1 && <div className="ml-4 w-4 h-[1px] bg-white/10" />}
                            </div>
                        );
                    })}
                </div>

                <main className="flex-1 overflow-hidden p-4 pt-20">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={studioStep}
                            initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            className="h-full"
                        >
                            {studioStep === 'scenes' && <Phase1Ideation />}
                            {studioStep === 'editor' && <Phase3Editor isGlobalShell />}
                            {studioStep === 'export' && (
                                <div className="h-full flex flex-col items-center justify-center p-12 overflow-y-auto custom-scrollbar">
                                    <motion.div 
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="w-full max-w-2xl bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center gap-8 shadow-2xl relative overflow-hidden group"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-studio-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                        
                                        <div className="flex flex-col items-center gap-4 text-center">
                                            <div className="w-20 h-20 rounded-[2rem] bg-studio-accent/20 flex items-center justify-center text-studio-accent shadow-[0_0_40px_rgba(0,122,255,0.2)]">
                                                <Download className={cn("w-10 h-10", isGeneratingVideo && "animate-bounce")} />
                                            </div>
                                            <h2 className="text-2xl font-black uppercase tracking-[0.2em] text-white">Renderización Final</h2>
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest max-w-[280px]">Configura y genera la versión definitiva de tu producción cinematográfica.</p>
                                        </div>

                                        {isGeneratingVideo ? (
                                            <div className="w-full space-y-6">
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-studio-accent">{renderStep || 'Procesando...'}</span>
                                                        <span className="text-[10px] font-black text-white">{Math.round(renderProgress)}%</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${renderProgress}%` }}
                                                            className="h-full bg-studio-accent rounded-full shadow-[0_0_15px_rgba(0,122,255,0.5)]"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-center gap-4 text-center">
                                                    <div className="space-y-1">
                                                        <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Tiempo Restante</p>
                                                        <p className="text-xs font-bold text-white">{renderEta || '--:--'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : videoUrl ? (
                                            <div className="w-full space-y-6 flex flex-col items-center">
                                                <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                                                    <video src={videoUrl} controls className="w-full h-full object-contain" />
                                                </div>
                                                <div className="flex gap-4">
                                                    <Button onClick={() => window.open(videoUrl, '_blank')} className="bg-studio-accent hover:bg-studio-accent/80 text-white rounded-xl text-[10px] font-black uppercase tracking-widest px-8 h-12 shadow-xl shadow-studio-accent/20">
                                                        Descargar Video
                                                    </Button>
                                                    <Button variant="outline" onClick={() => setStudioStep('editor')} className="rounded-xl border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest px-8 h-12">
                                                        Volver a Editar
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-8 w-full">
                                                <button 
                                                    onClick={() => renderVideo()}
                                                    className="w-full py-5 bg-studio-accent text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-studio-accent/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                                                >
                                                    <Film className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                                    Iniciar Masterización
                                                </button>
                                                
                                                <div className="grid grid-cols-3 gap-8 w-full border-t border-white/5 pt-8">
                                                    <div className="text-center space-y-1">
                                                        <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Resolución</p>
                                                        <p className="text-[10px] font-bold text-white">Full HD (1080p)</p>
                                                    </div>
                                                    <div className="text-center space-y-1">
                                                        <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Framerate</p>
                                                        <p className="text-[10px] font-bold text-white">30 FPS</p>
                                                    </div>
                                                    <div className="text-center space-y-1">
                                                        <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Códice</p>
                                                        <p className="text-[10px] font-bold text-white">H.264 (MP4)</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* Resize Handle */}
            <div 
                onMouseDown={startResizing}
                className={cn(
                    "w-1 h-full cursor-col-resize hover:bg-studio-accent/40 transition-colors z-[100] relative",
                    isResizing && "bg-studio-accent/60"
                )}
            >
                <div className="absolute inset-y-0 -left-1 -right-1" /> {/* Larger hit area */}
            </div>

            {/* AI Agent Sidebar */}
            <div style={{ width: sidebarWidth }} className="flex-none">
                <StudioSidebar />
            </div>
        </div>
    );
}

export default VideoStudio;