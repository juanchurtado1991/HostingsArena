import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AbsoluteFill, useVideoConfig, useCurrentFrame, interpolate, spring, Audio, Img, OffthreadVideo, Sequence, staticFile, prefetch } from 'remotion';
import { ShieldCheck, Zap, Globe, Star, Server, Shield, Cpu } from 'lucide-react';
import { findBestMedia, getImageUrl, getFallbackUrl } from './mediaLibrary';

import { Scene, Layer, Clip, MediaSegment as MediaSegmentDef } from '../../types/studio';
import { SyncEngine } from '../../lib/video-sync/SyncEngine';
import { resolveAsset } from '../../lib/video/asset-utils';

export interface CompositionProps {
    title: string;
    scenes: Scene[];
    layers?: Layer[];
    format: '9:16' | '16:9';
    bgMusicUrl?: string;
    bgMusicVolume?: number;
    transitionSfxUrl?: string;
    subtitlesEnabled?: boolean;
    voiceSpeed?: number;
    baseUrl?: string;
}

// Helper for resolving assets (Moved to asset-utils.ts)

const ClipRenderer: React.FC<{ clip: Clip, format: '9:16' | '16:9', title?: string, baseUrl?: string, transitionSfxUrl?: string }> = ({ clip, format, title, baseUrl, transitionSfxUrl }) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig(); // Use actual clip duration
    const isPreview = !baseUrl;
    const [hasError, setHasError] = useState(false);

    const resolvedSrc = useMemo(() => resolveAsset(clip.src, baseUrl), [clip.src, baseUrl]);
    
    // v6 Whip Transition Logic (v6 Port)
    const transFrames = 12; 
    const isWhipManual = clip.motionEffect === 'whip-pan';
    
    // Entry Whip
    const entryWhipX = interpolate(frame, [0, transFrames], [format === '9:16' ? -600 : -1000, 0], { extrapolateRight: 'clamp' });
    const entryBlur = interpolate(frame, [0, transFrames], [25, 0], { extrapolateRight: 'clamp' });
    const entryScale = interpolate(frame, [0, transFrames], [0.8, 1], { extrapolateRight: 'clamp' });
    
    // Exit Whip
    const exitWhipX = interpolate(frame, [durationInFrames - transFrames, durationInFrames], [0, format === '9:16' ? 600 : 1000], { extrapolateLeft: 'clamp' });
    const exitBlur = interpolate(frame, [durationInFrames - transFrames, durationInFrames], [0, 25], { extrapolateLeft: 'clamp' });
    const exitScale = interpolate(frame, [durationInFrames - transFrames, durationInFrames], [1, 1.4], { extrapolateLeft: 'clamp' });
    
    const totalWhipX = isWhipManual ? (entryWhipX + exitWhipX) : 0;
    const totalBlur = isWhipManual ? (entryBlur + exitBlur) : 0;

    // v6 SFX Timing
    const sfxOffset = durationInFrames - Math.floor(transFrames / 2);
    const resolvedTransitionSfx = transitionSfxUrl;
    const showTransitionSfx = frame >= sfxOffset && frame < sfxOffset + 5 && resolvedTransitionSfx;

    if (!resolvedSrc) return null;

    // Movement Logic
    const vScale = clip.scale ?? 1;
    const vOpacity = clip.opacity ?? 1;
    const vX = clip.x ?? 50;
    const vY = clip.y ?? 50;
    
    // Default Animation (Ken Burns)
    const kenFrames = durationInFrames;
    const kbScale = interpolate(frame, [0, kenFrames], [1.1, 1.25]);
    const finalScale = (!clip.motionEffect || clip.motionEffect === 'ken-burns') ? (kbScale * (isWhipManual ? (frame < transFrames ? entryScale : 1) * (frame > durationInFrames - transFrames ? exitScale : 1) : 1)) : (isWhipManual ? (frame < transFrames ? entryScale : 1) * (frame > durationInFrames - transFrames ? exitScale : 1) : 1);
    const finalTx = totalWhipX;
    
    // Manual Motion Effects
    let manualTransform = '';
    if (clip.motionEffect === 'zoom-in') {
        const zScale = interpolate(frame, [0, durationInFrames], [1, 1.3]);
        manualTransform = `scale(${zScale})`;
    } else if (clip.motionEffect === 'zoom-out') {
        const zScale = interpolate(frame, [0, durationInFrames], [1.3, 1]);
        manualTransform = `scale(${zScale})`;
    } else if (clip.motionEffect === 'slide-up') {
        const ty = interpolate(frame, [0, 20], [50, 0], { extrapolateRight: 'clamp' });
        manualTransform = `translateY(${ty}px)`;
    } else if (clip.motionEffect === 'slide-down') {
        const ty = interpolate(frame, [0, 20], [-50, 0], { extrapolateRight: 'clamp' });
        manualTransform = `translateY(${ty}px)`;
    } else if (clip.motionEffect === 'glitch') {
        const drift = Math.sin(frame) * (frame % 5 === 0 ? 10 : 0);
        manualTransform = `translateX(${drift}px)`;
    }

    // Relative movement for on-canvas editing
    const left = `${vX}%`;
    const top = `${vY}%`;

    if (clip.src === 'intro') {
        return <IntroSequence title={clip.title || title || "HostingArena"} format={format} fps={fps} />;
    }
    if (clip.src === 'outro') {
        return <OutroSequence format={format} fps={fps} />;
    }

    const styles: React.CSSProperties = {
        position: 'absolute',
        left,
        top,
        width: '100%', 
        height: '100%', 
        objectFit: 'cover', 
        transform: `translate(-50%, -50%) scale(${finalScale * vScale}) translateX(${finalTx}px) ${manualTransform}`,
        filter: totalBlur > 0 ? `blur(${totalBlur}px)` : 'none',
        opacity: vOpacity,
    };

    // Linked SFX — plays at the START of the clip with customizable duration
    const resolvedSfxSrc = clip.sfxUrl ? (resolveAsset(clip.sfxUrl, baseUrl) || clip.sfxUrl) : null;
    
    const sfxElement = resolvedSfxSrc ? (
        <Sequence from={0} durationInFrames={clip.sfxDurationFrames || 30}>
            <Audio 
                src={resolvedSfxSrc} 
                volume={clip.sfxVolume ?? 0.8}
                pauseWhenBuffering={true}
                acceptableTimeShiftInSeconds={0.5}
                useWebAudioApi={true}
                crossOrigin="anonymous"
            />
        </Sequence>
    ) : null;

    // Transition SFX — plays at the END of the clip (whip-pan transition sound)
    const transitionSfxElement = showTransitionSfx && resolvedTransitionSfx ? (
        <Audio src={resolvedTransitionSfx.startsWith('/') ? staticFile(resolvedTransitionSfx.slice(1)) : resolveAsset(resolvedTransitionSfx, baseUrl)!} volume={0.6} />
    ) : null;

    if (clip.type === 'video') {
        return (
            <AbsoluteFill>
                <OffthreadVideo 
                    src={resolveAsset(clip.src, baseUrl) || ""} 
                    style={styles}
                    muted={true}
                    volume={0}
                />
                {sfxElement}
                {transitionSfxElement}
            </AbsoluteFill>
        );
    }
    return (
        <AbsoluteFill>
            <Img 
                src={resolveAsset(clip.src, baseUrl) || ""} 
                style={styles}
                onError={() => setHasError(true)}
            />
            {sfxElement}
            {transitionSfxElement}
        </AbsoluteFill>
    );
};

