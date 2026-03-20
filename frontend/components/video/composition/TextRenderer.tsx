import React from 'react';
import { AbsoluteFill, useVideoConfig, useCurrentFrame, interpolate, spring, Audio, Sequence } from 'remotion';
import { Clip } from '../../../types/studio';
import { resolveAsset } from '../../../lib/video/asset-utils';
import { IntroSequence, OutroSequence } from './IntroOutroSequences';
import { NewsTitleCard } from './NewsTitleCard';
import { NewsLowerThirdOverlay } from './NewsTitleCard';

export const TextRenderer: React.FC<{ clip: Clip, format: "9:16" | "16:9", title?: string, baseUrl?: string, transitionSfxUrl?: string }> = ({ clip, format, title, baseUrl, transitionSfxUrl }) => { 
    const isPreview = !baseUrl;
    const frame = useCurrentFrame(); 
    const { fps } = useVideoConfig(); 
    const clipDuration = clip.durationInFrames;

    const transFrames = 12;
    const isWhipManual = clip.motionEffect === 'whip-pan' || clip.src === 'news-card';
    const exitWhipX = isWhipManual ? interpolate(frame, [clipDuration - transFrames, clipDuration], [0, format === '9:16' ? 600 : 1000], { extrapolateLeft: 'clamp' }) : 0;
    const exitBlur = isWhipManual ? interpolate(frame, [clipDuration - transFrames, clipDuration], [0, 20], { extrapolateLeft: 'clamp' }) : 0;

    const resolvedSfxSrc = clip.sfxUrl ? (resolveAsset(clip.sfxUrl, baseUrl) || clip.sfxUrl) : null;
    const sfxDur = clip.sfxDurationFrames || 30;
    const sfxBaseVol = clip.sfxVolume ?? 0.8;
    const sfxFadeIn = clip.sfxFadeInFrames ?? 0;
    const sfxFadeOut = clip.sfxFadeOutFrames ?? 8;
    
    const sfxElement = resolvedSfxSrc ? (
        <Sequence from={0} durationInFrames={sfxDur} premountFor={60}>
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

    if (clip.src === 'intro') {
        return (
            <AbsoluteFill>
                <IntroSequence title={clip.title || title || "HostingArena"} format={format} fps={fps} baseUrl={baseUrl} />
                {sfxElement}
            </AbsoluteFill>
        );
    }
    if (clip.src === 'outro') {
        return (
            <AbsoluteFill>
                <OutroSequence format={format} fps={fps} baseUrl={baseUrl} />
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
            </AbsoluteFill>
        );
    }
    if (clip.src === 'news-anchor') {
        return null;
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
                    baseUrl={baseUrl}
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
