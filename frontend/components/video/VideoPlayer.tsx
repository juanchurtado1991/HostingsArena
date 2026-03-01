"use client";

import { Player, PlayerRef } from "@remotion/player";
import { prefetch } from "remotion";
import { useEffect, useRef, useMemo, useState, useCallback, memo, forwardRef, useImperativeHandle } from "react";
import { HostingComposition } from "./Composition";
import { Scene, Layer } from "../../types/studio";
import { SyncEngine } from "../../lib/video-sync/SyncEngine";
import { useStudioStore } from "../../store/useStudioStore";

export interface VideoPlayerProps {
    title: string;
    scenes: Scene[];
    layers?: Layer[];
    format: '9:16' | '16:9';
    durationInFrames?: number;
    bgMusicUrl?: string;
    bgMusicVolume?: number;
    transitionSfxUrl?: string;
    playing?: boolean;
    subtitlesEnabled?: boolean;
    voiceSpeed?: number;
    showSafeAreas?: boolean;
    // Note: currentTime y onTimeUpdate se manejan vía Zustand para evitar re-renders.
}

export const VideoPlayer = memo(forwardRef<PlayerRef, VideoPlayerProps>(({ 
    title, 
    scenes, 
    layers = [],
    format,
    durationInFrames = 1800,
    bgMusicUrl,
    bgMusicVolume = 0.15,
    transitionSfxUrl,
    playing = false,
    subtitlesEnabled = true,
    voiceSpeed = 1,
    showSafeAreas = false,
}, ref) => {
    const playerRef = useRef<PlayerRef>(null);
    const setCurrentTime = useStudioStore(s => s.setCurrentTime);
    const setIsPlayingPreview = useStudioStore(s => s.setIsPlayingPreview);
    const [isBuffering, setIsBuffering] = useState(false);

    // Prefetch State
    const [isPrefetching, setIsPrefetching] = useState(false);
    const [prefetchProgress, setPrefetchProgress] = useState(0);
    const [prefetchTotal, setPrefetchTotal] = useState(0);
    const [prefetchDone, setPrefetchDone] = useState(0);
    const prefetchFreeRefs = useRef<(() => void)[]>([]);

    // Expose internal player ref to parents if needed
    useImperativeHandle(ref, () => playerRef.current!);

    // Sanitize paths for browser preview
    const sanitize = (url?: string) => {
        if (!url) return undefined;
        const normalizedUrl = url.replace(/\\/g, '/');
        if (normalizedUrl.startsWith("http") || normalizedUrl.startsWith("blob:") || normalizedUrl.startsWith("data:") || normalizedUrl.startsWith("/")) {
            return normalizedUrl;
        }
        if (normalizedUrl.includes("/public/")) return "/" + normalizedUrl.split("/public/").pop();
        if (normalizedUrl.startsWith("public/")) return "/" + normalizedUrl.replace("public/", "");
        return normalizedUrl;
    };

    const sanitizedScenes = useMemo(() => 
        scenes.map(s => ({ ...s, voiceUrl: sanitize(s.voiceUrl) })),
    [scenes]);

    const sanitizedLayers = useMemo(() => {
        return layers.map(layer => ({
            ...layer,
            clips: layer.clips.map(clip => ({
                ...clip,
                src: sanitize(clip.src) || clip.src
            }))
        }));
    }, [layers]);

    // Collect all unique media URLs for prefetch
    const allMediaUrls = useMemo(() => {
        const urls = new Set<string>();

        // From scenes
        sanitizedScenes.forEach(s => {
            if (s.assetUrl) urls.add(s.assetUrl);
            if (s.voiceUrl) urls.add(s.voiceUrl);
        });

        // From layers
        sanitizedLayers.forEach(layer => {
            layer.clips.forEach(clip => {
                if (clip.src && clip.src !== 'intro' && clip.src !== 'outro' && clip.src !== 'news-card') {
                    urls.add(clip.src);
                }
                if (clip.sfxUrl) urls.add(clip.sfxUrl);
            });
        });

        // Background music & SFX
        const bgMusic = sanitize(bgMusicUrl);
        if (bgMusic) urls.add(bgMusic);
        const sfx = sanitize(transitionSfxUrl);
        if (sfx) urls.add(sfx);

        // Only include remote URLs (http/https) — local files don't need prefetch
        return Array.from(urls).filter(u => u.startsWith('http'));
    }, [sanitizedScenes, sanitizedLayers, bgMusicUrl, transitionSfxUrl]);

    // Prefetch all media assets
    useEffect(() => {
        if (allMediaUrls.length === 0) return;

        // Free previous prefetch resources
        prefetchFreeRefs.current.forEach(fn => fn());
        prefetchFreeRefs.current = [];

        setIsPrefetching(true);
        setPrefetchProgress(0);
        setPrefetchTotal(allMediaUrls.length);
        setPrefetchDone(0);

        let completed = 0;
        const freeCallbacks: (() => void)[] = [];

        const prefetchAll = async () => {
            const promises = allMediaUrls.map(async (url) => {
                try {
                    const { free, waitUntilDone } = prefetch(url, {
                        method: 'blob-url',
                    });
                    freeCallbacks.push(free);
                    await waitUntilDone();
                } catch (e) {
                    // Silently fail for individual assets (CORS issues, etc.)
                    console.warn('[Prefetch] Failed:', url, e);
                } finally {
                    completed++;
                    setPrefetchDone(completed);
                    setPrefetchProgress(Math.round((completed / allMediaUrls.length) * 100));
                }
            });

            await Promise.all(promises);
            prefetchFreeRefs.current = freeCallbacks;
            setIsPrefetching(false);
        };

        prefetchAll();

        return () => {
            freeCallbacks.forEach(fn => fn());
        };
    }, [allMediaUrls]);

    const currentTime = useStudioStore(s => s.currentTime);

    // Handle Incoming Seek Requests (from Store to Player)
    useEffect(() => {
        const player = playerRef.current;
        if (!player) return;
        
        // CRITICAL: If the player is playing, IT is the master of time. 
        // Do NOT seek back to the store's time while playing to avoid infinite loops.
        if (player.isPlaying()) return;

        const playerFrame = player.getCurrentFrame();
        const targetFrame = Math.round(currentTime * SyncEngine.FPS);

        // Only seek if the drift exists to avoid micro-feedback
        if (Math.abs(playerFrame - targetFrame) >= 1) {
            player.seekTo(targetFrame);
        }
    }, [currentTime]); // React to store's currentTime changes

    // Handle Playback Status Sync
    useEffect(() => {
        const player = playerRef.current;
        if (!player) return;

        if (playing) player.play();
        else player.pause();
    }, [playing]);

    // Frame Update Listener (Direct store update, bypasses parent re-render)
    useEffect(() => {
        const player = playerRef.current;
        if (!player) return;

        const handleFrameUpdate = (e: any) => {
            const frame = e.detail.frame;
            const playerTime = frame / SyncEngine.FPS;
            
            // Only update store if the player is playing (master mode)
            // or if the drift is large enough that it's clearly a manual player seek (e.g. click on player)
            if (player.isPlaying()) {
                setCurrentTime(playerTime);
            }
        };

        const handlePlay = () => setIsPlayingPreview(true);
        const handlePause = () => setIsPlayingPreview(false);

        player.addEventListener('frameupdate', handleFrameUpdate);
        player.addEventListener('play', handlePlay);
        player.addEventListener('pause', handlePause);
        player.addEventListener('waiting', () => setIsBuffering(true));
        player.addEventListener('resume', () => setIsBuffering(false));

        return () => {
            player.removeEventListener('frameupdate', handleFrameUpdate);
            player.removeEventListener('play', handlePlay);
            player.removeEventListener('pause', handlePause);
            player.removeEventListener('waiting', () => setIsBuffering(true));
            player.removeEventListener('resume', () => setIsBuffering(false));
        };
    }, [setCurrentTime, setIsPlayingPreview]);

    // Spacebar Hotkey
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

            if (e.code === 'Space') {
                e.preventDefault();
                const player = playerRef.current;
                if (player) {
                    if (player.isPlaying()) player.pause();
                    else player.play();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const inputProps = useMemo(() => ({
        title: title || "Tech News Summary",
        scenes: sanitizedScenes,
        layers: sanitizedLayers,
        format,
        bgMusicUrl: sanitize(bgMusicUrl),
        bgMusicVolume,
        transitionSfxUrl: sanitize(transitionSfxUrl),
        subtitlesEnabled,
        voiceSpeed,
    }), [title, sanitizedScenes, sanitizedLayers, format, bgMusicUrl, bgMusicVolume, transitionSfxUrl, subtitlesEnabled, voiceSpeed]);

    return (
        <div className="w-full h-full rounded-none overflow-hidden shadow-2xl relative bg-black">
            <Player
                ref={playerRef}
                component={HostingComposition}
                acknowledgeRemotionLicense
                durationInFrames={durationInFrames}
                fps={SyncEngine.FPS}
                compositionWidth={format === '9:16' ? 1080 : 1920}
                compositionHeight={format === '9:16' ? 1920 : 1080}
                style={{ width: '100%', height: '100%' }}
                inputProps={inputProps}
                controls={false}
                clickToPlay={false}
                loop={false}
                numberOfSharedAudioTags={20}
                renderLoading={() => (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
                        <div className="w-10 h-10 border-4 border-studio-accent border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            />

            {/* Guides Layer */}
            {showSafeAreas && (
                <div className="absolute inset-0 pointer-events-none z-50">
                    <div className="absolute inset-[5%] border border-white/10 rounded-sm" />
                    <div className="absolute inset-[10%] border border-studio-accent/20 rounded-sm" />
                    {format === '9:16' && (
                        <div className="absolute inset-x-0 bottom-[15%] h-[15%] border-t border-dashed border-red-500/20 bg-red-500/5" />
                    )}
                </div>
            )}

            {/* Prefetch Progress Overlay */}
            {isPrefetching && (
                <div className="absolute inset-0 z-[95] flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl pointer-events-none">
                    <div className="flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-500">
                        {/* Animated Icon */}
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full border-[3px] border-white/5 flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full border-[3px] border-studio-accent/30 border-t-studio-accent animate-spin" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-studio-accent text-white text-[9px] font-black rounded-full w-8 h-8 flex items-center justify-center shadow-lg shadow-studio-accent/40">
                                {prefetchProgress}%
                            </div>
                        </div>

                        {/* Text */}
                        <div className="text-center space-y-2">
                            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/80">
                                Caching Media Assets
                            </p>
                            <p className="text-[10px] font-medium text-white/30 tracking-wider">
                                {prefetchDone} / {prefetchTotal} resources loaded
                            </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-studio-accent to-blue-400 rounded-full transition-all duration-300 ease-out shadow-[0_0_15px_rgba(0,122,255,0.5)]"
                                style={{ width: `${prefetchProgress}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Buffering Overlay */}
            {isBuffering && !isPrefetching && (
                <div className="absolute inset-0 z-[90] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md pointer-events-none">
                    <div className="flex flex-col items-center gap-6">
                        <div className="w-12 h-12 border-[3px] border-white/10 border-t-studio-accent rounded-full animate-spin" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/50">Caching Media…</span>
                        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-studio-accent rounded-full animate-[buffer_2s_ease-in-out_infinite]" 
                                 style={{ animation: 'buffer 2s ease-in-out infinite' }} />
                        </div>
                    </div>
                    <style>{`
                        @keyframes buffer {
                            0% { width: 0%; margin-left: 0%; }
                            50% { width: 60%; margin-left: 20%; }
                            100% { width: 0%; margin-left: 100%; }
                        }
                    `}</style>
                </div>
            )}
        </div>
    );
}));

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
