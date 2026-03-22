"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { SyncEngine } from "@/lib/video-sync/SyncEngine";
import { useStudioStore } from '@/store/useStudioStore';
import { useAssembly } from './useAssembly';
import { useRender } from './useRender';
import { useClipOperations } from './useClipOperations';
import { Scene, Layer, VideoStudioContextValue } from './types';
import { loadMediaData } from '@/components/video/mediaLibrary';
import { loadAudioData } from '@/components/video/audioLibrary';

const VideoStudioContext = createContext<VideoStudioContextValue | undefined>(undefined);
const STORAGE_KEY = "hostingarena_studio_v2";

export function VideoStudioProvider({ children, initialLang = "en" }: { children: ReactNode, initialLang?: string }) {
    const [isLoaded, setIsLoaded] = useState(false);

    // Initial background load of heavy libraries
    useEffect(() => {
        loadMediaData();
        loadAudioData();
    }, []);
    const [title, setTitle] = useState("Tech News Summary");
    const [format, setFormat] = useState<'9:16' | '16:9'>("16:9");
    const [scriptLang, setScriptLang] = useState(initialLang);
    const [newsFocus, setNewsFocus] = useState("");
    const [targetDuration, setTargetDuration] = useState(60);
    const [currentPhase, setCurrentPhase] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [scenes, setScenes] = useState<Scene[]>([]);
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
    const [introDuration, setIntroDuration] = useState(5);
    const [newsCardDuration, setNewsCardDuration] = useState(4);
    const [outroDuration, setOutroDuration] = useState(15);
    const [isGeneratingScript, setIsGeneratingScript] = useState(false);
    const [isPreparingAssembly, setIsPreparingAssembly] = useState(false);
    const [syncEta, setSyncEta] = useState(0);
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const [renderProgress, setRenderProgress] = useState(0);
    const [renderStep, setRenderStep] = useState("");
    const [renderEta, setRenderEta] = useState(0);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [renderFinished, setRenderFinished] = useState(false);
    const [isPlayingPreview, setIsPlayingPreview] = useState(false);
    const [exportSettings, setExportSettings] = useState<VideoStudioContextValue["exportSettings"]>({
        resolution: '1080p', quality: 'balanced', speed: 'fast', fps: '30', outputFormat: 'mp4',
    });

    interface HistoryItem { scenes: Scene[]; layers: Layer[]; }
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const pushToHistory = useCallback((scenes: Scene[], l: Layer[]) => {
        setHistory(prev => {
            const next = prev.slice(0, historyIndex + 1);
            const newItem = { scenes: [...scenes], layers: [...l] };
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
        if (item) { setScenes(item.scenes); setLayers(item.layers); setHistoryIndex(prevIndex); }
    }, [history, historyIndex]);

    const redo = useCallback(() => {
        if (historyIndex >= history.length - 1) return;
        const nextIndex = historyIndex + 1;
        const item = history[nextIndex];
        if (item) { setScenes(item.scenes); setLayers(item.layers); setHistoryIndex(nextIndex); }
    }, [history, historyIndex]);

    useEffect(() => {
        if (layers.length > 0) {
            const newDuration = SyncEngine.getClipsDurationInFrames(layers);
            if (newDuration !== durationInFrames) setDurationInFrames(newDuration);
        }
    }, [layers, durationInFrames]);

    useEffect(() => {
        if (isLoaded && history.length === 0 && scenes.length > 0) {
            setHistory([{ scenes: [...scenes], layers: [...layers] }]);
            setHistoryIndex(0);
        }
    }, [isLoaded, scenes, layers, history.length]);

    useEffect(() => {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
            try {
                const data = JSON.parse(savedState);
                if (data.scenes) setScenes(data.scenes);
                if (data.layers) { setLayers(data.layers); }
                else if (data.videoTrack) {
                    const legacyLayers = [
                        { id: 'l1', name: 'Imagen / Video', clips: data.videoTrack || [] },
                        { id: 'l2', name: 'Cintillo / Overlay', clips: data.overlayTrack || [] },
                        { id: 'l3', name: 'Voz / Narración', clips: data.audioTrack || [] },
                        { id: 'l4', name: 'Música', clips: data.musicTrack || [] }
                    ].filter(l => l.clips.length > 0);
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
                if (data.introDuration) setIntroDuration(data.introDuration);
                if (data.newsCardDuration) setNewsCardDuration(data.newsCardDuration);
                if (data.outroDuration) setOutroDuration(data.outroDuration);
                if (data.durationInFrames) setDurationInFrames(data.durationInFrames);
                if (data.targetDuration) setTargetDuration(data.targetDuration);
            } catch (e) { console.error("Failed to load saved studio state:", e); }
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (!isLoaded || layers.length === 0) return;
        const layerMap: Record<string, string> = { 'l1': 'Imagen / Video', 'l2': 'Cintillo / Overlay', 'l3': 'Voz / Narración', 'l4': 'Música' };
        let hasChange = false;
        const repairedLayers = layers.map(l => {
            const standardName = layerMap[l.id];
            if (standardName && l.name !== standardName) { hasChange = true; return { ...l, name: standardName }; }
            return l;
        });
        if (hasChange) { console.log("[StudioContext] Automatically repaired corrupted layer names"); setLayers(repairedLayers); }
    }, [isLoaded, layers]);

    useEffect(() => {
        if (!isLoaded) return;
        const stateToSave = {
            scenes, layers, durationInFrames, selectedVoice, format, currentPhase, scriptLang,
            title, bgMusicUrl, bgMusicVolume, transitionSfxUrl, introSfxUrl, outroSfxUrl, newsCardSfxUrl,
            newsFocus, customVoiceUrl, voiceSpeed, targetDuration,
            introDuration, newsCardDuration, outroDuration
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }, [scenes, layers, durationInFrames, selectedVoice, format, currentPhase, scriptLang, title, bgMusicUrl, bgMusicVolume, transitionSfxUrl, introSfxUrl, outroSfxUrl, newsCardSfxUrl, newsFocus, customVoiceUrl, voiceSpeed, targetDuration, introDuration, newsCardDuration, outroDuration, isLoaded]);

    const updateScene = useCallback((index: number, updates: Partial<Scene>) => {
        setScenes(prev => { const next = [...prev]; next[index] = { ...next[index], ...updates }; return next; });
    }, []);

    const { prepareAssemblyData } = useAssembly({
        scenes, selectedVoice, customVoiceUrl, bgMusicUrl, bgMusicVolume: bgMusicVolume, voiceSpeed, introSfxUrl, outroSfxUrl, newsCardSfxUrl, scriptLang, title, format,
        introDuration, newsCardDuration, outroDuration,
        setScenes, setLayers, setDurationInFrames, setError, setIsPreparingAssembly: setIsPreparingAssembly, setSyncEta, pushToHistory,
    });

    const { renderVideo } = useRender({
        scenes, durationInFrames, title, bgMusicUrl, bgMusicVolume, transitionSfxUrl, selectedVoice, voiceSpeed, format, exportSettings,
        setIsGeneratingVideo, setRenderProgress, setRenderFinished, setRenderStep, setRenderEta, setVideoUrl, setError, renderProgress,
    });

    const clipOps = useClipOperations({
        scenes, setScenes, setLayers, pushToHistory, setTitle, setBgMusicUrl, setBgMusicVolume, setTransitionSfxUrl, setIntroSfxUrl, setOutroSfxUrl, setNewsCardSfxUrl, setNewsFocus, setCustomVoiceUrl, setSelectedVoice, setCurrentPhase, setError, setDurationInFrames, setHistory, setHistoryIndex, videoUrl, title,
    });

    const value: VideoStudioContextValue = useMemo(() => ({
        title, setTitle, format, setFormat, scriptLang, setScriptLang, newsFocus, setNewsFocus, targetDuration, setTargetDuration,
        currentPhase, setCurrentPhase, error, setError, isLoaded, scenes, setScenes, updateScene, layers, setLayers,
        addLayer: clipOps.addLayer, removeLayer: clipOps.removeLayer, reorderLayers: clipOps.reorderLayers,
        durationInFrames, setDurationInFrames, selectedVoice, setSelectedVoice, customVoiceUrl, setCustomVoiceUrl,
        bgMusicUrl, setBgMusicUrl, bgMusicVolume, setBgMusicVolume, transitionSfxUrl, setTransitionSfxUrl,
        introSfxUrl, setIntroSfxUrl, outroSfxUrl, setOutroSfxUrl, newsCardSfxUrl, setNewsCardSfxUrl, voiceSpeed, setVoiceSpeed,
        introDuration, setIntroDuration, newsCardDuration, setNewsCardDuration, outroDuration, setOutroDuration,
        isGeneratingScript, setIsGeneratingScript, isPreparingAssembly, syncEta, prepareAssemblyData,
        isGeneratingVideo, setIsGeneratingVideo, renderProgress, renderStep, renderEta, videoUrl, renderFinished, setRenderFinished, setVideoUrl,
        renderVideo, handleDownload: clipOps.handleDownload, isPlayingPreview, setIsPlayingPreview, exportSettings, setExportSettings,
        addClip: clipOps.addClip, updateClip: clipOps.updateClip, deleteClip: clipOps.deleteClip, splitClip: clipOps.splitClip, moveClip: clipOps.moveClip,
        undo, redo, canUndo: historyIndex > 0, canRedo: historyIndex < history.length - 1, resetProject: clipOps.resetProject,
    }), [
        title, format, scriptLang, newsFocus, targetDuration, currentPhase, error, isLoaded, scenes, layers, durationInFrames,
        selectedVoice, customVoiceUrl, bgMusicUrl, bgMusicVolume, transitionSfxUrl, introSfxUrl, outroSfxUrl, newsCardSfxUrl,
        introDuration, newsCardDuration, outroDuration,
        isGeneratingScript, isPreparingAssembly, syncEta, isGeneratingVideo, renderProgress, renderStep,
        renderEta, videoUrl, renderFinished, isPlayingPreview, historyIndex, history.length, exportSettings,
        updateScene, clipOps, prepareAssemblyData, renderVideo, undo, redo,
    ]);

    return <VideoStudioContext.Provider value={value}>{children}</VideoStudioContext.Provider>;
}

export const useVideoStudio = () => {
    const context = useContext(VideoStudioContext);
    if (context === undefined) throw new Error('useVideoStudio must be used within a VideoStudioProvider');
    return context;
};
