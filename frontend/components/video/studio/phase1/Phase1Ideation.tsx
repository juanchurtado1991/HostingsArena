"use client";

import React, { useState, useEffect } from 'react';
import { useVideoStudio } from '@/contexts/VideoStudioContext';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, AlertTriangle, RotateCcw, Smartphone, Monitor, ArrowRight } from 'lucide-react';
import { findBestMixedMediaBatch, type MediaItem, loadMediaData } from '@/components/video/mediaLibrary';
import { SyncEngine } from '@/lib/video-sync/SyncEngine';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { parseScript } from './scriptParser';
import type { AgentStatus } from "@/hooks/useVideoAgent";
import { useVideoAgent } from '@/hooks/useVideoAgent';
import { AiDirectorPanel } from './AiDirectorPanel';
import { SceneScriptEditor } from '../phase2/SceneScriptEditor';
import { ConfigCard } from '../phase2/ConfigCard';
import { AssetPreloader } from '../common/AssetPreloader';

export function Phase1Ideation() {
    const { 
        title, setTitle, format, setFormat, scriptLang, setScriptLang, newsFocus, setNewsFocus, 
        scenes, setScenes, setCurrentPhase, isGeneratingScript, setIsGeneratingScript,
        error, setError, targetDuration, setTargetDuration,
        setStudioStep, prepareAssemblyData, studioStep
    } = useVideoStudio();

    const agent = useVideoAgent();

    const [rssHeadlines, setRssHeadlines] = useState<{ title: string; source: string; link?: string; date?: string }[]>([]);
    const [rssLoading, setRssLoading] = useState(false);
    const [rssSources, setRssSources] = useState<string[]>([]);
    const [rssFailedFeeds, setRssFailedFeeds] = useState<string[]>([]);

    useEffect(() => {
        setRssLoading(true);
        fetch('/api/admin/video/headlines')
            .then(res => res.json())
            .then(data => { setRssHeadlines(data.headlines || []); setRssSources(data.sources || []); setRssFailedFeeds(data.failedFeeds || []); })
            .catch(() => { })
            .finally(() => setRssLoading(false));
    }, []);

    // AUTO-START AGENT (ZERO-TURN)
    useEffect(() => {
        if (agent.messages.length === 0 && agent.status === 'idle' && studioStep === 'scenes') {
            console.log("[Phase1Ideation] Triggering Zero-Turn Silent Agent Start...");
            agent.startAgent("hola", true);
        }
    }, [agent.messages.length, agent.status, studioStep]);

    const decodeHtml = (html: string): string => {
        try { const txt = document.createElement('textarea'); txt.innerHTML = html; return txt.value; } catch { return html; }
    };

    const [isEnriching, setIsEnriching] = useState(false);
    
    const fetchAssetsForScenes = async (parsedScenes: any[]) => {
        setIsEnriching(true);
        const usedUrls = new Set<string>();
        try {
            return await Promise.all(parsedScenes.map(async (s) => {
                const duration = s.duration || SyncEngine.estimateDuration(s.speech);
                const clipCount = Math.max(1, Math.ceil(duration / 5));
                let batch: MediaItem[] = [];
                
                try {
                    const res = await fetch('/api/admin/video/assets', { 
                        method: 'POST', 
                        headers: { 'Content-Type': 'application/json' }, 
                        body: JSON.stringify({ query: s.pexelsQuery || s.visual, type: 'both', count: clipCount }) 
                    });
                    if (res.ok) { 
                        const { results } = await res.json(); 
                        if (results?.length > 0) batch = results.filter((r: MediaItem) => !usedUrls.has(r.url)).slice(0, clipCount); 
                    }
                } catch { 
                    await loadMediaData(); 
                    batch = findBestMixedMediaBatch(s.visual, Math.ceil(clipCount/2), Math.floor(clipCount/2), usedUrls); 
                }
                batch.forEach((m: MediaItem) => usedUrls.add(m.url));
                const segs = batch.map((media: MediaItem, midx: number) => ({ 
                    id: Math.random().toString(36).substr(2, 9), 
                    source: 'library' as const, 
                    type: media.type, 
                    url: media.url, 
                    durationPct: midx === batch.length - 1 
                        ? 100 - (Math.floor(100 / batch.length) * (batch.length - 1)) 
                        : Math.floor(100 / batch.length), 
                    motionEffect: 'ken-burns' as const 
                }));
                return { 
                    ...s,
                    headline: s.mainHeadline || s.headline, // MAPEADO CORRECTO PARA LA UI
                    assetUrl: batch[0]?.url, 
                    assetType: batch[0]?.type || 'video', 
                    mediaSegments: segs.length > 0 ? segs : undefined, 
                    voiceUrl: undefined, 
                    titleCardEnabled: true 
                };
            }));
        } finally {
            setIsEnriching(false);
        }
    };

    // Cuando el agente termina de generar, parseamos el guion para mostrar las tarjetas inmediatamente
    useEffect(() => {
        if (agent.status === 'waiting_approval' && agent.script) {
            let parsed;
            try {
                const trimmed = agent.script.trim();
                if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                    const data = JSON.parse(trimmed);
                    parsed = data.scenes || data;
                } else {
                    parsed = parseScript(agent.script, format);
                }
                // Iniciamos la búsqueda de assets en segundo plano
                fetchAssetsForScenes(parsed).then(scenesWithMedia => {
                    setScenes(scenesWithMedia as any);
                });
            } catch (e) {
                console.error("Agent script parse failed:", e);
            }
        }
    }, [agent.status, agent.script, format, setScenes]);


    // Inicia el agente en lugar del flujo estático
    const handleGenerateWithAgent = async () => {
        await agent.startAgent(newsFocus);
    };

    const handleParseAndAdvance = async (rawScript: string) => {
        setIsGeneratingScript(true);
        setError(null);
        try {
            let parsed;
            const trimmed = rawScript.trim();
            if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                const data = JSON.parse(trimmed);
                parsed = data.scenes || data;
            } else {
                parsed = parseScript(rawScript, format);
            }
            
            const scenesWithMedia = await fetchAssetsForScenes(parsed);
            setScenes(scenesWithMedia as any);
            // Ya no avanzamos automáticamente. El usuario debe confirmar.
        } catch (err: any) { 
            setError(err.message || 'Could not generate content.'); 
        } finally { 
            setIsGeneratingScript(false); 
        }
    };

    // ELIMINADA LA AUTO-APROBACIÓN (HITL real)
    
    const handleConfirmScenes = async () => {
        setIsGeneratingScript(true);
        try {
            setStudioStep('editor');
            await prepareAssemblyData();
            agent.approveScript(); // Notifica al Agente que avanzamos
        } catch (err: any) {
            setError(err.message || "Error al ensamblar el video");
        } finally {
            setIsGeneratingScript(false);
        }
    };

    const handleGenerateScript = async () => {
        setIsGeneratingScript(true);
        setError(null);
        try {
            const response = await fetch("/api/admin/video/script", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newsContext: newsFocus, format, lang: scriptLang, targetDuration })
            });
            const data = await response.json();
            if (!response.ok) { setError(data.details || data.error || "Failed to generate script"); return; }
            if (data.script) {
                await handleParseAndAdvance(data.script);
            }
        } catch (err: any) { setError(err.message || "Could not generate content."); }
        finally { setIsGeneratingScript(false); }
    };

    const removeScene = (index: number) => {
        if (scenes.length <= 1) return;
        const newScenes = [...scenes]; newScenes.splice(index, 1); setScenes(newScenes);
    };

    const duplicateScene = (index: number) => {
        const source = scenes[index];
        const dup = { ...source, mediaSegments: source.mediaSegments?.map((s: any) => ({ ...s, id: Math.random().toString(36).substr(2, 9) })) };
        const newScenes = [...scenes]; newScenes.splice(index + 1, 0, dup); setScenes(newScenes);
    };

    const addExtraScene = async (index: number) => {
        const visual = "Technology news visualization, cinematic style";
        const newScenes = [...scenes];
        newScenes.splice(index + 1, 0, { speech: "Escribe la narración para este bloque aquí...", visual, transition: 'crossfade', duration: 5, titleCardEnabled: true } as any);
        setScenes(newScenes);
    };

    const handleRegenerateVisual = (index: number, feedback: string) => {
        const scene = scenes[index];
        const fullFeedback = `En la escena ${index + 1} ("${scene.speech.substring(0, 30)}..."), cambia el visual. Feedback del usuario: ${feedback}`;
        agent.rejectScript(fullFeedback);
    };

    return (
        <div className="h-full flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto overflow-hidden relative">
            <AssetPreloader scenes={scenes} />
            
            {/* OVERLAY DE GENERACIÓN / ENRIQUECIMIENTO / PROCESAMIENTO AGENTICO */}
            {(isGeneratingScript || isEnriching || agent.status === 'thinking') && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-500 rounded-3xl m-4">
                    <div className="p-10 flex flex-col items-center text-center space-y-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full border-4 border-studio-accent/20 border-t-studio-accent animate-spin" />
                            <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-studio-accent animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                                {isEnriching ? "Enriqueciendo Escenas..." : 
                                 agent.status === 'thinking' ? "Procesando Solicitud..." : "Generando Guion..."}
                            </h3>
                            <p className="text-zinc-400 text-sm font-medium animate-pulse">
                                {isEnriching 
                                    ? "Buscando los mejores clips para tu video de 5 minutos..." 
                                    : agent.status === 'thinking' 
                                    ? "El Director IA está ejecutando tus instrucciones técnicos..."
                                    : "El Director AI está redactando tu historia..."}
                            </p>
                        </div>
                        <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-studio-accent animate-[shimmer_2s_infinite] w-[40%]" />
                        </div>
                    </div>
                </div>
            )}

            {/* Header del Paso 1 */}
            <div className="flex-none flex items-center gap-5 p-6 glass-card bg-white/5 border-white/10 mt-4 mx-4 relative overflow-hidden">
                <div className="w-12 h-12 rounded-2xl bg-studio-accent/10 flex items-center justify-center text-studio-accent border border-studio-accent/20">
                    <Sparkles className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Paso 1: Validación de Escenas</h2>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1 italic">Revisa y ajusta el guion visual antes de ensamblar el video final.</p>
                </div>

                {/* BOTÓN DE RESPALDO: Navegar al Editor si el Agente está listo */}
                {agent.status === 'waiting_approval' && scenes.length > 0 && (
                    <button 
                        onClick={handleConfirmScenes}
                        className="px-6 h-12 rounded-2xl bg-studio-accent text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-studio-accent/20 animate-in slide-in-from-right-4 hover:scale-105 transition-all flex items-center gap-2 group"
                    >
                        <span>Entrar al Editor</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-20">
                {scenes.length === 0 && !isGeneratingScript ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
                        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-studio-accent/20 animate-pulse">
                            <Loader2 className="w-10 h-10 animate-spin" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-white">Esperando al Director...</h3>
                            <p className="text-zinc-500 text-xs max-w-sm mx-auto">Escribe el foco de tu noticia en el sidebar y presiona el botón de acción para que el Agente comience a trabajar.</p>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
                        <SceneScriptEditor 
                            onAddScene={addExtraScene} 
                            onDuplicateScene={duplicateScene} 
                            onRemoveScene={removeScene} 
                        />
                        <div className="max-w-4xl mx-auto pt-10 border-t border-white/5">
                             <ConfigCard />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
