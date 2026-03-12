import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { AbsoluteFill, useVideoConfig, useCurrentFrame, interpolate, spring, Audio, Img, OffthreadVideo, Sequence, staticFile, prefetch } from 'remotion';
import { ShieldCheck, Zap, Globe, Star, Server, Shield, Cpu } from 'lucide-react';
import { findBestMedia, getImageUrl, getFallbackUrl, getRandomMedia } from './mediaLibrary';

import { Scene, Layer, Clip, MediaSegment as MediaSegmentDef } from '../../types/studio';
import { SyncEngine } from '../../lib/video-sync/SyncEngine';
import { resolveAsset } from '../../lib/video/asset-utils';
import { loadFont as loadOrbitron } from '@remotion/google-fonts/Orbitron';

const { fontFamily: orbitronFamily } = loadOrbitron();

export interface CompositionProps {
    title: string;
    scenes: Scene[];
    layers?: Layer[];
    format: '9:16' | '16:9';
    bgMusicUrl?: string;
    bgMusicVolume?: number;
    transitionSfxUrl?: string;
    outroSfxUrl?: string;
    voiceSpeed?: number;
    baseUrl?: string;
}

// Helper for resolving assets (Moved to asset-utils.ts)

const ClipRenderer: React.FC<{ clip: Clip, format: '9:16' | '16:9', title?: string, baseUrl?: string, transitionSfxUrl?: string }> = ({ clip, format, title, baseUrl, transitionSfxUrl }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig(); // Use actual clip duration
    const clipDuration = clip.durationInFrames;
    const isPreview = !baseUrl;
    const [hasError, setHasError] = useState(false);
    const [fallbackSrc, setFallbackSrc] = useState<string | null>(null);

    const resolvedSrc = useMemo(() => resolveAsset(clip.src, baseUrl), [clip.src, baseUrl]);

    // If the asset fails to load, replace it with a random media item
    const handleAssetError = useCallback(() => {
        if (fallbackSrc) return; // avoid infinite retry loop
        const fallback = getRandomMedia(false); // always fallback to image (more reliable)
        const fbUrl = getImageUrl(fallback, 1920, 1080);
        const resolvedFb = resolveAsset(fbUrl, baseUrl);
        if (resolvedFb) setFallbackSrc(resolvedFb);
    }, [fallbackSrc, baseUrl]);
    
    // v6 Whip Transition Logic (v6 Port)
    const transFrames = 12; 
    const isWhipManual = clip.motionEffect === 'whip-pan';
    
    // Entry Whip
    const entryWhipX = interpolate(frame, [0, transFrames], [format === '9:16' ? -600 : -1000, 0], { extrapolateRight: 'clamp' });
    const entryBlur = interpolate(frame, [0, transFrames], [25, 0], { extrapolateRight: 'clamp' });
    const entryScale = interpolate(frame, [0, transFrames], [0.8, 1], { extrapolateRight: 'clamp' });
    
    // Exit Whip
    const exitWhipX = isWhipManual ? interpolate(frame, [clipDuration - transFrames, clipDuration], [0, format === '9:16' ? 600 : 1000], { extrapolateLeft: 'clamp' }) : 0;
    const exitBlur = isWhipManual ? interpolate(frame, [clipDuration - transFrames, clipDuration], [0, 25], { extrapolateLeft: 'clamp' }) : 0;
    const exitScale = isWhipManual ? interpolate(frame, [clipDuration - transFrames, clipDuration], [1, 1.4], { extrapolateLeft: 'clamp' }) : 1;
    
    const totalWhipX = isWhipManual ? (entryWhipX + exitWhipX) : 0;
    const totalBlur = isWhipManual ? (entryBlur + exitBlur) : 0;

    // v6 SFX Timing
    const sfxOffset = clipDuration - Math.floor(transFrames / 2);
    const resolvedTransitionSfx = transitionSfxUrl;
    const showTransitionSfx = frame >= sfxOffset && frame < sfxOffset + 5 && resolvedTransitionSfx;

    if (!resolvedSrc) return null;

    // Movement Logic
    const vScale = clip.scale ?? 1;
    const vOpacity = clip.opacity ?? 1;
    const vX = clip.x ?? 50;
    const vY = clip.y ?? 50;
    
    // Default Animation (Ken Burns)
    const kenFrames = clipDuration;
    const kbScale = interpolate(frame, [0, kenFrames], [1.1, 1.25]);
    const finalScale = (!clip.motionEffect || clip.motionEffect === 'ken-burns') ? (kbScale * (isWhipManual ? (frame < transFrames ? entryScale : 1) * (frame > clipDuration - transFrames ? exitScale : 1) : 1)) : (isWhipManual ? (frame < transFrames ? entryScale : 1) * (frame > clipDuration - transFrames ? exitScale : 1) : 1);
    const finalTx = totalWhipX;
    
    // Manual Motion Effects
    let manualTransform = '';
    if (clip.motionEffect === 'zoom-in') {
        const zScale = interpolate(frame, [0, clipDuration], [1, 1.3]);
        manualTransform = `scale(${zScale})`;
    } else if (clip.motionEffect === 'zoom-out') {
        const zScale = interpolate(frame, [0, clipDuration], [1.3, 1]);
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

    // Linked SFX — plays at the START of the clip with customizable duration and fade
    const resolvedSfxSrc = clip.sfxUrl ? (resolveAsset(clip.sfxUrl, baseUrl) || clip.sfxUrl) : null;
    const sfxDur = clip.sfxDurationFrames || 30;
    const sfxBaseVol = clip.sfxVolume ?? 0.8;
    const sfxFadeIn = clip.sfxFadeInFrames ?? 0;
    const sfxFadeOut = clip.sfxFadeOutFrames ?? 8;
    
    const sfxElement = resolvedSfxSrc ? (
        <Sequence from={0} durationInFrames={sfxDur}>
            <Audio 
                src={resolvedSfxSrc} 
                volume={(f: number) => {
                    const fadeInVol = sfxFadeIn > 0 ? interpolate(f, [0, sfxFadeIn], [0, sfxBaseVol], { extrapolateRight: 'clamp' }) : sfxBaseVol;
                    const fadeOutVol = sfxFadeOut > 0 ? interpolate(f, [sfxDur - sfxFadeOut, sfxDur], [sfxBaseVol, 0], { extrapolateLeft: 'clamp' }) : sfxBaseVol;
                    return Math.min(fadeInVol, fadeOutVol);
                }}
                pauseWhenBuffering={true}
                acceptableTimeShiftInSeconds={0.5}
                useWebAudioApi={true}
                crossOrigin="anonymous"
            />
        </Sequence>
    ) : null;

    // Transition SFX — plays at the END of the clip (whip-pan transition sound)
    const transitionSfxElement = resolvedTransitionSfx ? (
        <Sequence from={sfxOffset} durationInFrames={clipDuration - sfxOffset}>
            <Audio 
                src={resolveAsset(resolvedTransitionSfx, baseUrl) || ""} 
                volume={0.6} 
                pauseWhenBuffering={true}
                useWebAudioApi={true}
                crossOrigin="anonymous"
            />
        </Sequence>
    ) : null;

    if (clip.type === 'video') {
        return (
            <AbsoluteFill>
                {fallbackSrc ? (
                    <Img src={fallbackSrc} style={styles} />
                ) : (
                    <OffthreadVideo 
                        src={resolvedSrc || ""} 
                        style={styles}
                        muted={true}
                        volume={0}
                        onError={handleAssetError}
                    />
                )}
                {sfxElement}
                {transitionSfxElement}
            </AbsoluteFill>
        );
    }
    return (
        <AbsoluteFill>
            <Img 
                src={fallbackSrc || resolvedSrc || ""} 
                style={styles}
                onError={handleAssetError}
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
    const { fps } = useVideoConfig(); 
    const clipDuration = clip.durationInFrames;

    // Port v6 Whip Transition to Text
    const transFrames = 12;
    const isWhipManual = clip.motionEffect === 'whip-pan' || clip.src === 'news-card';
    const exitWhipX = isWhipManual ? interpolate(frame, [clipDuration - transFrames, clipDuration], [0, format === '9:16' ? 600 : 1000], { extrapolateLeft: 'clamp' }) : 0;
    const exitBlur = isWhipManual ? interpolate(frame, [clipDuration - transFrames, clipDuration], [0, 20], { extrapolateLeft: 'clamp' }) : 0;

    // SFX Timing
    const sfxOffset = clipDuration - Math.floor(transFrames / 2);
    // Removed showTransitionSfx conditional render in favor of Sequence below

    // Linked SFX — plays at the START of the clip with fade
    const resolvedSfxSrc = clip.sfxUrl ? (resolveAsset(clip.sfxUrl, baseUrl) || clip.sfxUrl) : null;
    const sfxDur = clip.sfxDurationFrames || 30;
    const sfxBaseVol = clip.sfxVolume ?? 0.8;
    const sfxFadeIn = clip.sfxFadeInFrames ?? 0;
    const sfxFadeOut = clip.sfxFadeOutFrames ?? 8;
    
    const sfxElement = resolvedSfxSrc ? (
        <Sequence from={0} durationInFrames={sfxDur}>
            <Audio 
                src={resolvedSfxSrc} 
                volume={(f: number) => {
                    const fadeInVol = sfxFadeIn > 0 ? interpolate(f, [0, sfxFadeIn], [0, sfxBaseVol], { extrapolateRight: 'clamp' }) : sfxBaseVol;
                    const fadeOutVol = sfxFadeOut > 0 ? interpolate(f, [sfxDur - sfxFadeOut, sfxDur], [sfxBaseVol, 0], { extrapolateLeft: 'clamp' }) : sfxBaseVol;
                    return Math.min(fadeInVol, fadeOutVol);
                }}
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
                {transitionSfxUrl && (
                    <Sequence from={sfxOffset} durationInFrames={clipDuration - sfxOffset}>
                        <Audio 
                            src={resolveAsset(transitionSfxUrl, baseUrl) || ""} 
                            volume={0.6} 
                            pauseWhenBuffering={true}
                            useWebAudioApi={true}
                            crossOrigin="anonymous"
                        />
                    </Sequence>
                )}
            </AbsoluteFill>
        );
    }
    if (clip.src === 'news-anchor') {
        return null; // Removed — news anchor overlay disabled
    }
    if (clip.src === 'news-lower-third') {
        return (
            <AbsoluteFill>
                <NewsLowerThirdOverlay 
                    headline={clip.title || "LATEST UPDATE"}
                    speech={clip.subtitle || ""}
                    format={format}
                    frame={frame}
                    fps={fps}
                    duration={clip.durationInFrames}
                />
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
    // Entrance Animation
    const entrance = spring({
        frame,
        fps,
        config: { damping: 14, stiffness: 80, mass: 0.9 },
        durationInFrames: 35
    });

    const stagger1 = spring({
        frame: frame - 8,
        fps,
        config: { damping: 12, stiffness: 90 },
    });
    const stagger2 = spring({
        frame: frame - 18,
        fps,
        config: { damping: 12, stiffness: 90 },
    });

    // Exit Animation (last 15 frames)
    const exitStart = Math.max(0, duration - 15);
    const exit = spring({
        frame: frame - exitStart,
        fps,
        config: { damping: 18, stiffness: 100 },
    });

    const isVertical = format === '9:16';

    // Scale up from center
    const opacity = entrance * (1 - exit);
    const scale = interpolate(entrance, [0, 1], [0.85, 1]) * interpolate(exit, [0, 1], [1, 1.15]);

    // Neon accent pulse
    const accentGlow = interpolate(frame % 40, [0, 20, 40], [0.5, 1, 0.5]);

    // Scan line
    const scanY = interpolate(frame % 80, [0, 80], [0, 100]);

    return (
        <AbsoluteFill style={{
            zIndex: 100,
            opacity,
            transform: `scale(${scale})`,
        }}>
            {/* Full-screen dark overlay */}
            <AbsoluteFill style={{
                background: 'radial-gradient(ellipse at 50% 40%, rgba(10, 22, 40, 0.92) 0%, rgba(3, 5, 8, 0.96) 100%)',
                backdropFilter: 'blur(8px)',
            }} />

            {/* Grid Pattern */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `
                    linear-gradient(rgba(0, 212, 255, 0.04) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0, 212, 255, 0.04) 1px, transparent 1px)
                `,
                backgroundSize: '80px 80px',
                pointerEvents: 'none',
            }} />

            {/* Horizontal Scan Line */}
            <div style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: `${scanY}%`,
                height: 2,
                background: `linear-gradient(90deg, transparent, rgba(0, 212, 255, ${0.2 * accentGlow}), transparent)`,
                boxShadow: `0 0 40px rgba(0, 212, 255, ${0.12 * accentGlow})`,
                pointerEvents: 'none',
                zIndex: 5,
            }} />

            {/* Centered Content */}
            <AbsoluteFill style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: isVertical ? '3rem 2rem' : '4rem',
            }}>
                {/* BREAKING Label */}
                <div style={{ 
                    opacity: stagger1, 
                    transform: `translateY(${interpolate(stagger1, [0, 1], [20, 0])}px)`,
                    marginBottom: isVertical ? '1.5rem' : '2rem',
                }}>
                    <div style={{
                        background: 'rgba(0, 212, 255, 0.1)',
                        border: `1px solid rgba(0, 212, 255, ${0.3 * accentGlow})`,
                        borderRadius: '0.5rem',
                        padding: isVertical ? '0.5rem 1.5rem' : '0.6rem 2rem',
                        boxShadow: `0 0 ${20 * accentGlow}px rgba(0, 212, 255, ${0.1 * accentGlow})`,
                    }}>
                        <span style={{
                            fontSize: isVertical ? '1rem' : '1.3rem',
                            fontWeight: 900,
                            color: '#00d4ff',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5em',
                            textShadow: `0 0 20px rgba(0, 212, 255, ${0.5 * accentGlow})`,
                        }}>
                            ● BREAKING
                        </span>
                    </div>
                </div>

                {/* Headline — Large and centered */}
                <div style={{ 
                    opacity: entrance, 
                    transform: `scale(${interpolate(entrance, [0, 1], [0.9, 1])})`,
                    textAlign: 'center',
                    maxWidth: isVertical ? '95%' : '85%',
                }}>
                    <h1 style={{
                        fontSize: isVertical ? '3.5rem' : '5.5rem',
                        fontWeight: 950,
                        margin: 0,
                        color: '#ffffff',
                        lineHeight: 1.05,
                        letterSpacing: '-0.03em',
                        textShadow: '0 6px 30px rgba(0, 0, 0, 0.5)',
                    }}>
                        {headline.toUpperCase()}
                    </h1>
                </div>

                {/* Neon Divider */}
                <div style={{
                    marginTop: isVertical ? '1.5rem' : '2rem',
                    width: interpolate(stagger2, [0, 1], [0, isVertical ? 200 : 400]),
                    height: 3,
                    background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
                    boxShadow: `0 0 20px rgba(0, 212, 255, ${0.5 * accentGlow})`,
                    borderRadius: 4,
                }} />

                {/* Sub-headline */}
                {subHeadline && (
                    <div style={{ 
                        opacity: stagger2, 
                        transform: `translateY(${interpolate(stagger2, [0, 1], [15, 0])}px)`,
                        marginTop: isVertical ? '1.2rem' : '1.5rem',
                        textAlign: 'center',
                        maxWidth: isVertical ? '90%' : '75%',
                    }}>
                        <p style={{
                            fontSize: isVertical ? '1.6rem' : '2rem',
                            fontWeight: 500,
                            margin: 0,
                            color: 'rgba(255, 255, 255, 0.5)',
                            lineHeight: 1.3,
                            letterSpacing: '0.01em',
                        }}>
                            {subHeadline}
                        </p>
                    </div>
                )}
            </AbsoluteFill>

            {/* Bottom Accent Bar */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '5px',
                background: 'linear-gradient(90deg, transparent 5%, #00d4ff 30%, #007aff 50%, #00d4ff 70%, transparent 95%)',
                boxShadow: `0 0 ${25 * accentGlow}px rgba(0, 212, 255, ${0.6 * accentGlow}), 0 -${15 * accentGlow}px ${40 * accentGlow}px rgba(0, 212, 255, ${0.15 * accentGlow})`,
            }} />
        </AbsoluteFill>
    );
};

