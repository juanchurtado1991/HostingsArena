"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo, useRef } from 'react';
import { logger } from "@/lib/logger";
import { SyncEngine } from "@/lib/video-sync/SyncEngine";
import { findBestMixedMediaBatch, type MediaItem } from '@/components/video/mediaLibrary';
import { useStudioStore } from '@/store/useStudioStore';
import { clearAssetCache } from '@/lib/video/assetCache';

interface MediaSegment {
    id: string;
    source: 'library' | 'upload';
    type: 'image' | 'video';
    url: string;
    durationPct: number;
    motionEffect?: 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right' | 'ken-burns' | 'none';
}

export interface Clip {
    id: string;
    type: 'video' | 'image' | 'audio' | 'music' | 'sfx' | 'overlay';
    src: string;
    startFrame: number;
    durationInFrames: number;
    trimStartFrame?: number;
    motionEffect?: string;
    title?: string;
    volume?: number;
    pan?: number; // -1 to 1
    blurEnabled?: boolean;
    sceneReferenceId?: string; // Links back to a scene for data integrity if needed
    // Spatial properties for Layer-based editing
    x?: number; // Percentage of width (0-100)
    y?: number; // Percentage of height (0-100)
    scale?: number; // 1.0 = 100%
    opacity?: number; // 0.0 to 1.0
    sfxUrl?: string;
    sfxDurationFrames?: number;
    sfxVolume?: number;
}

export interface Layer {
    id: string;
    name: string;
    clips: Clip[];
    isVisible?: boolean;
    isLocked?: boolean;
}

interface Scene {
    speech: string;
    visual: string;
    assetUrl?: string;
    assetType?: 'image' | 'video' | 'ai-image' | 'ai-video';
    mediaSegments?: MediaSegment[];
    transition?: 'crossfade' | 'zoom' | 'slide' | 'none';
    duration?: number;
    voiceUrl?: string;
    wordTimestamps?: { word: string; start: number; end: number }[];
    lastSyncedSpeech?: string;
    lastSyncedVoice?: string;
    transitionSfx?: 'swoosh' | 'glitch' | 'whoosh' | 'none' | 'custom' | 'click';
    customSfxUrl?: string;
    extraLayers?: any[];
    blurEnabled?: boolean;
    visualEffect?: 'ken-burns' | 'static' | 'zoom' | 'pan' | 'whip-pan' | 'glitch' | 'bounce-zoom' | 'drift';
    titleCardEnabled?: boolean;
    headline?: string;
    subHeadline?: string;
    displayHeadline?: string;
    voiceSpeed?: number;
}

interface VideoStudioContextValue {
    // Project Settings
    title: string;
    setTitle: (v: string) => void;
    format: '9:16' | '16:9';
    setFormat: (v: '9:16' | '16:9') => void;
    scriptLang: string;
    setScriptLang: (v: string) => void;
    newsFocus: string;
    setNewsFocus: (v: string) => void;
    targetDuration: number;
    setTargetDuration: (v: number) => void;

    // Workflow State
    currentPhase: number;
    setCurrentPhase: (v: number) => void;
    error: string | null;
    setError: (v: string | null) => void;
    isLoaded: boolean;

    // Media & Scene State (Phase 1 & 2)
    scenes: Scene[];
    setScenes: React.Dispatch<React.SetStateAction<Scene[]>>;
    updateScene: (index: number, updates: Partial<Scene>) => void;
    videoTrack?: Clip[];
    audioTrack?: Clip[];
    musicTrack?: Clip[];
    overlayTrack?: Clip[];
    
    // NLE Layers State
    layers: Layer[];
    setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
    addLayer: () => void;
    removeLayer: (id: string) => void;
    reorderLayers: (newOrder: string[]) => void;

    durationInFrames: number;
    setDurationInFrames: (v: number) => void;

    // Audio & Voice State
    selectedVoice: string;
    setSelectedVoice: (v: string) => void;
    customVoiceUrl?: string;
    setCustomVoiceUrl: (v: string | undefined) => void;
    bgMusicUrl?: string;
    setBgMusicUrl: (v: string | undefined) => void;
    bgMusicVolume: number;
    setBgMusicVolume: (v: number) => void;
    transitionSfxUrl?: string;
    setTransitionSfxUrl: (v: string | undefined) => void;
    introSfxUrl?: string;
    setIntroSfxUrl: (v: string | undefined) => void;
    outroSfxUrl?: string;
    setOutroSfxUrl: (v: string | undefined) => void;
    newsCardSfxUrl?: string;
    setNewsCardSfxUrl: (v: string | undefined) => void;
    voiceSpeed: number;
    setVoiceSpeed: (v: number) => void;

    // Processing States
    isGeneratingScript: boolean;
    setIsGeneratingScript: (v: boolean) => void;
    isPreparingAssembly: boolean;
    syncEta: number;
    prepareAssemblyData: () => Promise<void>;