// Separate ClipRenderer defined above

// Reusable Particle Background Component
const BackgroundParticles: React.FC<{ frame: number, count?: number, color?: string }> = ({ frame, count = 12, color = '#3b82f6' }) => {
    const particles = useMemo(() => Array.from({ length: count }, (_, i) => ({
        x: 10 + (i * 73) % 80,
        y: 10 + (i * 37) % 80,
        delay: i * 5,
        size: 2 + (i % 4) * 2,
    })), [count]);

    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            {particles.map((p, idx) => {
                const particleOpacity = interpolate(
                    frame, [p.delay, p.delay + 15, p.delay + 40], [0, 0.9, 0],
                    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                );
                const particleY = interpolate(frame, [p.delay, p.delay + 40], [p.y, p.y - 15], { extrapolateRight: 'clamp' });
                const particleScale = interpolate(frame, [p.delay, p.delay + 40], [0.6, 1.4], { extrapolateRight: 'clamp' });
                return (
                    <div key={idx} style={{
                        position: 'absolute',
                        left: `${p.x}%`,
                        top: `${particleY}%`,
                        width: p.size,
                        height: p.size,
                        borderRadius: '50%',
                        background: color,
                        boxShadow: `0 0 20px 8px ${color}88`,
                        opacity: particleOpacity,
                        transform: `scale(${particleScale})`,
                        zIndex: 1,
                    }} />
                );
            })}
        </div>
    );
};

