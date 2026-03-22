import { useState, useCallback } from 'react';
import type { StudioPreset } from '@/contexts/video-studio/types';

const PRESETS_KEY = 'ha_studio_presets_v1';

function loadPresets(): StudioPreset[] {
    try {
        const raw = localStorage.getItem(PRESETS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function savePresetsToStorage(presets: StudioPreset[]) {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
}

interface UsePresetsProps {
    selectedVoice: string;
    voiceSpeed: number;
    bgMusicUrl?: string;
    bgMusicVolume: number;
    introSfxUrl?: string;
    outroSfxUrl?: string;
    newsCardSfxUrl?: string;
    introDuration: number;
    newsCardDuration: number;
    outroDuration: number;
    setSelectedVoice: (v: string) => void;
    setVoiceSpeed: (v: number) => void;
    setBgMusicUrl: (v: string | undefined) => void;
    setBgMusicVolume: (v: number) => void;
    setIntroSfxUrl: (v: string | undefined) => void;
    setOutroSfxUrl: (v: string | undefined) => void;
    setNewsCardSfxUrl: (v: string | undefined) => void;
    setIntroDuration: (v: number) => void;
    setNewsCardDuration: (v: number) => void;
    setOutroDuration: (v: number) => void;
}

export function usePresets(props: UsePresetsProps) {
    const [presets, setPresets] = useState<StudioPreset[]>(() => loadPresets());

    const savePreset = useCallback((name: string) => {
        const preset: StudioPreset = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2),
            name,
            createdAt: Date.now(),
            selectedVoice: props.selectedVoice,
            voiceSpeed: props.voiceSpeed,
            bgMusicUrl: props.bgMusicUrl,
            bgMusicVolume: props.bgMusicVolume,
            introSfxUrl: props.introSfxUrl,
            outroSfxUrl: props.outroSfxUrl,
            newsCardSfxUrl: props.newsCardSfxUrl,
            introDuration: props.introDuration,
            newsCardDuration: props.newsCardDuration,
            outroDuration: props.outroDuration,
        };
        const updated = [preset, ...presets];
        setPresets(updated);
        savePresetsToStorage(updated);
        return preset;
    }, [presets, props]);

    const loadPreset = useCallback((preset: StudioPreset) => {
        props.setSelectedVoice(preset.selectedVoice);
        props.setVoiceSpeed(preset.voiceSpeed);
        props.setBgMusicUrl(preset.bgMusicUrl);
        props.setBgMusicVolume(preset.bgMusicVolume);
        props.setIntroSfxUrl(preset.introSfxUrl);
        props.setOutroSfxUrl(preset.outroSfxUrl);
        props.setNewsCardSfxUrl(preset.newsCardSfxUrl);
        props.setIntroDuration(preset.introDuration);
        props.setNewsCardDuration(preset.newsCardDuration);
        props.setOutroDuration(preset.outroDuration);
    }, [props]);

    const deletePreset = useCallback((id: string) => {
        const updated = presets.filter(p => p.id !== id);
        setPresets(updated);
        savePresetsToStorage(updated);
    }, [presets]);

    const renamePreset = useCallback((id: string, name: string) => {
        const updated = presets.map(p => p.id === id ? { ...p, name } : p);
        setPresets(updated);
        savePresetsToStorage(updated);
    }, [presets]);

    return { presets, savePreset, loadPreset, deletePreset, renamePreset };
}
