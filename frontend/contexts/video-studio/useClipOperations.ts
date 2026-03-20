import { useCallback } from 'react';
import { useStudioStore } from '@/store/useStudioStore';
import { clearAssetCache } from '@/lib/video/assetCache';
import type { Scene, Layer, Clip } from './types';

interface UseClipOperationsArgs {
    scenes: Scene[];
    setScenes: React.Dispatch<React.SetStateAction<Scene[]>>;
    setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
    pushToHistory: (scenes: Scene[], layers: Layer[]) => void;
    setTitle: (v: string) => void;
    setBgMusicUrl: (v: string | undefined) => void;
    setBgMusicVolume: (v: number) => void;
    setTransitionSfxUrl: (v: string | undefined) => void;
    setIntroSfxUrl: (v: string | undefined) => void;
    setOutroSfxUrl: (v: string | undefined) => void;
    setNewsCardSfxUrl: (v: string | undefined) => void;
    setNewsFocus: (v: string) => void;
    setCustomVoiceUrl: (v: string | undefined) => void;
    setSelectedVoice: (v: string) => void;
    setCurrentPhase: (v: number) => void;
    setError: (v: string | null) => void;
    setDurationInFrames: (v: number) => void;
    setHistory: React.Dispatch<React.SetStateAction<{ scenes: Scene[]; layers: Layer[] }[]>>;
    setHistoryIndex: React.Dispatch<React.SetStateAction<number>>;
    videoUrl: string | null;
    title: string;
}

export function useClipOperations(args: UseClipOperationsArgs) {
    const { scenes, setLayers, pushToHistory, setScenes } = args;

    const addLayer = useCallback(() => {
        setLayers(prev => {
            const next = [...prev, { id: `l-${Date.now()}`, name: `Capa ${prev.length + 1}`, clips: [] }];
            pushToHistory(scenes, next);
            return next;
        });
    }, [scenes, pushToHistory, setLayers]);

    const removeLayer = useCallback((id: string) => {
        setLayers(prev => {
            const next = prev.filter(l => l.id !== id);
            pushToHistory(scenes, next);
            return next;
        });
    }, [scenes, pushToHistory, setLayers]);

    const reorderLayers = useCallback((newOrder: string[]) => {
        setLayers(prev => {
            const next = newOrder.map(id => prev.find(l => l.id === id)!).filter(Boolean);
            pushToHistory(scenes, next);
            return next;
        });
    }, [scenes, pushToHistory, setLayers]);

    const addClip = useCallback((layerId: string, clip: Partial<Clip>) => {
        setLayers(prev => {
            const next = prev.map(layer => {
                if (layer.id !== layerId) return layer;
                const type = clip.type || 'video';
                const newClip: Clip = { id: `${type}-${Date.now()}`, type, src: clip.src || '', startFrame: clip.startFrame ?? 0, durationInFrames: clip.durationInFrames ?? 150, x: 50, y: 50, scale: 1, opacity: 1, ...clip };
                return { ...layer, clips: [...layer.clips, newClip] };
            });
            pushToHistory(scenes, next);
            return next;
        });
    }, [scenes, pushToHistory, setLayers]);

    const updateClip = useCallback((id: string, updates: Partial<Clip>) => {
        setLayers(prev => {
            const next = prev.map(layer => ({ ...layer, clips: layer.clips.map(c => c.id === id ? { ...c, ...updates } : c) }));
            if (JSON.stringify(next) !== JSON.stringify(prev)) pushToHistory(scenes, next);
            return next;
        });
    }, [scenes, pushToHistory, setLayers]);

    const deleteClip = useCallback((id: string) => {
        setLayers(prev => {
            const next = prev.map(layer => ({ ...layer, clips: layer.clips.filter(c => c.id !== id) }));
            pushToHistory(scenes, next);
            return next;
        });
    }, [scenes, pushToHistory, setLayers]);

    const splitClip = useCallback((id: string, frame: number) => {
        setLayers(prev => {
            const next = prev.map(layer => {
                const idx = layer.clips.findIndex(c => c.id === id);
                if (idx === -1) return layer;
                const clip = layer.clips[idx];
                if (frame <= clip.startFrame || frame >= clip.startFrame + clip.durationInFrames) return layer;
                const firstHalfDuration = frame - clip.startFrame;
                const secondHalfDuration = clip.durationInFrames - firstHalfDuration;
                const newClip: Clip = { ...clip, id: clip.id + '-split-' + Date.now(), startFrame: frame, durationInFrames: secondHalfDuration, trimStartFrame: (clip.trimStartFrame || 0) + firstHalfDuration };
                const nextClips = [...layer.clips];
                nextClips[idx] = { ...clip, durationInFrames: firstHalfDuration };
                nextClips.splice(idx + 1, 0, newClip);
                return { ...layer, clips: nextClips };
            });
            pushToHistory(scenes, next);
            return next;
        });
    }, [scenes, pushToHistory, setLayers]);

    const moveClip = useCallback((id: string, direction: 'left' | 'right') => {
        setLayers(prev => {
            const next = prev.map(layer => {
                const idx = layer.clips.findIndex(c => c.id === id);
                if (idx === -1) return layer;
                const newIdx = direction === 'left' ? idx - 1 : idx + 1;
                if (newIdx < 0 || newIdx >= layer.clips.length) return layer;
                const nextClips = [...layer.clips];
                [nextClips[idx], nextClips[newIdx]] = [nextClips[newIdx], nextClips[idx]];
                let currentPos = nextClips[0].startFrame;
                const repositioned = nextClips.map(c => { const u = { ...c, startFrame: currentPos }; currentPos += c.durationInFrames; return u; });
                return { ...layer, clips: repositioned };
            });
            pushToHistory(scenes, next);
            return next;
        });
    }, [scenes, pushToHistory, setLayers]);

    const resetProject = useCallback(() => {
        fetch('/api/admin/video/cleanup', { method: 'POST' }).catch(err => console.error('[VideoStudioContext] Cleanup failed:', err));
        setScenes([]);
        setLayers([]);
        args.setTitle('Tech News Summary');
        args.setBgMusicUrl(undefined);
        args.setBgMusicVolume(0.15);
        args.setTransitionSfxUrl(undefined);
        args.setIntroSfxUrl(undefined);
        args.setOutroSfxUrl(undefined);
        args.setNewsCardSfxUrl(undefined);
        args.setNewsFocus('');
        args.setCustomVoiceUrl(undefined);
        args.setSelectedVoice('en-US-AndrewNeural');
        args.setCurrentPhase(1);
        args.setError(null);
        args.setDurationInFrames(1800);
        args.setHistory([]);
        args.setHistoryIndex(-1);
        useStudioStore.getState().resetStore();
        localStorage.removeItem("hostingarena_studio_v2");
        localStorage.removeItem('hostingarena_editor_draft');
        clearAssetCache();
    }, [setScenes, setLayers, args]);

    const handleDownload = useCallback(() => {
        if (!args.videoUrl) return;
        const filename = `${args.title.replace(/\s/g, '_') || 'video'}.mp4`;
        const proxyUrl = `/api/admin/video/download?url=${encodeURIComponent(args.videoUrl)}&filename=${encodeURIComponent(filename)}`;
        const link = document.createElement('a');
        link.href = proxyUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [args.videoUrl, args.title]);

    return { addLayer, removeLayer, reorderLayers, addClip, updateClip, deleteClip, splitClip, moveClip, resetProject, handleDownload };
}