// TextRenderer component for professional overlays
const TextRenderer: React.FC<{ clip: Clip, format: "9:16" | "16:9", title?: string, baseUrl?: string, transitionSfxUrl?: string }> = ({ clip, format, title, baseUrl, transitionSfxUrl }) => { 
    const frame = useCurrentFrame(); 
    const { fps, durationInFrames } = useVideoConfig(); 

    // Port v6 Whip Transition to Text
    const transFrames = 12;
    const isWhipManual = clip.motionEffect === 'whip-pan' || clip.src === 'news-card';
    const exitWhipX = isWhipManual ? interpolate(frame, [durationInFrames - transFrames, durationInFrames], [0, format === '9:16' ? 600 : 1000], { extrapolateLeft: 'clamp' }) : 0;
    const exitBlur = isWhipManual ? interpolate(frame, [durationInFrames - transFrames, durationInFrames], [0, 20], { extrapolateLeft: 'clamp' }) : 0;

    // SFX Timing
    const sfxOffset = durationInFrames - Math.floor(transFrames / 2);
    const showTransitionSfx = frame >= sfxOffset && frame < sfxOffset + 5 && transitionSfxUrl;

    // Linked SFX — plays at the START of the clip
    const resolvedSfxSrc = clip.sfxUrl ? (resolveAsset(clip.sfxUrl, baseUrl) || clip.sfxUrl) : null;
    
    const sfxElement = resolvedSfxSrc ? (
        <Sequence from={0} durationInFrames={clip.sfxDurationFrames || 30}>
            <Audio 
                src={resolvedSfxSrc} 
                volume={clip.sfxVolume ?? 0.8}
                pauseWhenBuffering={true}
                acceptableTimeShiftInSeconds={0.5}
            />
        </Sequence>
    ) : null;

    if (clip.src === 'intro') {
        return (
            <AbsoluteFill>
                <IntroSequence title={clip.title || title || "HostingArena"} format={format} fps={fps} />
                {sfxElement}
            </AbsoluteFill>
        );
    }
    if (clip.src === 'outro') {
        return (
            <AbsoluteFill>
                <OutroSequence format={format} fps={fps} />
                {sfxElement}
            </AbsoluteFill>
        );
    }
    if (clip.src === 'news-card') {
        return (
            <AbsoluteFill style={{ 
                transform: `translateX(${exitWhipX}px)`,
                filter: exitBlur > 0 ? `blur(${exitBlur}px)` : 'none'
            }}>
                <NewsTitleCard 
                    headline={clip.title || ""} 
                    subHeadline={clip.subtitle || ""}
                    format={format}
                    frame={frame}
                    fps={fps}
                    duration={clip.durationInFrames}
                />
                {sfxElement}
                {showTransitionSfx && <Audio src={transitionSfxUrl!.startsWith('/') ? staticFile(transitionSfxUrl!.slice(1)) : resolveAsset(transitionSfxUrl, baseUrl)!} volume={0.6} />}
            </AbsoluteFill>
        );
    }

    const opacity = spring({ frame, fps, config: { damping: 12, stiffness: 100 }, durationInFrames: 20 }); 
    const translateY = interpolate(opacity, [0, 1], [30, 0]); 
    return ( 
        <AbsoluteFill style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            zIndex: 100, 
            opacity: opacity,
            transform: `translateY(${translateY}px) translateX(${exitWhipX}px)`,
            filter: exitBlur > 0 ? `blur(${exitBlur}px)` : 'none'
        }}> 
            <div style={{ padding: "1.5rem 3rem", backgroundColor: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(16px)", borderRadius: "0px", border: "1px solid rgba(255, 255, 255, 0.1)", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)", textAlign: "center" }}> 
                <h2 style={{ fontSize: format === "9:16" ? "4rem" : "5rem", fontWeight: 900, margin: 0, background: "linear-gradient(to bottom right, #fff, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", textTransform: "uppercase", letterSpacing: "-0.05em", lineHeight: 1 }}> 
                    {clip.title || clip.src} 
                </h2> 
            </div> 
            {sfxElement}
        </AbsoluteFill> 
    ); 
};

