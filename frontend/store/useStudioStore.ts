import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Clip, Layer, Scene } from '../types/studio';

interface UndoableState {
    scenes: Scene[];
    layers: Layer[];
    title: string;
    format: '9:16' | '16:9';
    durationInFrames: number;
}

interface TransientState {
    currentTime: number;
    isPlayingPreview: boolean;
    selectedClipId: string | null;
    isGeneratingVideo: boolean;
    renderProgress: number;
    renderStep: string;
    error: string | null;
    voiceSpeed: number;
    outroSfxUrl?: string;
    bgMusicUrl?: string;
    bgMusicVolume: number;
}

interface StudioState extends UndoableState, TransientState {
    setScenes: (scenes: Scene[]) => void;
    setLayers: (layers: Layer[]) => void;
    updateLayer: (layerId: string, updates: Partial<Layer>) => void;
    updateClip: (clipId: string, updates: Partial<Clip>) => void;
    setTitle: (title: string) => void;
    setFormat: (format: '9:16' | '16:9') => void;
    setDurationInFrames: (duration: number) => void;

    setCurrentTime: (time: number) => void;
    setIsPlayingPreview: (isPlaying: boolean) => void;
    setSelectedClipId: (id: string | null) => void;
    setError: (error: string | null) => void;
    setRenderStatus: (step: string, progress: number) => void;
    setVoiceSpeed: (speed: number) => void;
    setOutroSfxUrl: (url: string | undefined) => void;
    setBgMusicUrl: (url: string | undefined) => void;
    setBgMusicVolume: (volume: number) => void;
    resetStore: () => void;

    history: UndoableState[];
    historyIndex: number;
    undo: () => void;
    redo: () => void;
    pushToHistory: () => void;
}

const initialUndoableState: UndoableState = {
    scenes: [],
    layers: [],
    title: "New Project",
    format: '16:9',
    durationInFrames: 1800,
};

export const useStudioStore = create<StudioState>()(
    subscribeWithSelector((set, get) => ({
        ...initialUndoableState,
        currentTime: 0,
        isPlayingPreview: false,
        selectedClipId: null,
        isGeneratingVideo: false,
        renderProgress: 0,
        renderStep: "",
        error: null,
        voiceSpeed: 1.0,
        outroSfxUrl: undefined,
        bgMusicUrl: undefined,
        bgMusicVolume: 0.15,
        history: [],
        historyIndex: -1,

        setScenes: (scenes) => set({ scenes }),
        setLayers: (layers) => set({ layers }),
        
        updateLayer: (layerId, updates) => set((state) => ({
            layers: state.layers.map(l => l.id === layerId ? { ...l, ...updates } : l)
        })),

        updateClip: (clipId, updates) => set((state) => ({
            layers: state.layers.map(l => ({
                ...l,
                clips: l.clips.map(c => c.id === clipId ? { ...c, ...updates } : c)
            }))
        })),

        setTitle: (title) => set({ title }),
        setFormat: (format) => set({ format }),
        setDurationInFrames: (durationInFrames) => set({ durationInFrames }),

        setCurrentTime: (currentTime) => set({ currentTime }),
        setIsPlayingPreview: (isPlayingPreview) => set({ isPlayingPreview }),
        setSelectedClipId: (selectedClipId) => set({ selectedClipId }),
        setError: (error) => set({ error }),
        setRenderStatus: (renderStep, renderProgress) => set({ renderStep, renderProgress }),
        setVoiceSpeed: (voiceSpeed) => set({ voiceSpeed }),
        setOutroSfxUrl: (outroSfxUrl) => set({ outroSfxUrl }),
        setBgMusicUrl: (bgMusicUrl) => set({ bgMusicUrl }),
        setBgMusicVolume: (bgMusicVolume) => set({ bgMusicVolume }),
        resetStore: () => {
            set({
                ...initialUndoableState,
                currentTime: 0,
                isPlayingPreview: false,
                selectedClipId: null,
                voiceSpeed: 1.0,
                isGeneratingVideo: false,
                renderProgress: 0,
                renderStep: "",
                error: null,
                history: [],
                historyIndex: -1,
            });
        },

        pushToHistory: () => {
            const { scenes, layers, title, format, durationInFrames, history, historyIndex } = get();
            const newState: UndoableState = { scenes, layers, title, format, durationInFrames };
            
            if (historyIndex >= 0) {
                const lastState = history[historyIndex];
                if (JSON.stringify(lastState) === JSON.stringify(newState)) return;
            }

            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push(JSON.parse(JSON.stringify(newState)));
            
            set({
                history: newHistory.slice(-50),
                historyIndex: Math.min(newHistory.length - 1, 49)
            });
        },

        undo: () => {
            const { history, historyIndex } = get();
            if (historyIndex <= 0) return;
            
            const prevState = history[historyIndex - 1];
            set({
                ...prevState,
                historyIndex: historyIndex - 1
            });
        },

        redo: () => {
            const { history, historyIndex } = get();
            if (historyIndex >= history.length - 1) return;
            
            const nextState = history[historyIndex + 1];
            set({
                ...nextState,
                historyIndex: historyIndex + 1
            });
        }
    }))
);
