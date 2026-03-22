"use client";

import { Player, PlayerRef } from "@remotion/player";
import { prefetch } from "remotion";
import { useEffect, useRef, useMemo, useState, useCallback, memo, forwardRef, useImperativeHandle } from "react";
import { Clock, Sparkles, Film, Mic, Music } from "lucide-react";
import { HostingComposition } from "./composition/HostingComposition";
import { Scene, Layer } from "../../types/studio";
import { SyncEngine } from "../../lib/video-sync/SyncEngine";
import { useStudioStore } from "../../store/useStudioStore";
import { prewarmCache } from "../../lib/video/assetCache";
import { resolveAsset } from "../../lib/video/asset-utils";

export interface VideoPlayerProps {
    title: string;
    scenes: Scene[];
    layers?: Layer[];
    format: '9:16' | '16:9';
    durationInFrames?: number;
    bgMusicUrl?: string;
    bgMusicVolume?: number;
    transitionSfxUrl?: string;
    outroSfxUrl?: string;
    playing?: boolean;
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
    outroSfxUrl,
    playing = false,

    voiceSpeed = 1,
    showSafeAreas = false,
}, ref) => {
    const playerRef = useRef<PlayerRef>(null);
    const setCurrentTime = useStudioStore(s => s.setCurrentTime);
    const setIsPlayingPreview = useStudioStore(s => s.setIsPlayingPreview);

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

    // Downscale Pexels media for faster preview prefetching
    const toPreviewUrl = (url: string): string => {
        try {
            const u = new URL(url);
            // Pexels images: force small dimensions
            if (u.hostname === 'images.pexels.com') {
                u.searchParams.set('auto', 'compress');
                u.searchParams.set('cs', 'tinysrgb');
                u.searchParams.set('w', '640');
                u.searchParams.set('h', '360');
                u.searchParams.set('fit', 'crop');
                return u.toString();
            }
            // Pexels videos: swap HD for SD
            if (u.hostname.includes('pexels.com') && /hd_1920_1080/i.test(u.pathname)) {
                return url.replace(/hd_1920_1080/gi, 'sd_640_360');
            }
        } catch { /* non-URL strings pass through */ }
        return url;
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
                const isSystemClip = clip.src === 'intro' || clip.src === 'outro' || clip.src === 'news-card' || clip.src === 'news-anchor' || clip.src === 'news-lower-third';
                if (clip.src && !isSystemClip) {
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
        // Note: resolveAsset already applies preview downscaling when isPreview=true
        return Array.from(urls)
            .filter(u => u.startsWith('http'));
    }, [sanitizedScenes, sanitizedLayers, bgMusicUrl, transitionSfxUrl]);

    // Prefetch media assets in sequential batches of 3 (non-blocking)
    // Assets load in timeline order so the first scenes can play immediately.
    useEffect(() => {
        if (allMediaUrls.length === 0) return;

        // Free previous prefetch resources
        prefetchFreeRefs.current.forEach(fn => fn());
        prefetchFreeRefs.current = [];

        setIsPrefetching(true);
        setPrefetchProgress(0);
        setPrefetchTotal(allMediaUrls.length);
        setPrefetchDone(0);

        let cancelled = false;
        const freeCallbacks: (() => void)[] = [];

        const prefetchSequential = async () => {
            const BATCH_SIZE = 3;
            let completed = 0;

            // Safety timeout: 30 seconds
            const timeout = setTimeout(() => {
                if (!cancelled) {
                    console.warn('[Prefetch] Safety timeout reached. Forcing unlock.');
                    setIsPrefetching(false);
                }
            }, 30000);

            for (let i = 0; i < allMediaUrls.length; i += BATCH_SIZE) {
                if (cancelled) break;
                const batch = allMediaUrls.slice(i, i + BATCH_SIZE);

                // Download this batch in parallel (small batch = fast)
                await Promise.all(batch.map(async (url) => {
                    if (cancelled) return;
                    try {
                        // 1. Pre-warm the persistent Cache API (survives refresh)
                        const proxyUrl = resolveAsset(url) || url;
                        await prewarmCache(proxyUrl);
                        
                        // 2. Remotion in-memory prefetch (instant thanks to Cache API hit)
                        const { free, waitUntilDone } = prefetch(proxyUrl, {
                            method: 'blob-url',
                        });
                        freeCallbacks.push(free);
                        await waitUntilDone();
                    } catch (e) {
                        console.warn('[Prefetch] Failed:', url, e);
                    } finally {
                        completed++;
                        setPrefetchDone(completed);
                        setPrefetchProgress(Math.round((completed / allMediaUrls.length) * 100));
                    }
                }));
            }

            clearTimeout(timeout);

            if (!cancelled) {
                prefetchFreeRefs.current = freeCallbacks;
                setIsPrefetching(false);
            }
        };

        prefetchSequential();

        return () => {
            cancelled = true;
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

        return () => {
            player.removeEventListener('frameupdate', handleFrameUpdate);
            player.removeEventListener('play', handlePlay);
            player.removeEventListener('pause', handlePause);
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
                // Block spacebar if loading
                if (player && !isPrefetching) {
                    if (player.isPlaying()) player.pause();
                    else player.play();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPrefetching]);

    const inputProps = useMemo(() => ({
        title: title || "Tech News Summary",
        scenes: sanitizedScenes,
        layers: sanitizedLayers,
        format,
        bgMusicUrl: sanitize(bgMusicUrl),
        bgMusicVolume,
        transitionSfxUrl: sanitize(transitionSfxUrl),
        outroSfxUrl: sanitize(outroSfxUrl),
        voiceSpeed,
    }), [title, sanitizedScenes, sanitizedLayers, format, bgMusicUrl, bgMusicVolume, transitionSfxUrl, outroSfxUrl, voiceSpeed]);

    // UI Sync Feedback
    const [isSyncing, setIsSyncing] = useState(false);
    useEffect(() => {
        // Only show "Syncing" if we are not already showing the full splash
        if (!isPrefetching) {
            setIsSyncing(true);
            const timer = setTimeout(() => setIsSyncing(false), 1200);
            return () => clearTimeout(timer);
        }
    }, [inputProps, durationInFrames, isPrefetching]);

    // Pause player if prefetching starts
    useEffect(() => {
        if (isPrefetching) {
            playerRef.current?.pause();
        }
    }, [isPrefetching]);

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
                numberOfSharedAudioTags={30}
                renderLoading={() => (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
                        <div className="w-10 h-10 border-4 border-studio-accent border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            />

            {/* Premium Full-Screen Loading Overlay (Splash Screen) */}
            {isPrefetching && (
                <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-zinc-950/95 backdrop-blur-2xl animate-in fade-in duration-700">
                    <div className="relative w-80 h-80 flex items-center justify-center">
                        {/* Outer rotating ring with multiple layers */}
                        <div className="absolute inset-0 border border-studio-accent/10 rounded-full" />
                        <div className="absolute inset-4 border border-studio-accent/5 rounded-full" />
                        
                        <div 
                            className="absolute inset-0 border-t-2 border-studio-accent rounded-full animate-spin shadow-[0_0_20px_rgba(0,122,255,0.2)]" 
                            style={{ animationDuration: '4s' }}
                        />
                        <div 
                            className="absolute inset-4 border-b-2 border-studio-accent/40 rounded-full animate-spin-slow" 
                            style={{ animationDuration: '8s', animationDirection: 'reverse' }}
                        />
                        
                        {/* Inner status circle */}
                        <div className="flex flex-col items-center justify-center text-center p-8 z-10">
                             <div className="relative mb-6">
                                <div className="w-20 h-20 bg-studio-accent/10 rounded-[2.5rem] flex items-center justify-center border border-studio-accent/20 shadow-2xl">
                                    <Clock className="w-10 h-10 text-studio-accent animate-pulse" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-studio-accent rounded-full flex items-center justify-center border-2 border-zinc-950 shadow-lg animate-bounce">
                                    <Sparkles className="w-3 h-3 text-white" />
                                </div>
                             </div>
                             <span className="text-[11px] font-black uppercase tracking-[0.4em] text-studio-accent mb-2">
                                Synchronization
                             </span>
                             <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-mono font-black text-white tabular-nums tracking-tighter">
                                    {prefetchProgress}
                                </span>
                                <span className="text-lg font-mono font-bold text-studio-accent/60">%</span>
                             </div>
                        </div>
                    </div>

                    <div className="mt-16 w-96 space-y-5 animate-in slide-in-from-bottom-4 duration-1000">
                        <div className="flex justify-between items-end px-1">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest mb-1">
                                    Asset Pipeline
                                </span>
                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest animate-pulse">
                                    Optimizing Buffers...
                                </span>
                            </div>
                            <span className="text-[10px] font-mono font-black text-studio-accent bg-studio-accent/10 px-3 py-1 rounded-full border border-studio-accent/20">
                                {prefetchDone} / {prefetchTotal}
                            </span>
                        </div>
                        
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                            <div 
                                className="h-full bg-gradient-to-r from-studio-accent via-indigo-500 to-studio-accent rounded-full transition-all duration-700 ease-out shadow-[0_0_20px_rgba(0,122,255,0.5)]"
                                style={{ width: `${Math.max(2, prefetchProgress)}%` }}
                            />
                        </div>
                        
                        <div className="flex items-center justify-center gap-6 pt-4 opacity-40">
                             <Film className="w-4 h-4 text-white" />
                             <div className="w-1 h-1 rounded-full bg-white/20" />
                             <Mic className="w-4 h-4 text-white" />
                             <div className="w-1 h-1 rounded-full bg-white/20" />
                             <Music className="w-4 h-4 text-white" />
                        </div>
                    </div>
                    
                    {/* Subtle Brand Footer */}
                    <div className="absolute bottom-16 flex items-center gap-4 opacity-20 hover:opacity-40 transition-opacity">
                        <Sparkles className="w-5 h-5 text-studio-accent" />
                        <span className="text-[11px] font-black uppercase tracking-[0.5em] text-white">HostingArena Video Engine</span>
                    </div>
                </div>
            )}

            {/* Sync Status Toast (Mini) */}
            {(isSyncing && !isPrefetching) && (
                <div className="absolute top-8 left-8 z-[110] animate-in fade-in slide-in-from-top-6 duration-700">
                    <div className="flex items-center gap-4 px-6 py-3.5 bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] group">
                        <div className="relative">
                            <div className="w-2.5 h-2.5 rounded-full bg-studio-accent shadow-[0_0_10px_rgba(0,122,255,0.8)]" />
                            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-studio-accent animate-ping" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">
                                Engine Sync
                            </span>
                            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
                                Refreshing timeline state
                            </span>
                        </div>
                    </div>
                </div>
            )}


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
        </div>
    );
}));

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