const NewsTitleCard: React.FC<{ 
    headline: string, 
    subHeadline?: string, 
    format: '9:16' | '16:9', 
    frame: number, 
    fps: number,
    duration?: number 
}> = ({ headline, subHeadline, format, frame, fps, duration = 90 }) => {
    // Entrance Animation (0-30 frames)
    const entrance = spring({
        frame,
        fps,
        config: { damping: 15, stiffness: 80, mass: 1 },
        durationInFrames: 35
    });

    // Content Staggering
    const stagger1 = spring({
        frame: frame - 5,
        fps,
        config: { damping: 12, stiffness: 100 },
    });
    const stagger2 = spring({
        frame: frame - 12,
        fps,
        config: { damping: 12, stiffness: 100 },
    });

    // Exit Animation (last 15 frames)
    const exitStart = Math.max(0, duration - 15);
    const exit = spring({
        frame: frame - exitStart,
        fps,
        config: { damping: 20, stiffness: 120 },
    });

    const isVertical = format === '9:16';

    const translateY = interpolate(entrance, [0, 1], [isVertical ? -150 : -100, 0]) + interpolate(exit, [0, 1], [0, 100]);
    const opacity = entrance * (1 - exit);
    const scale = interpolate(entrance, [0, 1], [0.85, 1]) * interpolate(exit, [0, 1], [1, 1.2]);
    const blur = interpolate(exit, [0, 1], [0, 15]);

    return (
        <AbsoluteFill style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            opacity,
            transform: `translateY(${translateY}px) scale(${scale})`,
            filter: blur > 0 ? `blur(${blur}px)` : 'none',
        }}>
            {/* Unified Particle Background - Intense Apple Blue */}
            <BackgroundParticles frame={frame} count={35} color="#007aff" />
            
            <div style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(60px) saturate(200%)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                padding: isVertical ? '3.5rem 2.8rem' : '4.5rem 7rem',
                borderRadius: '2rem',
                boxShadow: `
                    0 50px 120px -30px rgba(0, 0, 0, 0.15),
                    inset 0 0 30px rgba(255, 255, 255, 0.9),
                    0 0 40px rgba(0, 122, 255, ${interpolate(entrance, [0.8, 1], [0, 0.3])}),
                    0 0 ${interpolate(frame % 30, [0, 15, 30], [20, 45, 20])}px rgba(255, 255, 255, 0.4)
                `,
                maxWidth: isVertical ? '88%' : '82%',
                width: 'max-content',
                position: 'relative',
                overflow: 'hidden',
                textAlign: 'center'
            }}>
                {/* Metallic Glass Scanner Sweep */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '-150%',
                    width: '300%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                    transform: `translateX(${interpolate(frame % 45, [0, 45], [0, 100])}%) skewX(-30deg)`,
                    pointerEvents: 'none',
                    zIndex: 2
                }} />

                {/* Left Accent Neon Line */}
                <div style={{
                    position: 'absolute',
                    top: '20%',
                    left: 0,
                    width: '4px',
                    height: '60%',
                    background: 'linear-gradient(to bottom, transparent, #007aff, transparent)',
                    boxShadow: '0 0 20px rgba(0, 122, 255, 0.8)',
                    borderRadius: '0 4px 4px 0'
                }} />

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: isVertical ? '1.5rem' : '1.8rem'
                }}>
                    <div style={{ 
                        opacity: stagger1, 
                        transform: `translateY(${interpolate(stagger1, [0, 1], [25, 0])}px) scale(${interpolate(stagger1, [0, 1], [0.9, 1])})` 
                    }}>
                        <span style={{
                            fontSize: isVertical ? '1.1rem' : '1.3rem',
                            fontWeight: 900,
                            color: '#007aff',
                            textTransform: 'uppercase',
                            letterSpacing: '0.45em',
                            display: 'block',
                            marginBottom: '0.4rem',
                            filter: 'drop-shadow(0 0 10px rgba(0,122,255,0.3))'
                        }}>
                            REAL TIME UPDATE
                        </span>
                    </div>

                    <div style={{ opacity: entrance, transform: `scale(${interpolate(entrance, [0, 1], [0.97, 1])})` }}>
                        <h1 style={{
                            fontSize: isVertical ? '3.5rem' : '5.5rem',
                            fontWeight: 950,
                            margin: 0,
                            color: '#1d1d1f',
                            lineHeight: 1.05,
                            letterSpacing: '-0.04em',
                            background: 'linear-gradient(to bottom, #1d1d1f 60%, #434345 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            {headline.toUpperCase()}
                        </h1>
                    </div>

                    {subHeadline && (
                        <div style={{ opacity: stagger2, transform: `translateY(${interpolate(stagger2, [0, 1], [20, 0])}px)` }}>
                            <p style={{
                                fontSize: isVertical ? '1.6rem' : '2rem',
                                fontWeight: 500,
                                margin: 0,
                                color: 'rgba(0, 0, 0, 0.5)',
                                lineHeight: 1.2,
                                letterSpacing: '0.01em',
                            }}>
                                {subHeadline}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes pulse-bg {
                    0% { background-position: 0% 0%; }
                    50% { background-position: 0% 100%; }
                    100% { background-position: 0% 0%; }
                }
            `}</style>
        </AbsoluteFill>
    );
};

// Unused SceneItem deleted for code cleanup (unified engine used instead)


export const HostingComposition: React.FC<CompositionProps> = ({ 
    title, 
    scenes,
    layers = [],
    format,
    bgMusicUrl = "/assets/bg-music.mp3",
    bgMusicVolume = 0.4,
    transitionSfxUrl = "/assets/click.mp3",
    subtitlesEnabled = true,
    voiceSpeed = 1,
    baseUrl = '',
}) => {
    const { fps, durationInFrames } = useVideoConfig();

    // Calculate dynamic scene timings memoized using SyncEngine
    const sceneTimings = useMemo(() => {
        const introFrames = SyncEngine.getIntroFrames();
        return SyncEngine.calculateTimings(scenes).map(t => ({
            startFrame: t.startFrame - introFrames, 
            durationFrames: t.durationInFrames 
        }));

    }, [scenes]);

    const totalScriptFrames = useMemo(() => 
        sceneTimings.reduce((acc: number, t: any) => acc + t.durationFrames, 0),
    [sceneTimings]);

    // Intro / Outro durations from SyncEngine
    const introFrames = SyncEngine.getIntroFrames();
    const outroFrames = SyncEngine.getOutroFrames();
    const textColor = '#ffffff';

    const frame = useCurrentFrame();

    // DYNAMIC DUCKING ENGINE
    const isVoiceActive = useMemo(() => {
        return layers.some(layer => 
            layer.clips.some(clip => 
                clip.type === 'audio' && 
                frame >= clip.startFrame && 
                frame < clip.startFrame + clip.durationInFrames
            )
        );
    }, [layers, frame]);

    const duckingMultiplier = isVoiceActive ? 0.35 : 1.0;

    const renderLayers = (activeLayers: Layer[]) => {
        const isPreview = !baseUrl;
        return (
            <>
                {activeLayers.map((layer, lIdx) => {
                    if (layer.isVisible === false) return null;
                    
                    const isAudioLayer = layer.clips.some(c => c.type === 'audio' || c.type === 'music' || c.type === 'sfx');
                    
                    if (isAudioLayer) {
                        return (
                            <React.Fragment key={layer.id}>
                                {layer.clips.map((clip) => {
                                    let finalVolume = (clip.volume ?? 1);
                                    
                                    if (clip.type === 'audio') {
                                        finalVolume *= 1.5; 
                                    } else if (clip.type === 'music') {
                                        finalVolume *= duckingMultiplier;
                                    }

                                    const assetUrl = resolveAsset(clip.src, baseUrl)!;

                                    return (
                                        <Sequence 
                                            key={clip.id} 
                                            from={clip.startFrame} 
                                            durationInFrames={clip.durationInFrames}
                                        >
                                            <Audio 
                                                src={assetUrl}
                                                playbackRate={1}
                                                pauseWhenBuffering={true} 
                                                acceptableTimeShiftInSeconds={0.5}
                                                useWebAudioApi={true}
                                                crossOrigin="anonymous"
                                                volume={finalVolume}
                                                loop={clip.type === 'music'}
                                                endAt={clip.type === 'audio' ? clip.durationInFrames : undefined}
                                            />
                                        </Sequence>
                                    );
                                })}
                            </React.Fragment>
                        );
                    }

                    return (
                        <React.Fragment key={layer.id}>
                            {layer.clips.map((clip) => (
                                <Sequence 
                                    key={clip.id} 
                                    from={clip.startFrame} 
                                    durationInFrames={clip.durationInFrames}
                                    premountFor={isPreview ? 60 : 90}
                                >
                                    <AbsoluteFill style={{ 
                                        backgroundColor: 'transparent',
                                        filter: clip.blurEnabled ? 'blur(10px) brightness(0.8)' : 'none',
                                        zIndex: lIdx
                                    }}>
                                        {clip.type === 'overlay' ? (
                                            <TextRenderer clip={clip} format={format} title={title} baseUrl={baseUrl} transitionSfxUrl={transitionSfxUrl} />
                                        ) : (
                                            <ClipRenderer clip={clip} format={format} title={title} baseUrl={baseUrl} transitionSfxUrl={transitionSfxUrl} />
                                        )}
                                    </AbsoluteFill>
                                </Sequence>
                            ))}
                        </React.Fragment>
                    );
                })}
            </>
        );
    };

    const isNLEMode = layers.length > 0;

    // Unify Engine: If not in NLE Mode, create a synthetic layer from scenes
    const unifiedLayers = useMemo(() => {
        if (isNLEMode) return layers;

        // Legacy Phase 2 Conversion: Create a single synthetic layer
        const syntheticClips: Clip[] = [];
        
        // Add Intro
        if (introFrames > 0) {
            syntheticClips.push({
                id: 'legacy-intro',
                type: 'overlay',
                src: 'intro',
                startFrame: 0,
                durationInFrames: introFrames,
                title: title,
                opacity: 1, scale: 1, x: 50, y: 50
            });
        }

        // Add Scenes
        scenes.forEach((scene, i) => {
            const start = introFrames + sceneTimings[i].startFrame;
            const duration = sceneTimings[i].durationFrames;
            
            // Add News Title Card if enabled
            const tcFrames = SyncEngine.secondsToFrames(SyncEngine.TITLE_CARD_SECONDS);
            if (scene.titleCardEnabled) {
                syntheticClips.push({
                    id: `tc-${i}`,
                    type: 'overlay',
                    src: 'news-card',
                    startFrame: start - tcFrames,
                    durationInFrames: tcFrames,
                    title: scene.headline || "Breaking News",
                    subtitle: scene.subHeadline || "",
                    opacity: 1, scale: 1, x: 50, y: 50
                });
            }

            // Port scene to a clip
            syntheticClips.push({
                id: `scene-${i}`,
                type: scene.assetType === 'video' ? 'video' : 'image',
                src: scene.assetUrl || getFallbackUrl(i, format === '9:16' ? 1080 : 1920, format === '9:16' ? 1920 : 1080),
                startFrame: start,
                durationInFrames: duration,
                motionEffect: scene.visualEffect || 'ken-burns',
                opacity: 1, scale: 1, x: 50, y: 50
            });

            // Add Voiceover if exists
            if (scene.voiceUrl) {
                syntheticClips.push({
                    id: `voice-${i}`,
                    type: 'audio',
                    src: scene.voiceUrl,
                    startFrame: start,
                    durationInFrames: duration,
                    volume: 1,
                });
            }
        });

        // Add Outro
        if (outroFrames > 0) {
            syntheticClips.push({
                id: 'legacy-outro',
                type: 'overlay',
                src: 'outro',
                startFrame: introFrames + totalScriptFrames,
                durationInFrames: outroFrames,
                opacity: 1, scale: 1, x: 50, y: 50
            });
        }

        return [{
            id: 'unified-legacy-layer',
            name: 'Main Content',
            clips: syntheticClips,
            isVisible: true
        }];
    }, [isNLEMode, layers, scenes, sceneTimings, title, introFrames, outroFrames, totalScriptFrames, format]);


    return (
        <AbsoluteFill style={{
            color: textColor,
            fontFamily: 'Inter, system-ui, sans-serif',
            overflow: 'hidden',
        }}>
            {/* Persistant Global Background (Lux Dark Blue) */}
            <AbsoluteFill style={{ 
                zIndex: -3, 
                backgroundColor: '#0f1729',
                background: 'radial-gradient(circle at center, #1c2a4d 0%, #050810 100%)' 
            }} />

            {/* Render Layers (Unified Engine) */}
            {renderLayers(unifiedLayers)}

            {/* (Subtitles removed) */}

            {/* 5. Discrete Watermark */}
            <div style={{
                position: 'absolute',
                top: format === '9:16' ? 20 : 16,
                right: format === '9:16' ? 20 : 24,
                zIndex: 15,
                opacity: 0.4,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
            }}>
                <span style={{
                    fontSize: format === '9:16' ? 11 : 14,
                    fontWeight: 800,
                    color: '#6e6e73',
                    letterSpacing: 0.5,
                    textShadow: 'none',
                }}>
                    HostingArena
                </span>
            </div>

            {/* === OUTRO SEQUENCE === */}
            {outroFrames > 0 && (
                <Sequence from={introFrames + totalScriptFrames} durationInFrames={outroFrames} premountFor={30}>
                    <OutroSequence format={format} fps={fps} />
                </Sequence>
            )}
        </AbsoluteFill>
    );
};

// ====== INTRO SEQUENCE COMPONENT ======
const IntroSequence: React.FC<{ title: string; format: '9:16' | '16:9'; fps: number }> = ({ title, format, fps }) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    const logoScale = spring({ frame, fps, config: { damping: 12, stiffness: 180, mass: 0.6 } });
    const logoPulse = interpolate(frame % 30, [0, 15, 30], [1, 1.05, 1]);
    const titleOpacity = interpolate(frame, [30, 50], [0, 1], { extrapolateRight: 'clamp' });
    const titleY = interpolate(frame, [30, 50], [40, 0], { extrapolateRight: 'clamp' });
    const fadeOut = interpolate(frame, [SyncEngine.getIntroFrames() - 10, SyncEngine.getIntroFrames()], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    
    // Shine / Glass Sweep Effect
    const shineX = interpolate(frame, [15, 45], [-200, 600], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    // Extreme Chromatic Flare (v6)
    const flareOpacity = interpolate(frame, [5, 15, 35], [0, 0.6, 0], { extrapolateRight: 'clamp' });
    const flareScale = interpolate(frame, [5, 40], [0.7, 1.8]);

    // Legacy Particle positions (Enhanced)
    const particles = Array.from({ length: 16 }, (_, i) => ({
        x: 10 + (i * 73) % 85,
        y: 10 + (i * 51) % 80,
        delay: i * 2,
        size: 4 + (i % 4) * 2,
    }));

    return (
        <AbsoluteFill style={{
            background: 'radial-gradient(ellipse at center, #1c2a4d 0%, #050810 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: fadeOut,
            zIndex: 50,
        }}>
            {/* Glow particles (Faster/Bolder) */}
            {particles.map((p, idx) => {
                const particleOpacity = interpolate(
                    frame, [p.delay, p.delay + 10, p.delay + 30], [0, 1, 0],
                    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                );
                const particleY = interpolate(frame, [p.delay, p.delay + 30], [p.y, p.y - 25], { extrapolateRight: 'clamp' });
                const particleScale = interpolate(frame, [p.delay, p.delay + 30], [0.5, 1.5], { extrapolateRight: 'clamp' });
                return (
                    <div key={idx} style={{
                        position: 'absolute',
                        left: `${p.x}%`,
                        top: `${particleY}%`,
                        width: p.size,
                        height: p.size,
                        borderRadius: '50%',
                        background: '#007aff',
                        boxShadow: '0 0 20px 8px rgba(0, 122, 255, 0.5)',
                        opacity: particleOpacity,
                        transform: `scale(${particleScale})`,
                        zIndex: 1,
                    }} />
                );
            })}

            {/* Logo Group (Horizontal Original with SHINE & HEARTBEAT) */}
            <div style={{
                transform: `scale(${logoScale * logoPulse})`,
                display: 'flex',
                alignItems: 'center',
                gap: 25,
                marginBottom: 30,
                position: 'relative',
                overflow: 'hidden',
                padding: '24px 48px',
                borderRadius: 24,
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: '0 30px 60px rgba(0,0,0,0.5), inset 0 0 20px rgba(255,255,255,0.02)'
            }}>
                <Globe size={format === '9:16' ? 70 : 90} color="#007aff" style={{ filter: 'drop-shadow(0 0 30px rgba(0,122,255,0.7))' }} />
                <span style={{
                    fontSize: format === '9:16' ? 48 : 72,
                    fontWeight: 950,
                    color: '#fff',
                    letterSpacing: -1.5,
                    textShadow: '0 10px 40px rgba(0,0,0,0.6)'
                }}>HostingArena</span>
                
                {/* Visual Shine Sweep (Glass Scanner) */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '-150%',
                    width: '300%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    transform: `translateX(${interpolate(frame % 60, [0, 60], [0, 100])}%) skewX(-30deg)`,
                    pointerEvents: 'none',
                    zIndex: 2
                }} />
            </div>

            {/* Animated title (Date) */}
            <div style={{
                opacity: titleOpacity,
                transform: `translateY(${titleY}px)`,
                maxWidth: '85%',
                textAlign: 'center',
            }}>
                <h1 style={{
                    fontSize: format === '9:16' ? 32 : 44,
                    fontWeight: 800,
                    color: 'rgba(255,255,255,0.9)',
                    lineHeight: 1.2,
                    margin: 0,
                    textShadow: '0 5px 15px rgba(0,0,0,0.3)'
                }}>{title}</h1>
            </div>

            {/* Subtle line decoration */}
            <div style={{
                marginTop: 30,
                width: interpolate(frame, [30, 60], [0, format === '9:16' ? 240 : 400], { extrapolateRight: 'clamp' }),
                height: 3,
                background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
                borderRadius: 4,
            }} />
        </AbsoluteFill>
    );
};

// ====== OUTRO SEQUENCE COMPONENT ======
const OutroSequence: React.FC<{ format: '9:16' | '16:9'; fps: number }> = ({ format, fps }) => {
    const frame = useCurrentFrame();

    const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
    const scaleIn = spring({ frame, fps, config: { damping: 14, stiffness: 70 } });
    const ctaOpacity = interpolate(frame, [30, 50], [0, 1], { extrapolateRight: 'clamp' });
    const ctaY = interpolate(frame, [30, 50], [20, 0], { extrapolateRight: 'clamp' });

    return (
        <AbsoluteFill style={{
            background: 'radial-gradient(ellipse at center, #1c2a4d 0%, #050810 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: format === '9:16' ? 50 : 40,
            opacity: fadeIn,
            zIndex: 50,
        }}>
            {/* Glow particles (Consistent with Intro) */}
            <BackgroundParticles frame={frame} count={16} color="#3b82f6" />

            {/* Final Logo Group */}
            <div style={{
                transform: `scale(${scaleIn})`,
                display: 'flex',
                alignItems: 'center',
                gap: 20,
            }}>
                <div style={{
                    width: format === '9:16' ? 100 : 120,
                    height: format === '9:16' ? 100 : 120,
                    borderRadius: '24%',
                    background: 'linear-gradient(135deg, #007aff, #0051ff)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 25px 60px rgba(0, 122, 255, 0.6)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Embedded Glass Sweep in Logo */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '200%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                        transform: `translateX(${interpolate(frame % 45, [0, 45], [0, 100])}%) skewX(-20deg)`,
                    }} />
                    <Globe size={format === '9:16' ? 50 : 64} color="#fff" />
                </div>
                <span style={{
                    fontSize: format === '9:16' ? 48 : 64,
                    fontWeight: 950,
                    color: '#fff',
                    letterSpacing: '-0.05em',
                    textShadow: '0 15px 45px rgba(0,0,0,0.4)'
                }}>HostingArena</span>
            </div>

            {/* CTA Section */}
            <div style={{
                opacity: ctaOpacity,
                transform: `translateY(${ctaY}px)`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 24,
            }}>
                <div style={{
                    background: '#007aff',
                    padding: format === '9:16' ? '24px 60px' : '20px 56px',
                    borderRadius: '1.5rem',
                    boxShadow: '0 20px 60px rgba(0, 122, 255, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    transform: `scale(${interpolate(frame % 30, [0, 15, 30], [1, 1.05, 1])})`,
                }}>
                    <span style={{
                        fontSize: format === '9:16' ? 28 : 32,
                        fontWeight: 950,
                        color: '#fff',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                    }}>Visit Site</span>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <span style={{
                        fontSize: format === '9:16' ? 22 : 28,
                        color: 'rgba(255, 255, 255, 0.85)',
                        fontWeight: 700,
                        display: 'block',
                        marginBottom: 6
                    }}>HostingArena.com</span>
                    <span style={{
                        fontSize: format === '9:16' ? 16 : 18,
                        color: 'rgba(255, 255, 255, 0.4)',
                        letterSpacing: '0.1em',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                    }}>PREMIUM CLOUD COMPARISONS</span>
                </div>
            </div>

            {/* Subtle Divider */}
            <div style={{
                position: 'absolute',
                bottom: format === '9:16' ? 120 : 80,
                width: interpolate(frame, [25, 55], [0, 280], { extrapolateRight: 'clamp' }),
                height: 3,
                background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
                borderRadius: 4,
            }} />
        </AbsoluteFill>
    );
};
