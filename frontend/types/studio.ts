export interface MediaSegment {
    id: string;
    source: 'library' | 'upload' | 'random';
    type: 'image' | 'video';
    url: string;
    libraryIndex?: number;
    durationPct: number;
    motionEffect?: 'ken-burns' | 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right' | 'whip' | 'glitch' | 'bounce' | 'drift' | 'fade' | 'static' | 'none';
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
    pan?: number; 
    blurEnabled?: boolean;
    sceneReferenceId?: string;
    x?: number;
    y?: number;
    scale?: number;
    opacity?: number;
    subtitle?: string;
    subtitleSize?: number;
    sfxUrl?: string;
    sfxDurationFrames?: number; // How many frames to play the SFX (default: 30 = 1 sec at 30fps)
    sfxVolume?: number; // 0.0 to 1.0 (default: 0.8)
    sfxFadeInFrames?: number;  // 0..sfxDurationFrames (default: 0)
    sfxFadeOutFrames?: number; // 0..sfxDurationFrames (default: 8)
}

export interface Layer {
    id: string;
    name: string;
    clips: Clip[];
    isVisible?: boolean;
    isLocked?: boolean;
}

export interface Scene {
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
    transitionSfx?: 'swoosh' | 'whoosh' | 'bass-drop' | 'click' | 'custom' | 'glitch' | 'none';
    customSfxUrl?: string;
    extraLayers?: {
        url: string,
        type: 'image' | 'video',
        x: number,
        y: number,
        scale: number,
        opacity: number,
        width?: number,
        height?: number,
        animation?: 'fade' | 'slide-up' | 'scale' | 'none'
    }[];
    blurEnabled?: boolean;
    visualEffect?: 'ken-burns' | 'static' | 'zoom' | 'pan' | 'whip-pan' | 'glitch' | 'bounce-zoom' | 'drift';
    titleCardEnabled?: boolean;
    headline?: string;
    subHeadline?: string;
    displayHeadline?: string;
    voiceSpeed?: number;
}