// NewsAnchorOverlay removed — no longer used.

// ====== NEWS LOWER THIRD OVERLAY (v4 — Broadcast Ticker Style) ======
const NewsLowerThirdOverlay: React.FC<{ 
    headline: string, 
    speech: string, 
    format: '9:16' | '16:9', 
    frame: number, 
    fps: number,
    duration: number
}> = ({ headline, speech, format, frame, fps, duration }) => {
    const isVertical = format === '9:16';
    
    // Entrance Animation (Slide up from bottom)
    const entrance = spring({
        frame,
        fps,
        config: { damping: 14, stiffness: 80, mass: 0.9 },
        durationInFrames: 35
    });

    // Exit Animation (last 15 frames)
    const exitStart = Math.max(0, duration - 15);
    const exit = spring({
        frame: frame - exitStart,
        fps,
        config: { damping: 18, stiffness: 100 },
    });

    const translateY = interpolate(entrance, [0, 1], [150, 0]) + interpolate(exit, [0, 1], [0, 150]);
    const opacity = entrance * (1 - exit);
    
    // Extract first sentence for subtitle
    const firstSentence = speech
        ? (speech.match(/^[^.!?]+[.!?]?/)?.[0] || speech.substring(0, 120)).trim()
        : "";

    // Base dimensions optimized for the layout
    const circleSize = isVertical ? 110 : 150; // VERY large for the logo
    const barHeight = isVertical ? 75 : 95;
    
    // Logo entrance animation (slight rotation and pop)
    const logoPop = spring({
        frame: frame - 10,
        fps,
        config: { damping: 12, stiffness: 100 },
    });
    
    // Continuous animations
    const continuousRotation = (frame * 2) % 360; // Arc spins 2 degrees per frame
    
    // Logo heartbeat pulse (shrinks and returns every 90 frames)
    const pulseCycle = frame % 90;
    const continuousPulse = interpolate(pulseCycle, [0, 10, 20, 90], [1, 0.85, 1, 1], { extrapolateRight: 'clamp' });
    
    return (
        <AbsoluteFill style={{
            justifyContent: 'flex-end',
            alignItems: 'center',
            paddingBottom: isVertical ? '4.125%' : '2.2%', // Increased margin bottom by 10% from 3.75%/2%
            zIndex: 100,
            pointerEvents: 'none'
        }}>
            {/* Main Wrapper Box */}
            <div style={{
                position: 'relative',
                width: isVertical ? '92%' : '84%',
                height: circleSize,
                opacity,
                transform: `translateY(${translateY}px)`,
                display: 'flex',
                alignItems: 'center',
                filter: `drop-shadow(0px 15px 30px rgba(0,0,0,0.4))`
            }}>
                
                {/* ─── RIGHT SLANTED ACCENT LINES ─── */}
                <div style={{
                    position: 'absolute',
                    right: 0,
                    top: (circleSize - barHeight) / 2,
                    height: barHeight,
                    width: 35,
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 5,
                    zIndex: 1,
                }}>
                    <div style={{ width: 6, height: '100%', backgroundColor: '#007aff', transform: 'skewX(-20deg)' }} />
                    <div style={{ width: 4, height: '100%', backgroundColor: '#00d4ff', transform: 'skewX(-20deg)' }} />
                    <div style={{ width: 3, height: '100%', backgroundColor: '#00bfff', transform: 'skewX(-20deg)' }} />
                </div>

                {/* ─── MAIN DARK TEXT BAR ─── */}
                <div style={{
                    position: 'absolute',
                    left: isVertical ? 85 : 140, // Positioned specifically to hide slanted edge just barely under the opaque rim of the circle
                    right: 30, // Stop before the accent lines
                    top: (circleSize - barHeight) / 2,
                    height: barHeight,
                    background: 'linear-gradient(90deg, rgba(16, 24, 40, 0.95) 0%, rgba(20, 30, 50, 0.85) 100%)',
                    backdropFilter: 'blur(16px)',
                    transform: 'skewX(-20deg)', // Slanted edge
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    paddingLeft: isVertical ? 45 : 55, // Adjusted to bring text closer to the circle edge
                    paddingRight: 40,
                    border: '1px solid rgba(0, 212, 255, 0.2)', // Subtle blue glow
                    borderLeft: 'none', // Remove left border so it blends smoothly from the circle
                }}>
                    {/* Top Blue Decorative Line */}
                    <div style={{ position: 'absolute', top: Math.floor(barHeight * 0.08), left: 10, right: 0, height: 2, background: 'linear-gradient(90deg, #00d4ff, transparent)' }} />
                    {/* Bottom Blue Decorative Line */}
                    <div style={{ position: 'absolute', bottom: Math.floor(barHeight * 0.08), left: -10, right: 40, height: 2, background: 'linear-gradient(90deg, #007aff, transparent)' }} />
                    
                    {/* Text Content (un-skewed) */}
                    <div style={{ 
                        transform: 'skewX(20deg)', 
                        display: 'flex', 
                        flexDirection: 'column',
                        justifyContent: 'center',
                        zIndex: 3
                    }}>
                        <span style={{
                            fontSize: isVertical ? 24 : 34,
                            fontWeight: 900,
                            color: '#ffffff',
                            lineHeight: 1.1,
                            textTransform: 'uppercase',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            letterSpacing: '-0.02em',
                            textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                        }}>
                            {headline}
                        </span>
                        {firstSentence && (
                            <span style={{
                                fontSize: isVertical ? 16 : 22,
                                fontWeight: 500,
                                color: '#00d4ff', 
                                lineHeight: 1.2,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                marginTop: 2,
                                textShadow: '0 1px 3px rgba(0,0,0,0.8)'
                            }}>
                                {firstSentence}
                            </span>
                        )}
                    </div>
                </div>

                {/* ─── LEFT CIRCULAR LOGO AREA ─── */}
                <div style={{
                    position: 'absolute',
                    left: isVertical ? 5 : 20,
                    width: circleSize,
                    height: circleSize,
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    {/* Outer Detached Blue Arc - Animates continuously */}
                    <div style={{
                        position: 'absolute',
                        left: -12, top: -12, 
                        width: circleSize + 24, height: circleSize + 24,
                        borderRadius: '50%',
                        border: '4px solid transparent',
                        borderLeftColor: '#007aff',
                        borderBottomColor: '#00d4ff',
                        transform: `rotate(${interpolate(entrance, [0, 1], [-90, 15]) + continuousRotation}deg)`, // Spins continuously
                    }} />

                    {/* Main Inner Circle matching HA colors */}
                    <div style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle at center, rgba(0, 122, 255, 0.4) 0%, rgba(16, 24, 40, 0.95) 100%)',
                        border: '3px solid #000',
                        boxShadow: 'inset 0 0 0 3px rgba(0,212,255,0.5), inset 0 0 0 5px #000, 0 5px 15px rgba(0,0,0,0.5)', 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        transform: `scale(${logoPop * continuousPulse})` // Incorporates periodic shrinking
                    }}>
                        <Img 
                            src={staticFile("/ha-logo.png")} 
                            style={{
                                width: '85%', // Increased significantly from 65% to fill space
                                height: '85%',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.6))'
                            }}
                        />
                    </div>
                </div>
            </div>
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
    outroSfxUrl,
    voiceSpeed = 1,
    baseUrl = '',
}) => {
    const { fps } = useVideoConfig();

    // PREFETCH TRANSITION SFX for stability in production
    useEffect(() => {
        if (transitionSfxUrl) {
            const resolved = resolveAsset(transitionSfxUrl, baseUrl);
            if (resolved && resolved !== 'intro' && resolved !== 'outro') {
                prefetch(resolved);
            }
        }
    }, [transitionSfxUrl, baseUrl]);

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

            {/* Render Layers (Strict NLE Engine - Single Source of Truth) */}
            {renderLayers(layers)}

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
                <Sequence 
                    from={durationInFrames - outroFrames} 
                    durationInFrames={outroFrames} 
                    premountFor={30} 
                    style={{ zIndex: 9999 }} // Force top layer
                >
                    <AbsoluteFill>
                        <OutroSequence format={format} fps={fps} />
                        {outroSfxUrl && (
                            <Audio 
                                src={outroSfxUrl.startsWith('/') ? `${baseUrl}${outroSfxUrl}` : outroSfxUrl} 
                                volume={0.8} 
                            />
                        )}
                    </AbsoluteFill>
                </Sequence>
            )}
        </AbsoluteFill>
    );
};