    // Video Output State
    isGeneratingVideo: boolean;
    setIsGeneratingVideo: (v: boolean) => void;
    renderProgress: number;
    renderStep: string;
    renderEta: number;
    videoUrl: string | null;
    renderFinished: boolean;
    setRenderFinished: (v: boolean) => void;
    setVideoUrl: (v: string | null) => void;
    renderVideo: () => Promise<void>;
    handleDownload: () => void;
    isPlayingPreview: boolean;
    setIsPlayingPreview: (v: boolean) => void;
    exportSettings: {
        resolution: '720p' | '1080p' | '4k';
        quality: 'draft' | 'balanced' | 'max';
        speed: 'fast' | 'medium' | 'slow';
        fps: '24' | '30' | '60';
        outputFormat: 'mp4' | 'webm' | 'mov';
    };
    setExportSettings: (v: any) => void;
    // Clip Actions
    addClip: (layerId: string, clip: Partial<Clip>) => void;
    updateClip: (clipId: string, updates: Partial<Clip>) => void;
    deleteClip: (clipId: string) => void;
    splitClip: (clipId: string, frame: number) => void;
    moveClip: (clipId: string, direction: 'left' | 'right') => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    resetProject: () => void;
}

const VideoStudioContext = createContext<VideoStudioContextValue | undefined>(undefined);

const STORAGE_KEY = "hostingarena_studio_v2";

