"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useVideoStudio } from '@/contexts/VideoStudioContext';
import { useVideoAgent } from '@/hooks/useVideoAgent';
import { AiDirectorPanel } from './phase1/AiDirectorPanel';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Globe, Settings2, ArrowRight, RotateCcw, Brain, Activity, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { parseScript } from './phase1/scriptParser';
import { SyncEngine } from '@/lib/video-sync/SyncEngine';
import { findBestMixedMediaBatch, type MediaItem, loadMediaData } from '@/components/video/mediaLibrary';

export function StudioSidebar() {
    const { 
        title, setTitle, newsFocus, setNewsFocus, scriptLang, setScriptLang,
        format, setFormat, targetDuration, setTargetDuration,
        currentPhase, setCurrentPhase,
        scenes, setScenes, layers, setLayers, setDurationInFrames, resetProject,
        prepareAssemblyData, isPreparingAssembly, studioStep, setStudioStep,
        isAssetPickerOpen, setIsAssetPickerOpen, activePickerTarget, setActivePickerTarget
    } = useVideoStudio();

    const agent = useVideoAgent();

    // --- Lógica de Sincronización Agente -> Editor NLE ---
    const [isSyncing, setIsSyncing] = useState(false);

    const fetchAssetsForScenes = async (parsedScenes: any[]) => {
        const usedUrls = new Set<string>();
        return await Promise.all(parsedScenes.map(async (s) => {
            const duration = s.duration || SyncEngine.estimateDuration(s.speech);
            const clipCount = Math.max(1, Math.ceil(duration / 5));
            let batch: MediaItem[] = [];
            try {
                const res = await fetch('/api/admin/video/assets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: s.pexelsQuery || s.visual, type: 'both', count: clipCount }) });
                if (res.ok) { const { results } = await res.json(); if (results?.length > 0) batch = results.filter((r: MediaItem) => !usedUrls.has(r.url)).slice(0, clipCount); }
            } catch { await loadMediaData(); batch = findBestMixedMediaBatch(s.visual, Math.ceil(clipCount/2), Math.floor(clipCount/2), usedUrls); }
            batch.forEach((m: MediaItem) => usedUrls.add(m.url));
            const segs = batch.map((media: MediaItem, midx: number) => ({ id: Math.random().toString(36).substr(2, 9), source: 'library' as const, type: media.type, url: media.url, durationPct: midx === batch.length - 1 ? 100 - (Math.floor(100 / batch.length) * (batch.length - 1)) : Math.floor(100 / batch.length), motionEffect: 'ken-burns' as const }));
            return { ...s, assetUrl: batch[0]?.url, assetType: batch[0]?.type || 'video', mediaSegments: segs.length > 0 ? segs : undefined };
        }));
    };

    const handleParseAndAdvance = useCallback(async (script: string) => {
        setIsSyncing(true);
        const parsed = parseScript(script, format);
        const scenesWithMedia = await fetchAssetsForScenes(parsed);
        setScenes(scenesWithMedia as any);
        setIsSyncing(false);
    }, [format, setScenes]);

    // Cuando el agente aprueba (HITL) y la fase avanza
    useEffect(() => {
        if (agent.status === 'idle' && agent.script && studioStep === 'scenes') {
            handleParseAndAdvance(agent.script);
        }
    }, [agent.status, agent.script, studioStep, handleParseAndAdvance]);

    // Auto-inicio de conversación del Director AI (Solo si el usuario no ha escrito nada y es el inicio real)
    // Eliminamos la autoejecución agresiva para evitar respuestas "fantasma" tras el reset.
    // El Agente esperará a que el Productor envíe su primer mensaje o elija una noticia.

    const [rssHeadlines, setRssHeadlines] = useState<any[]>([]);
    const [rssLoading, setRssLoading] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        setRssLoading(true);
        fetch('/api/admin/video/headlines')
            .then(res => res.json())
            .then(data => setRssHeadlines(data.headlines || []))
            .finally(() => setRssLoading(false));
    }, []);

    const handleAction = async () => {
        if (!newsFocus.trim()) return;

        const currentFocus = newsFocus;
        setNewsFocus(""); // LIMPIAR INPUT INMEDIATAMENTE tras capturar el comando

        // ELIMINADA LA INTERCEPCIÓN MANUAL: 
        // Delegamos 100% en el Agente para avanzar de fase o modificar el timeline.
        if (agent.threadId) {
            await agent.resumeAgent(currentFocus);
        } else {
            await agent.startAgent(currentFocus);
        }
    };

    const scrollRef = React.useRef<HTMLDivElement>(null);

    // Auto-scroll al final del chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [agent.messages, agent.statusMessage, agent.streamedText, agent.status]);

    const copyChatToClipboard = () => {
        let text = agent.messages
            .map(m => `${m.role === 'user' ? 'PRODUCTOR' : 'DIRECTOR AI'}: ${m.content}`)
            .join('\n\n');
        
        if (agent.streamedText) {
            text += `\n\nDIRECTOR AI (Borrador): ${agent.streamedText}`;
        }

        navigator.clipboard.writeText(text);
        alert("Chat copiado al portapapeles 📋");
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950/40 backdrop-blur-xl border-l border-white/5 shadow-[-20px_0_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
            {/* Sidebar Header: Identity */}
            <div className="flex-none p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between z-20">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-studio-accent/20 flex items-center justify-center text-studio-accent border border-studio-accent/20 shadow-[0_0_20px_rgba(0,122,255,0.2)]">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-white">AI Director</h2>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Proyecto: {title || 'Sin Título'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={copyChatToClipboard}
                        title="Copiar historial del chat"
                        disabled={agent.messages.length === 0}
                        className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-all disabled:opacity-30"
                    >
                        <Copy className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => {
                            if (confirm("¿Estás seguro de que quieres reiniciar el proyecto? Perderás todos los cambios.")) {
                                resetProject();
                            }
                        }}
                        title="Reiniciar Proyecto (Limpiar TODO)"
                        className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition-all">
                        <Settings2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Chat History Area (Expansive) */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 pb-40 relative z-10 scroll-smooth">
                {agent.messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-10 py-10">
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-20 h-20 rounded-[2.5rem] bg-studio-accent/20 border border-studio-accent/20 flex items-center justify-center shadow-[0_0_40px_rgba(0,122,255,0.2)] mx-auto"
                        >
                            <Brain className="w-10 h-10 text-studio-accent" />
                        </motion.div>
                        <div className="space-y-4 max-w-[200px] mx-auto">
                            <h3 className="text-sm font-black uppercase tracking-widest text-white">Director IA Listo</h3>
                            <p className="text-[10px] text-zinc-500 font-bold leading-relaxed">
                                {studioStep === 'scenes' && "¿Qué tipo de video vamos a crear hoy? Puedo ayudarte con el guion, idioma y formato."}
                                {studioStep === 'editor' && "Estamos en la mesa de edición. ¿Quieres ajustar la música, la voz o algún clip específico?"}
                                {studioStep === 'export' && "Todo listo para el render final. ¿Revisamos la resolución o el formato de salida?"}
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {agent.messages.map((msg, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={cn(
                                    "flex flex-col max-w-[85%] space-y-1.5",
                                    msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                                )}
                            >
                                <div className={cn(
                                    "px-4 py-3 rounded-2xl text-[12px] leading-relaxed shadow-xl",
                                    msg.role === 'user' 
                                        ? "bg-studio-accent text-white rounded-tr-none font-medium selection:bg-white/30" 
                                        : "bg-white/[0.04] border border-white/10 text-zinc-300 rounded-tl-none font-medium backdrop-blur-md"
                                )}>
                                    {/* Renderizado de Markdown Básico (Negritas y Saltos) */}
                                    {(() => {
                                        const cleanText = (msg.displayText || msg.content || "").replace(/```json\s*\{[\s\S]*?\}\s*```/g, '').trim();
                                        return cleanText.split('\n').map((line: string, lineIdx: number) => (
                                            <p key={lineIdx} className={cn(lineIdx > 0 && "mt-1.5")}>
                                                {line.split(/(\*\*.*?\*\*)/g).map((part: string, partIdx: number) => {
                                                    if (part.startsWith('**') && part.endsWith('**')) {
                                                        return <strong key={partIdx} className="text-white font-black">{part.slice(2, -2)}</strong>;
                                                    }
                                                    return <span key={partIdx}>{part}</span>;
                                                })}
                                            </p>
                                        ));
                                    })()}
                                </div>
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-widest px-1 opacity-60",
                                    msg.role === 'user' ? "text-studio-accent" : "text-zinc-600"
                                )}>
                                    {msg.role === 'user' ? 'Productor' : 'Director AI'}
                                </span>
                            </motion.div>
                        ))}

                        {/* Mostrar Logs Técnicos (Feedback Visual de Actividad) */}
                        {agent.agentLogs?.slice(-3).map((log: string, i: number) => (
                            <motion.div 
                                key={`log-${i}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 0.5, x: 0 }}
                                className="flex items-center gap-2 px-2 py-1 text-[10px] text-zinc-500 font-medium italic"
                            >
                                <div className="w-1 h-1 rounded-full bg-studio-accent animate-pulse" />
                                {log}
                            </motion.div>
                        ))}

                        {/* Ghost Message: Streaming Text */}
                        {agent.streamedText && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col max-w-[85%] space-y-1.5 mr-auto items-start"
                            >
                                <div className="px-4 py-3 rounded-2xl text-[12px] leading-relaxed shadow-xl bg-white/[0.04] border border-white/10 text-zinc-300 rounded-tl-none font-medium backdrop-blur-md">
                                    {agent.streamedText.replace(/```json\s*\{[\s\S]*?\}\s*```/g, '').trim()}
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 px-1 opacity-60">
                                    Director AI (Escribiendo...)
                                </span>
                            </motion.div>
                        )}
                    </>
                )}

                {/* ESTATUS DE ACCIÓN EN TIEMPOL REAL - SIEMPRE VISIBLE SI HAY ACTIVIDAD */}
                <AnimatePresence>
                    {(agent.statusMessage || agent.status === 'thinking') && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-3 px-6 py-3 bg-studio-accent/20 border border-studio-accent/40 rounded-full w-fit max-w-[85%] mx-auto shadow-[0_0_30px_rgba(0,122,255,0.3)] backdrop-blur-xl z-50 sticky bottom-4 transition-all"
                        >
                            <Activity className="w-4 h-4 text-studio-accent animate-pulse" />
                            <span className="text-[11px] font-black text-studio-accent uppercase tracking-widest">
                                {agent.statusMessage || "El Director está analizando tu petición..."}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Director Panels & Reports - Only if we have scenes to approve */}
                {agent.status === 'waiting_approval' && scenes.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                        <AiDirectorPanel agent={{
                            ...agent,
                            approveScript: async () => {
                                await agent.approveScript();
                                setStudioStep('editor');
                                prepareAssemblyData();
                            }
                        } as any} />
                    </div>
                )}

                {/* Context & Settings (Collapsible) */}
                {showSettings && (
                    <div className="space-y-6 pt-4 border-t border-white/5 animate-in slide-in-from-top-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Idioma</label>
                                <select value={scriptLang} onChange={(e) => setScriptLang(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[10px] font-bold text-white outline-none focus:border-studio-accent/40">
                                    <option value="es">Español</option>
                                    <option value="en">English</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Duración</label>
                                <select value={targetDuration} onChange={(e) => setTargetDuration(Number(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[10px] font-bold text-white outline-none focus:border-studio-accent/40">
                                    <option value={60}>1 Minuto</option>
                                    <option value={300}>5 Minutos</option>
                                    <option value={600}>10 Minutos</option>
                                    <option value={900}>15 Minutos</option>
                                    <option value={1200}>20 Minutos</option>
                                </select>
                            </div>
                        </div>

                        {/* Intelligence Feed removed for pure chat-based interaction */}
                    </div>
                )}
            </div>

            {/* Bottom Controls Panel (Sticky) */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent pt-10 z-30">
                <div className="glass-card bg-white/[0.03] border-white/10 p-2 shadow-2xl relative group overflow-hidden">
                    <div className="flex items-center gap-2">
                        <textarea 
                            rows={1}
                            className="flex-1 bg-transparent border-none px-4 py-3.5 text-xs font-bold text-white placeholder:text-zinc-600 outline-none transition-all resize-none max-h-32 custom-scrollbar"
                            placeholder="Instrucciones para el Director..."
                            value={newsFocus}
                            onChange={(e) => setNewsFocus(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAction();
                                }
                            }}
                        />
                        <button 
                            onClick={handleAction}
                            disabled={agent.status === 'thinking' || !newsFocus.trim()}
                            className="w-12 h-12 rounded-xl bg-studio-accent text-white flex items-center justify-center shadow-lg shadow-studio-accent/30 disabled:opacity-50 transition-all hover:scale-105 active:scale-95 shrink-0"
                        >
                            {agent.status === 'thinking' ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <ArrowRight className="w-5 h-5" />
                            )}
                        </button>
                    </div>

                    {/* Contextual suggestions removed for pure chat interaction */}
                </div>
            </div>

            {/* Selector de Assets (Overlay de la IA) */}
            {isAssetPickerOpen && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300">
                    <div className="bg-[#0c0c0e] border border-white/10 rounded-[2.5rem] w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border-studio-accent/20">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-studio-accent/20 rounded-2xl">
                                    <Brain className="w-6 h-6 text-studio-accent" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black uppercase tracking-widest">Director - Selección de Asset</h3>
                                    <p className="text-xs text-zinc-500 font-bold">Objetivo: <span className="text-studio-accent">{activePickerTarget || 'Mejorar Visualización'}</span></p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setIsAssetPickerOpen(false)} className="rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white transition-all">
                                <RotateCcw className="w-5 h-5" />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-12 flex flex-col items-center justify-center space-y-6">
                            <div className="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                                <Globe className="w-10 h-10 text-zinc-500 opacity-20" />
                            </div>
                            <div className="text-center max-w-md space-y-4">
                                <p className="text-sm font-bold text-zinc-400">He filtrado los mejores assets para este segmento.</p>
                                <p className="text-xs text-zinc-600 leading-relaxed italic">
                                    Aquí conectaríamos con la `MediaLibrary` existente para permitir la selección de videos de Pexels o imágenes generadas que el Agente sugiere para "{activePickerTarget}".
                                </p>
                            </div>
                        </div>
                        <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-white/[0.02]">
                            <Button variant="outline" size="sm" onClick={() => setIsAssetPickerOpen(false)} className="rounded-xl border-white/5 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest px-6 h-11">Cerrar</Button>
                            <Button className="bg-studio-accent hover:bg-studio-accent/80 text-white rounded-xl text-[10px] font-black uppercase tracking-widest px-8 shadow-xl shadow-studio-accent/20 h-11" onClick={() => setIsAssetPickerOpen(false)}>Confirmar Asset</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