// ====== INTRO SEQUENCE COMPONENT ======
const IntroSequence: React.FC<{ title: string; format: '9:16' | '16:9'; fps: number }> = ({ title, format, fps }) => {
    const frame = useCurrentFrame();

    const logoScale = spring({ frame, fps, config: { damping: 14, stiffness: 150, mass: 0.7 } });
    const logoPulse = interpolate(frame % 40, [0, 20, 40], [1, 1.03, 1]);
    const titleOpacity = interpolate(frame, [25, 45], [0, 1], { extrapolateRight: 'clamp' });
    const titleY = interpolate(frame, [25, 45], [30, 0], { extrapolateRight: 'clamp' });
    const fadeOut = interpolate(frame, [SyncEngine.getIntroFrames() - 10, SyncEngine.getIntroFrames()], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    // Neon accent pulse
    const neonGlow = interpolate(frame % 50, [0, 25, 50], [0.5, 1, 0.5]);

    // Scan line position
    const scanY = interpolate(frame % 90, [0, 90], [0, 100]);

    // Particles
    const particles = Array.from({ length: 20 }, (_, i) => ({
        x: 5 + (i * 67) % 90,
        y: 5 + (i * 43) % 90,
        delay: i * 2,
        size: 2 + (i % 3) * 2,
    }));

    return (
        <AbsoluteFill style={{
            background: 'radial-gradient(ellipse at 30% 40%, #0a1628 0%, #030508 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: fadeOut,
            zIndex: 50,
        }}>
            {/* Grid Overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `
                    linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px',
                pointerEvents: 'none',
            }} />

            {/* Horizontal Scan Line */}
            <div style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: `${scanY}%`,
                height: 2,
                background: `linear-gradient(90deg, transparent, rgba(0, 212, 255, ${0.15 * neonGlow}), transparent)`,
                boxShadow: `0 0 30px rgba(0, 212, 255, ${0.1 * neonGlow})`,
                pointerEvents: 'none',
                zIndex: 3,
            }} />

            {/* Particles */}
            {particles.map((p, idx) => {
                const particleOpacity = interpolate(
                    frame, [p.delay, p.delay + 12, p.delay + 35], [0, 0.8, 0],
                    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                );
                const particleY = interpolate(frame, [p.delay, p.delay + 35], [p.y, p.y - 20], { extrapolateRight: 'clamp' });
                return (
                    <div key={idx} style={{
                        position: 'absolute',
                        left: `${p.x}%`,
                        top: `${particleY}%`,
                        width: p.size,
                        height: p.size,
                        borderRadius: '50%',
                        background: '#00d4ff',
                        boxShadow: '0 0 12px 4px rgba(0, 212, 255, 0.4)',
                        opacity: particleOpacity,
                        zIndex: 1,
                    }} />
                );
            })}

            {/* Logo Group */}
            <div style={{
                transform: `scale(${logoScale * logoPulse})`,
                display: 'flex',
                alignItems: 'center',
                gap: 25,
                marginBottom: 35,
                position: 'relative',
                overflow: 'hidden',
                padding: '28px 56px',
                borderRadius: 16,
                background: 'rgba(0, 212, 255, 0.04)',
                backdropFilter: 'blur(12px)',
                border: `1px solid rgba(0, 212, 255, ${0.15 * neonGlow})`,
                boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 ${30 * neonGlow}px rgba(0, 212, 255, ${0.08 * neonGlow})`
            }}>
                <Globe size={format === '9:16' ? 65 : 85} color="#00d4ff" style={{ 
                    filter: `drop-shadow(0 0 ${20 * neonGlow}px rgba(0,212,255,0.6))` 
                }} />
                <span style={{
                    fontSize: format === '9:16' ? 46 : 68,
                    fontWeight: 950,
                    color: '#fff',
                    letterSpacing: -1.5,
                    textShadow: '0 8px 30px rgba(0,0,0,0.5)'
                }}>HostingArena</span>
                
                {/* Sweep */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '-150%',
                    width: '300%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.15), transparent)',
                    transform: `translateX(${interpolate(frame % 70, [0, 70], [0, 100])}%) skewX(-25deg)`,
                    pointerEvents: 'none',
                    zIndex: 2
                }} />
            </div>

            {/* Title */}
            <div style={{
                opacity: titleOpacity,
                transform: `translateY(${titleY}px)`,
                maxWidth: '85%',
                textAlign: 'center',
            }}>
                <h1 style={{
                    fontSize: format === '9:16' ? 30 : 42,
                    fontWeight: 800,
                    color: 'rgba(255,255,255,0.85)',
                    lineHeight: 1.2,
                    margin: 0,
                    textShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>{title}</h1>
            </div>

            {/* Neon Divider */}
            <div style={{
                marginTop: 28,
                width: interpolate(frame, [30, 60], [0, format === '9:16' ? 200 : 350], { extrapolateRight: 'clamp' }),
                height: 2,
                background: `linear-gradient(90deg, transparent, #00d4ff, transparent)`,
                boxShadow: `0 0 15px rgba(0, 212, 255, ${0.4 * neonGlow})`,
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

    // Neon accent pulse
    const neonGlow = interpolate(frame % 50, [0, 25, 50], [0.5, 1, 0.5]);
    const scanY = interpolate(frame % 90, [0, 90], [0, 100]);

    return (
        <AbsoluteFill style={{
            background: 'radial-gradient(ellipse at 70% 60%, #0a1628 0%, #030508 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: format === '9:16' ? 50 : 40,
            opacity: fadeIn,
            zIndex: 50,
        }}>
            {/* Grid Overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `
                    linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px',
                pointerEvents: 'none',
            }} />

            {/* Horizontal Scan Line */}
            <div style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: `${scanY}%`,
                height: 2,
                background: `linear-gradient(90deg, transparent, rgba(0, 212, 255, ${0.12 * neonGlow}), transparent)`,
                boxShadow: `0 0 25px rgba(0, 212, 255, ${0.08 * neonGlow})`,
                pointerEvents: 'none',
                zIndex: 3,
            }} />

            {/* Particles */}
            <BackgroundParticles frame={frame} count={18} color="#00d4ff" />

            {/* Logo Group */}
            <div style={{
                transform: `scale(${scaleIn})`,
                display: 'flex',
                alignItems: 'center',
                gap: 20,
            }}>
                <div style={{
                    width: format === '9:16' ? 90 : 110,
                    height: format === '9:16' ? 90 : 110,
                    borderRadius: '20%',
                    background: 'rgba(0, 212, 255, 0.08)',
                    border: `1px solid rgba(0, 212, 255, ${0.2 * neonGlow})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 20px 50px rgba(0, 0, 0, 0.5), 0 0 ${25 * neonGlow}px rgba(0, 212, 255, ${0.12 * neonGlow})`,
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Sweep in Logo */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '200%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.2), transparent)',
                        transform: `translateX(${interpolate(frame % 50, [0, 50], [0, 100])}%) skewX(-20deg)`,
                    }} />
                    <Globe size={format === '9:16' ? 45 : 58} color="#00d4ff" style={{
                        filter: `drop-shadow(0 0 ${15 * neonGlow}px rgba(0,212,255,0.5))`
                    }} />
                </div>
                <span style={{
                    fontSize: format === '9:16' ? 44 : 60,
                    fontWeight: 950,
                    color: '#fff',
                    letterSpacing: '-0.05em',
                    textShadow: '0 10px 35px rgba(0,0,0,0.4)'
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
                    background: 'rgba(0, 212, 255, 0.1)',
                    padding: format === '9:16' ? '22px 56px' : '18px 52px',
                    borderRadius: '1rem',
                    boxShadow: `0 15px 50px rgba(0, 0, 0, 0.4), 0 0 ${20 * neonGlow}px rgba(0, 212, 255, ${0.15 * neonGlow})`,
                    border: `1px solid rgba(0, 212, 255, ${0.3 * neonGlow})`,
                    transform: `scale(${interpolate(frame % 40, [0, 20, 40], [1, 1.04, 1])})`,
                }}>
                    <span style={{
                        fontSize: format === '9:16' ? 26 : 30,
                        fontWeight: 950,
                        color: '#00d4ff',
                        textTransform: 'uppercase',
                        letterSpacing: '0.2em',
                        textShadow: `0 0 15px rgba(0, 212, 255, ${0.4 * neonGlow})`,
                    }}>Visit Site</span>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <span style={{
                        fontSize: format === '9:16' ? 20 : 26,
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontWeight: 700,
                        display: 'block',
                        marginBottom: 6
                    }}>HostingArena.com</span>
                    <span style={{
                        fontSize: format === '9:16' ? 14 : 16,
                        color: 'rgba(0, 212, 255, 0.5)',
                        letterSpacing: '0.15em',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                    }}>PREMIUM CLOUD COMPARISONS</span>
                </div>
            </div>

            {/* Neon Divider */}
            <div style={{
                position: 'absolute',
                bottom: format === '9:16' ? 120 : 80,
                width: interpolate(frame, [25, 55], [0, 240], { extrapolateRight: 'clamp' }),
                height: 2,
                background: `linear-gradient(90deg, transparent, #00d4ff, transparent)`,
                boxShadow: `0 0 15px rgba(0, 212, 255, ${0.3 * neonGlow})`,
                borderRadius: 4,
            }} />
        </AbsoluteFill>
    );
};