export function VideoStudioProvider({ children, initialLang = "en" }: { children: ReactNode, initialLang?: string }) {
    // Core State
    const [isLoaded, setIsLoaded] = useState(false);
    const [title, setTitle] = useState("Tech News Summary");
    const [format, setFormat] = useState<'9:16' | '16:9'>("16:9");
    const [scriptLang, setScriptLang] = useState(initialLang);
    const [newsFocus, setNewsFocus] = useState("");
    const [targetDuration, setTargetDuration] = useState(60);
    const [currentPhase, setCurrentPhase] = useState(1);
    const [error, setError] = useState<string | null>(null);

    const [scenes, setScenes] = useState<Scene[]>([]);
    
    // NLE Layers
    const [layers, setLayers] = useState<Layer[]>([]);

    const [durationInFrames, setDurationInFrames] = useState(1800);

    const [selectedVoice, setSelectedVoice] = useState("en-US-AndrewNeural");
    const [customVoiceUrl, setCustomVoiceUrl] = useState<string>();
    const [bgMusicUrl, setBgMusicUrl] = useState<string>();
    const [bgMusicVolume, setBgMusicVolume] = useState(0.4);
    const [transitionSfxUrl, setTransitionSfxUrl] = useState<string>();
    const [introSfxUrl, setIntroSfxUrl] = useState<string>();
    const [outroSfxUrl, setOutroSfxUrl] = useState<string>();
    const [newsCardSfxUrl, setNewsCardSfxUrl] = useState<string>();
    const [voiceSpeed, setVoiceSpeed] = useState(1.0);

    const [isGeneratingScript, setIsGeneratingScript] = useState(false);
    
    // Assembly State
    const [isPreparingAssembly, setIsPreparingAssembly] = useState(false);
    const [syncEta, setSyncEta] = useState(0);

    // Export State
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const [renderProgress, setRenderProgress] = useState(0);
    const [renderStep, setRenderStep] = useState("");
    const [renderEta, setRenderEta] = useState(0);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [renderFinished, setRenderFinished] = useState(false);
    const [isPlayingPreview, setIsPlayingPreview] = useState(false);
    const [exportSettings, setExportSettings] = useState<VideoStudioContextValue["exportSettings"]>({
        resolution: '1080p',
        quality: 'balanced',
        speed: 'fast',
        fps: '30',
        outputFormat: 'mp4',
    });

    // Undo/Redo History
    interface HistoryItem {
        scenes: Scene[];
        layers: Layer[];
    }
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const pushToHistory = useCallback((scenes: Scene[], l: Layer[]) => {
        setHistory(prev => {
            const next = prev.slice(0, historyIndex + 1);
            const newItem = { 
                scenes: [...scenes], 
                layers: [...l]
            };
            
            // Don't push if it's identical to last one
            if (next.length > 0) {
                const last = next[next.length - 1];
                if (JSON.stringify(last) === JSON.stringify(newItem)) return prev;
            }
            
            return [...next, newItem].slice(-50);
        });
        setHistoryIndex(prev => Math.min(49, prev + 1));
    }, [historyIndex]);

    const undo = useCallback(() => {
        if (historyIndex <= 0) return;
        const prevIndex = historyIndex - 1;
        const item = history[prevIndex];
        if (item) {
            setScenes(item.scenes);
            setLayers(item.layers);
            setHistoryIndex(prevIndex);
        }
    }, [history, historyIndex]);

    const redo = useCallback(() => {
        if (historyIndex >= history.length - 1) return;
        const nextIndex = historyIndex + 1;
        const item = history[nextIndex];
        if (item) {
            setScenes(item.scenes);
            setLayers(item.layers);
            setHistoryIndex(nextIndex);
        }
    }, [history, historyIndex]);

    // Auto-update total duration based on clips (NLE Support)
    useEffect(() => {
        if (layers.length > 0) {
            const newDuration = SyncEngine.getClipsDurationInFrames(layers);
            if (newDuration !== durationInFrames) {
                setDurationInFrames(newDuration);
            }
        }
    }, [layers, durationInFrames]);

    // Initialize history once loaded
    useEffect(() => {
        if (isLoaded && history.length === 0 && scenes.length > 0) {
            setHistory([{ 
                scenes: [...scenes], 
                layers: [...layers]
            }]);
            setHistoryIndex(0);
        }
    }, [isLoaded, scenes, layers, history.length]);

    // Persistence Logic
    useEffect(() => {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
            try {
                const data = JSON.parse(savedState);
                if (data.scenes) setScenes(data.scenes);
                if (data.layers) {
                    const cleanLayers = data.layers.map((l: any, i: number) => ({
                        ...l,
                        name: i === 0 ? "Imagen / Video" : i === 1 ? "Narración" : "Música"
                    }));
                    setLayers(cleanLayers);
                }
                // Fallback for legacy tracks migration
                else if (data.videoTrack) {
                    const legacyLayers = [
                        { id: 'l1', name: 'Imagen / Video', clips: data.videoTrack || [] },
                        { id: 'l2', name: 'Narración', clips: data.overlayTrack || [] },
                        { id: 'l3', name: 'Música', clips: data.audioTrack || [] },
                        { id: 'l4', name: 'Música 2', clips: data.musicTrack || [] }
                    ].filter(l => l.clips.length > 0);
                    // No need to override names again here
                    setLayers(legacyLayers);
                }
                if (data.format) setFormat(data.format);
                if (data.currentPhase) setCurrentPhase(data.currentPhase);
                if (data.scriptLang) setScriptLang(data.scriptLang);
                if (data.title) setTitle(data.title);
                if (data.bgMusicUrl) setBgMusicUrl(data.bgMusicUrl);
                if (data.bgMusicVolume !== undefined) setBgMusicVolume(data.bgMusicVolume);
                if (data.transitionSfxUrl) setTransitionSfxUrl(data.transitionSfxUrl);
                if (data.introSfxUrl) setIntroSfxUrl(data.introSfxUrl);
                if (data.outroSfxUrl) setOutroSfxUrl(data.outroSfxUrl);
                if (data.newsCardSfxUrl) setNewsCardSfxUrl(data.newsCardSfxUrl);
                if (data.newsFocus) setNewsFocus(data.newsFocus);
                if (data.selectedVoice) setSelectedVoice(data.selectedVoice);
                if (data.customVoiceUrl) setCustomVoiceUrl(data.customVoiceUrl);
                if (data.voiceSpeed) setVoiceSpeed(data.voiceSpeed);
                if (data.durationInFrames) setDurationInFrames(data.durationInFrames);
                if (data.targetDuration) setTargetDuration(data.targetDuration);
            } catch (e) {
                console.error("Failed to load saved studio state:", e);
            }
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (!isLoaded) return;
        const stateToSave = {
            scenes, layers, durationInFrames,
            selectedVoice, format, currentPhase, scriptLang,
            title, bgMusicUrl, bgMusicVolume, transitionSfxUrl,
            introSfxUrl, outroSfxUrl, newsCardSfxUrl,
            newsFocus, customVoiceUrl, voiceSpeed, targetDuration
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }, [
        scenes, layers, durationInFrames,
        selectedVoice, format, currentPhase, scriptLang,
        title, bgMusicUrl, bgMusicVolume, transitionSfxUrl,
        introSfxUrl, outroSfxUrl, newsCardSfxUrl,
        newsFocus, customVoiceUrl, voiceSpeed, targetDuration, isLoaded
    ]);

    // Actions
    const updateScene = useCallback((index: number, updates: Partial<Scene>) => {
        setScenes(prev => {
            const next = [...prev];
            next[index] = { ...next[index], ...updates };
            return next;
        });
    }, []);

    const getAudioDuration = (url: string): Promise<number> => {
        return new Promise((resolve, reject) => {
            const audio = new Audio(url);
            audio.onloadedmetadata = () => resolve(audio.duration);
            audio.onerror = () => reject("Failed to load audio");
        });
    };

    const isPreparingRef = useRef(false);

    const prepareAssemblyData = useCallback(async () => {
        if (scenes.length === 0 || isPreparingRef.current) return;
        isPreparingRef.current = true;
        setIsPreparingAssembly(true);
        setError(null);

        try {
            if (selectedVoice === "custom" && customVoiceUrl) {
                const audioObj = new Audio(customVoiceUrl);
                await new Promise<void>((resolve, reject) => {
                    audioObj.onloadedmetadata = () => {
                        const audioFrames = Math.ceil(audioObj.duration * SyncEngine.FPS);
                        const totalFrames = SyncEngine.getIntroFrames() + audioFrames + SyncEngine.getOutroFrames();
                        
                        const newVideoTrack: Clip[] = [];
                        let currentFrame = SyncEngine.getIntroFrames();
                        const framesPerScene = Math.floor(audioFrames / Math.max(1, scenes.length));
                        
                        scenes.forEach((scene, i) => {
                            newVideoTrack.push({
                                id: `v-${i}`,
                                type: scene.assetType?.includes('video') ? 'video' : 'image',
                                src: scene.assetUrl || scene.visual,
                                startFrame: currentFrame,
                                durationInFrames: i === scenes.length - 1 ? audioFrames - (framesPerScene * i) : framesPerScene,
                                motionEffect: scene.visualEffect || 'ken-burns',
                                sceneReferenceId: `scene-${i}`,
                                x: 50, y: 50, scale: 1, opacity: 1
                            });
                            currentFrame += framesPerScene;
                        });

                        const initialLayers: Layer[] = [
                            { id: 'l1', name: 'Capa 1', clips: newVideoTrack },
                            {
                                id: 'l2',
                                name: 'Capa 2',
                                clips: [{
                                    id: 'a-custom',
                                    type: 'audio' as 'audio',
                                    src: customVoiceUrl,
                                    startFrame: introFrames,
                                    durationInFrames: audioFrames
                                }]
                            }
                        ].filter(l => l.clips.length > 0);
                        initialLayers.forEach((l, i) => l.name = `Capa ${i + 1}`);

                        setLayers(initialLayers);
                        setDurationInFrames(totalFrames);
                        setSyncEta(Math.ceil(audioObj.duration));

                        // [SYNC FIX] Mirror to useStudioStore for Custom Voice Path
                        const store = useStudioStore.getState();
                        store.setScenes(scenes); // Custom path doesn't "update" scenes with timestamps yet, but we need the refs
                        store.setLayers(initialLayers);
                        store.setDurationInFrames(totalFrames);
                        store.setTitle(title);
                        store.setFormat(format);

                        resolve();
                    };
                    audioObj.onerror = reject;
                });
                return;
            }

            const validScenes = scenes.filter(s => s.speech.trim());
            setSyncEta(Math.ceil(validScenes.length * 2));

            // ─── STEP 1: Generate audio for EACH scene in parallel ───
            const FALLBACK_VOICES: Record<string, string> = {
                es: 'es-MX-JorgeNeural',
                en: 'en-US-AndrewNeural',
            };
            const voiceLang = selectedVoice.startsWith('es') ? 'es' : 'en';

            const generateVoice = async (text: string, voice: string): Promise<Response> => {
                return fetch('/api/admin/video/voice', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text, voice, rate: 1.0 })
                });
            };

            const sceneAudioData = await Promise.all(validScenes.map(async (scene, i) => {
                let res = await generateVoice(scene.speech, selectedVoice);

                // Retry with fallback voice if the primary voice fails
                if (!res.ok) {
                    const fallback = FALLBACK_VOICES[voiceLang] || FALLBACK_VOICES.en;
                    console.warn(`[StudioVoice] Scene ${i+1} failed with ${selectedVoice}, retrying with fallback ${fallback}...`);
                    res = await generateVoice(scene.speech, fallback);
                }

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.details || errData.error || `Error en escena ${i+1}: ${selectedVoice}`);
                }

                const data = await res.json();
                
                // CRÍTICO: No pedir duración al cliente (onloadedmetadata). 
                // Usar ÚNICAMENTE la duración lógica calculada por el servidor (data.duration), 
                // ya que el archivo físico WebM puede tener metadatos de duración corruptos en el navegador.
                const duration = data.duration || 3;

                console.log(`[StudioVoice] API Result - Scene ${i} - URL: ${data.url}, Duración Servidor: ${duration.toFixed(3)}s`);
                return {
                    url: data.url,
                    wordTimestamps: data.wordTimestamps || [],
                    duration
                };
            }));

            // ─── STEP 2: Position audio and video clips ───
            const updatedScenes = [...scenes];
            let activeValidIdx = 0;
            
            // Generate visual context (Assets API) in parallel with Audio 
            // but we'll do it sequentially here for simplicity and to avoid rate limits
            for (let i = 0; i < updatedScenes.length; i++) {
                const scene = updatedScenes[i];
                const isSpeechless = !scene.speech.trim();
                const sceneDurationSec = isSpeechless ? 3 : (sceneAudioData[activeValidIdx]?.duration || 3);
                
                // Fetch dynamic asset if not manually overridden
                let dynamicAssetUrl = scene.assetUrl;
                if (!dynamicAssetUrl && scene.speech.trim()) {
                    try {
                        const assetRes = await fetch('/api/admin/video/assets', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ query: scene.visual || scene.speech, type: 'both', count: 1 })
                        });
                        if (assetRes.ok) {
                            const assetData = await assetRes.json();
                            if (assetData.results && assetData.results.length > 0) {
                                dynamicAssetUrl = assetData.results[0].url;
                                console.log(`[Studio Context] Fetched dynamic asset for scene ${i}: ${dynamicAssetUrl} (Source: ${assetData.results[0].source || 'pexels'})`);
                            }
                        }
                    } catch (e) {
                         console.warn(`[Studio Context] Failed to fetch dynamic asset for scene ${i}`, e);
                    }
                }

                if (!isSpeechless) {
                    const audioData = sceneAudioData[activeValidIdx];
                    updatedScenes[i] = {
                        ...scene,
                        voiceUrl: audioData.url,
                        wordTimestamps: audioData.wordTimestamps,
                        duration: sceneDurationSec,
                        assetUrl: dynamicAssetUrl || scene.visual, // Fallback to visual (which might be a static URL)
                        titleCardEnabled: true // FORCE News Title Card for narrator scenes
                    };
                    activeValidIdx++;
                } else {
                    // Speechless scenes only need 1s of breathing room, not 3s.
                    updatedScenes[i] = { 
                        ...scene, 
                        duration: 1,
                        assetUrl: dynamicAssetUrl || scene.visual
                    };
                }
            }

            const timings = SyncEngine.calculateTimings(updatedScenes);

            console.group('📽️ Video Studio - Synchronization Report');
            console.table(timings.map((t, idx) => ({
                scene: idx,
                duration: `${updatedScenes[idx].duration?.toFixed(2)}s`,
                startFrame: t.startFrame,
                endFrame: t.endFrame,
                frames: t.durationInFrames,
                type: updatedScenes[idx].speech.trim() ? 'Speech' : 'Silence'
            })));
            console.log(`Total Project Frames: ${SyncEngine.getTotalDurationInFrames(updatedScenes)} (${(SyncEngine.getTotalDurationInFrames(updatedScenes)/SyncEngine.FPS).toFixed(2)}s)`);
            console.groupEnd();

            const introFrames = SyncEngine.getIntroFrames();
            const outroFrames = SyncEngine.getOutroFrames();
            const totalProjectFrames = SyncEngine.getTotalDurationInFrames(updatedScenes);

            console.log(`[Phase3Assembly] Timing Debug: Intro=${introFrames}, Outro=${outroFrames}, Total=${totalProjectFrames}`);

            const newVideoTrack: Clip[] = [];
            const newLowerThirdClips: Clip[] = [];
            const newAudioClips: Clip[] = [];

            // 1. Add Intro Clip
            if (introFrames > 0) {
                newVideoTrack.push({
                    id: 'c-intro',
                    type: 'overlay',
                    src: 'intro',
                    startFrame: 0,
                    durationInFrames: introFrames,
                    title: new Date().toLocaleDateString(scriptLang === 'es' ? 'es-ES' : 'en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                    }).toUpperCase(),
                    ...(introSfxUrl ? { sfxUrl: introSfxUrl, sfxDurationFrames: Math.min(introFrames, 60), sfxVolume: 0.8 } : {})
                });
            }

            // 2. Add Scene Clips (Video & Audio & Overlays)
            const usedUrls = new Set<string>();
            const titleCardFrames = SyncEngine.secondsToFrames(SyncEngine.TITLE_CARD_SECONDS);

            timings.forEach((timing, i) => {
                const scene = updatedScenes[i];
                
                const isTitleCardEnabled = scene.titleCardEnabled !== false;

                // Audio (Starts exactly at timing.startFrame, which accounts for Title Card offset)
                if (scene.voiceUrl && scene.speech.trim()) {
                    newAudioClips.push({
                        id: `a-scene-${i}`,
                        type: 'audio',
                        src: scene.voiceUrl,
                        startFrame: timing.startFrame,
                        durationInFrames: timing.durationInFrames,
                        volume: 1,
                    });
                    
                    if (isTitleCardEnabled) {
                        // News Lower Third Overlay
                        newLowerThirdClips.push({
                            id: `lower-third-${i}`,
                            type: 'overlay',
                            src: 'news-lower-third',
                            startFrame: timing.startFrame,
                            durationInFrames: timing.durationInFrames,
                            title: scene.displayHeadline || scene.headline || "LATEST UPDATE", 
                            subtitle: scene.speech || "",
                            opacity: 1, scale: 1, x: 50, y: 50
                        } as any);
                    }
                }

                // Title Card Overlay Clip (Inserted into Video Track Layer 1)
                if (isTitleCardEnabled) {
                    newVideoTrack.push({
                        id: `v-title-${i}`,
                        type: 'overlay',
                        src: 'news-card',
                        title: scene.displayHeadline || scene.headline || scene.visual.split(',')[0],
                        subtitle: scene.subHeadline,
                        startFrame: timing.startFrame - titleCardFrames,
                        durationInFrames: titleCardFrames,
                        x: 50, y: 50, scale: 1, opacity: 1,
                        animation: 'slide-up',
                        ...(newsCardSfxUrl ? { sfxUrl: newsCardSfxUrl, sfxDurationFrames: Math.min(titleCardFrames, 45), sfxVolume: 0.7 } : {})
                    } as any);
                }

                // Video/Image Segments (Start at timing.startFrame)
                const hasSegments = scene.mediaSegments && scene.mediaSegments.length > 0;
                const segmentsToUse = hasSegments 
                    ? scene.mediaSegments! 
                    : findBestMixedMediaBatch(scene.visual || "Tech news", 2, 2, usedUrls).map(m => ({
                        id: Math.random().toString(36).substr(2, 9),
                        source: 'library' as const,
                        type: m.type,
                        url: m.url,
                        durationPct: 25,
                        motionEffect: 'ken-burns' as const
                    }));

                // Update usedUrls to prevent duplicate backgrounds in subsequent scenes
                segmentsToUse.forEach(seg => usedUrls.add(seg.url));

                let segOffset = 0;
                segmentsToUse.forEach((seg, segIdx) => {
                    const isLastSeg = segIdx === segmentsToUse.length - 1;
                    const segFrames = isLastSeg 
                        ? timing.durationInFrames - segOffset 
                        : Math.round((seg.durationPct / 100) * timing.durationInFrames);
                        
                    newVideoTrack.push({
                        id: `v-${i}-${segIdx}`,
                        type: seg.type,
                        src: seg.url,
                        startFrame: timing.startFrame + segOffset,
                        durationInFrames: segFrames,
                        motionEffect: seg.motionEffect || scene.visualEffect || 'ken-burns',
                        sceneReferenceId: `scene-${i}`
                    } as any);
                    segOffset += segFrames;
                });
            });

            // 3. Outro is now rendered dynamically at the end of Composition.tsx
            // and no longer inserted into the NLE track to prevent overlapping issues.

            setScenes(updatedScenes);

            // ─── STEP 5: Music track (covers everything) ───
            const musicUrlToUse = bgMusicUrl || "/assets/bg-music.mp3";
            const newMusicTrack: Clip[] = [{
                id: 'm-background',
                type: 'music',
                src: musicUrlToUse,
                startFrame: 0,
                durationInFrames: totalProjectFrames,
                volume: bgMusicVolume,
            }];

            // Add Outro SFX if exists
            if (outroSfxUrl) {
                const outroFrames = SyncEngine.getOutroFrames();
                newAudioClips.push({
                    id: `sfx-outro`,
                    type: 'sfx',
                    src: outroSfxUrl,
                    startFrame: totalProjectFrames - outroFrames,
                    durationInFrames: outroFrames,
                    volume: 0.8,
                });
            }

            console.group('🎞️ NLE Timeline - Final Assembly');
            console.log('Video Track:', newVideoTrack);
            console.log('Lower Third Clips:', newLowerThirdClips);
            console.log('Voice/SFX Clips:', newAudioClips);
            console.log('Music Track:', newMusicTrack);
            console.groupEnd();

            const finalLayers: Layer[] = [
                { id: 'l1', name: 'Imagen / Video', clips: newVideoTrack },
                { id: 'l2', name: 'Cintillo',       clips: newLowerThirdClips },
                { id: 'l3', name: 'Voz / SFX',      clips: newAudioClips },
                { id: 'l4', name: 'Música',         clips: newMusicTrack },
            ];

            setLayers(finalLayers);
            setDurationInFrames(totalProjectFrames);
            
            // [SYNC FIX] Mirror to useStudioStore so Phase 3 Editor and Render have the latest state
            const store = useStudioStore.getState();
            store.setScenes(updatedScenes);
            store.setLayers(finalLayers);
            store.setDurationInFrames(totalProjectFrames);
            store.setTitle(title);
            store.setFormat(format);
            store.setVoiceSpeed(voiceSpeed);
            
            pushToHistory(updatedScenes, finalLayers);
        } catch (err: any) {
            logger.error('Failed to prepare assembly data', err);
            setError(err.message || 'Could not sync voiceover data.');
            throw err;
        } finally {
            setIsPreparingAssembly(false);
            isPreparingRef.current = false;
        }
    }, [scenes, selectedVoice, customVoiceUrl, bgMusicUrl, bgMusicVolume, voiceSpeed, introSfxUrl, outroSfxUrl, newsCardSfxUrl, pushToHistory]);

    const renderVideo = useCallback(async () => {
        if (scenes.length === 0) return;
        setIsGeneratingVideo(true);
        setRenderProgress(0);
        setRenderFinished(false);
        setRenderStep("Initializing news engine...");

        try {
            setRenderStep("Finalizing scene durations...");
            setRenderProgress(10);
            
            const finalDurationFrames = durationInFrames;
            console.log(`[StudioRender] Using duration from state: ${finalDurationFrames} frames`);

            setRenderStep("Compositing news frames...");
            setRenderProgress(25);

            const latestState = useStudioStore.getState();
            const currentScenes = latestState.scenes.length > 0 ? latestState.scenes : scenes;
            const currentLayers = latestState.layers;

            const fullScript = currentScenes.map(s => s.speech).join(" ");
            const cleanScript = fullScript.replace(/\s+/g, ' ').trim();

            const estimatedSeconds = Math.max(15, currentScenes.length * 3 + 10);
            const renderStartTime = Date.now();

            const renderResponse = await fetch("/api/admin/video/render", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: latestState.title || title,
                    script: cleanScript,
                    scenes: currentScenes,
                    layers: currentLayers,
                    bgMusicUrl,
                    bgMusicVolume,
                    transitionSfxUrl,
                    voice: selectedVoice,
                    voiceSpeed,
                    format: latestState.format || format,
                    durationInFrames: finalDurationFrames,
                    exportSettings,
                })
            });

            if (!renderResponse.ok || !renderResponse.body) {
                let errorDetails = "Render engine failed";
                try {
                    const errData = await renderResponse.json();
                    errorDetails = errData.details || errorDetails;
                } catch (e) {}
                throw new Error(errorDetails);
            }

            // SSE Consumption
            const reader = renderResponse.body.getReader();
            const decoder = new TextDecoder();
            let finalVideoUrl = null;

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.substring(6));
                            
                            if (data.error) {
                                throw new Error(data.details || "Streaming render failed");
                            }

                            if (data.status === "initializing") {
                                setRenderStep(data.steps[0] || "Initializing Video News Engine...");
                                setRenderProgress(5);
                            }

                            if (data.status === "rendering") {
                                const raw = parseFloat(data.rawProgress);
                                if (!isNaN(raw)) {
                                    console.log(`[SSE Client] ${new Date().toISOString()} - Received progress: ${raw}`);
                                    const realPct = 5 + (raw * 90); // scale 0-1 to 5-95%
                                    setRenderProgress(Math.round(realPct));
                                    setRenderStep("Compositing News Scenes...");

                                    // Calculate real ETA based on elapsed time vs progress
                                    const elapsedSec = (Date.now() - renderStartTime) / 1000;
                                    if (raw > 0.05) { // Only calc after 5% to avoid initial spikes
                                        const totalEstimatedSec = elapsedSec / raw;
                                        const remainingSec = totalEstimatedSec - elapsedSec;
                                        setRenderEta(Math.ceil(remainingSec));
                                    } else {
                                        // Fallback to static guess early on
                                        setRenderEta(Math.ceil(estimatedSeconds - elapsedSec));
                                    }
                                }
                            }

                            if (data.status === "complete") {
                                finalVideoUrl = data.videoUrl;
                                setVideoUrl(data.videoUrl); // Set immediately
                                setRenderStep("Finalizing MP4 container...");
                            }

                        } catch (e) {
                            console.warn("Failed to parse SSE chunk", line, e);
                        }
                    }
                }
            }

            if (finalVideoUrl) setVideoUrl(finalVideoUrl);

            setRenderStep("Finalizing master output...");
            for (let p = Math.round(renderProgress); p <= 100; p += 2) {
                setRenderProgress(p);
                await new Promise(r => setTimeout(r, 40));
            }
            setRenderProgress(100);
            setRenderEta(0);
            setRenderFinished(true);
            setRenderStep("Video Ready!");
        } catch (err: any) {
            logger.error("Failed to render video:", err);
            setError(`Render Error: ${err.message}`);
        } finally {
            setIsGeneratingVideo(false);
        }
    }, [scenes, durationInFrames, title, bgMusicUrl, bgMusicVolume, transitionSfxUrl, selectedVoice, voiceSpeed, format]);

    const addLayer = useCallback(() => {
        setLayers(prev => {
            const next = [...prev, {
                id: `l-${Date.now()}`,
                name: `Capa ${prev.length + 1}`,
                clips: []
            }];
            pushToHistory(scenes, next);
            return next;
        });
    }, [scenes, pushToHistory]);

    const removeLayer = useCallback((id: string) => {
        setLayers(prev => {
            const next = prev.filter(l => l.id !== id);
            pushToHistory(scenes, next);
            return next;
        });
    }, [scenes, pushToHistory]);

    const reorderLayers = useCallback((newOrder: string[]) => {
        setLayers(prev => {
            const next = newOrder.map(id => prev.find(l => l.id === id)!).filter(Boolean);
            pushToHistory(scenes, next);
            return next;
        });
    }, [scenes, pushToHistory]);

    const addClip = useCallback((layerId: string, clip: Partial<Clip>) => {
        setLayers(prev => {
            const next = prev.map(layer => {
                if (layer.id !== layerId) return layer;
                
                const type = clip.type || 'video';
                const newClip: Clip = {
                    id: `${type}-${Date.now()}`,
                    type,
                    src: clip.src || '',
                    startFrame: clip.startFrame ?? 0,
                    durationInFrames: clip.durationInFrames ?? 150,
                    x: 50, // Default center
                    y: 50,
                    scale: 1,
                    opacity: 1,
                    ...clip
                };
                return { ...layer, clips: [...layer.clips, newClip] };
            });
            pushToHistory(scenes, next);
            return next;
        });
    }, [scenes, pushToHistory]);

    const updateClip = useCallback((id: string, updates: Partial<Clip>) => {
        setLayers(prev => {
            const next = prev.map(layer => ({
                ...layer,
                clips: layer.clips.map(c => c.id === id ? { ...c, ...updates } : c)
            }));
            
            if (JSON.stringify(next) !== JSON.stringify(prev)) {
                pushToHistory(scenes, next);
            }
            return next;
        });
    }, [scenes, pushToHistory]);

    const deleteClip = useCallback((id: string) => {
        setLayers(prev => {
            const next = prev.map(layer => ({
                ...layer,
                clips: layer.clips.filter(c => c.id !== id)
            }));
            pushToHistory(scenes, next);
            return next;
        });
    }, [scenes, pushToHistory]);

    const splitClip = useCallback((id: string, frame: number) => {
        setLayers(prev => {
            const next = prev.map(layer => {
                const idx = layer.clips.findIndex(c => c.id === id);
                if (idx === -1) return layer;

                const clip = layer.clips[idx];
                if (frame <= clip.startFrame || frame >= clip.startFrame + clip.durationInFrames) return layer;

                const firstHalfDuration = frame - clip.startFrame;
                const secondHalfDuration = clip.durationInFrames - firstHalfDuration;

                const newClip: Clip = {
                    ...clip,
                    id: clip.id + '-split-' + Date.now(),
                    startFrame: frame,
                    durationInFrames: secondHalfDuration,
                    trimStartFrame: (clip.trimStartFrame || 0) + firstHalfDuration
                };

                const nextClips = [...layer.clips];
                nextClips[idx] = { ...clip, durationInFrames: firstHalfDuration };
                nextClips.splice(idx + 1, 0, newClip);
                return { ...layer, clips: nextClips };
            });
            pushToHistory(scenes, next);
            return next;
        });
    }, [scenes, pushToHistory]);

    const moveClip = useCallback((id: string, direction: 'left' | 'right') => {
        setLayers(prev => {
            const next = prev.map(layer => {
                const idx = layer.clips.findIndex(c => c.id === id);
                if (idx === -1) return layer;

                const newIdx = direction === 'left' ? idx - 1 : idx + 1;
                if (newIdx < 0 || newIdx >= layer.clips.length) return layer;

                const nextClips = [...layer.clips];
                [nextClips[idx], nextClips[newIdx]] = [nextClips[newIdx], nextClips[idx]];

                // Re-calculate startFrames to maintain magnetic behavior
                let currentPos = nextClips[0].startFrame;
                const repositioned = nextClips.map(c => {
                    const u = { ...c, startFrame: currentPos };
                    currentPos += c.durationInFrames;
                    return u;
                });

                return { ...layer, clips: repositioned };
            });
            pushToHistory(scenes, next);
            return next;
        });
    }, [scenes, pushToHistory]);

    const resetProject = useCallback(() => {
        fetch('/api/admin/video/cleanup', { method: 'POST' }).catch(err => {
            console.error('[VideoStudioContext] Cleanup failed:', err);
        });

        // 1. Reset Context State
        setScenes([]);
        setLayers([]);
        setTitle('Tech News Summary');
        setBgMusicUrl(undefined);
        setBgMusicVolume(0.15);
        setTransitionSfxUrl(undefined);
        setIntroSfxUrl(undefined);
        setOutroSfxUrl(undefined);
        setNewsCardSfxUrl(undefined);
        setNewsFocus('');
        setCustomVoiceUrl(undefined);
        setSelectedVoice('en-US-AndrewNeural');
        setCurrentPhase(1);
        setError(null);
        setDurationInFrames(1800);
        setHistory([]);
        setHistoryIndex(-1);

        // 2. Reset [Zustand] Studio Store (Crucial for Phase 3/4 Sync)
        useStudioStore.getState().resetStore();

        // 3. Clear all persistence keys
        localStorage.removeItem(STORAGE_KEY); // "hostingarena_studio_v2"
        localStorage.removeItem('hostingarena_editor_draft'); // Phase 3 Editor specific key

        // 4. Clear persistent asset cache (images, videos, SFX)
        clearAssetCache();
    }, []);

    const handleDownload = useCallback(() => {
        if (!videoUrl) return;
        const link = document.createElement('a');
        link.href = videoUrl;
        link.download = `${title.replace(/\s/g, '_') || 'video'}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setRenderFinished(false);
    }, [videoUrl, title]);

    const value: VideoStudioContextValue = useMemo(() => ({
        title, setTitle,
        format, setFormat,
        scriptLang, setScriptLang,
        newsFocus, setNewsFocus,
        targetDuration, setTargetDuration,
        currentPhase, setCurrentPhase,
        error, setError, isLoaded,
        scenes, setScenes, updateScene,
        layers, setLayers,
        addLayer, removeLayer, reorderLayers,
        durationInFrames, setDurationInFrames,
        selectedVoice, setSelectedVoice,
        customVoiceUrl, setCustomVoiceUrl,
        bgMusicUrl, setBgMusicUrl,
        bgMusicVolume, setBgMusicVolume,
        transitionSfxUrl, setTransitionSfxUrl,
        introSfxUrl, setIntroSfxUrl,
        outroSfxUrl, setOutroSfxUrl,
        newsCardSfxUrl, setNewsCardSfxUrl,
        voiceSpeed, setVoiceSpeed,
        isGeneratingScript, setIsGeneratingScript,
        isPreparingAssembly, syncEta, prepareAssemblyData,
        isGeneratingVideo, setIsGeneratingVideo,
        renderProgress, renderStep, renderEta, videoUrl, renderFinished, setRenderFinished, setVideoUrl,
        renderVideo, handleDownload,
        isPlayingPreview, setIsPlayingPreview,
        exportSettings,
        setExportSettings,
        addClip,
        updateClip,
        deleteClip, splitClip, moveClip,
        undo, redo,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
        resetProject,
    }), [
        title, format, scriptLang, newsFocus, targetDuration, currentPhase, error, isLoaded, scenes, layers, durationInFrames,
        selectedVoice, customVoiceUrl, bgMusicUrl, bgMusicVolume, transitionSfxUrl,
        introSfxUrl, outroSfxUrl, newsCardSfxUrl,
        isGeneratingScript, isPreparingAssembly, syncEta, isGeneratingVideo, renderProgress, renderStep,
        renderEta, videoUrl, renderFinished, isPlayingPreview, historyIndex, history.length,
        exportSettings,
        updateScene, addLayer, removeLayer, reorderLayers, prepareAssemblyData, renderVideo,
        handleDownload, addClip, updateClip, deleteClip, splitClip, moveClip, undo, redo, resetProject
    ]);

    return <VideoStudioContext.Provider value={value}>{children}</VideoStudioContext.Provider>;
}

export const useVideoStudio = () => {
    const context = useContext(VideoStudioContext);
    if (context === undefined) {
        throw new Error('useVideoStudio must be used within a VideoStudioProvider');
    }
    return context;
};
