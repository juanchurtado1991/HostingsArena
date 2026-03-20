import React, { useState, useMemo, useCallback } from 'react';
import { AbsoluteFill, useVideoConfig, useCurrentFrame, interpolate, Audio, Img, Video, OffthreadVideo, Sequence } from 'remotion';
import { getImageUrl, getRandomMedia } from '../mediaLibrary';
import { Clip } from '../../../types/studio';
import { resolveAsset } from '../../../lib/video/asset-utils';
import { IntroSequence, OutroSequence } from './IntroOutroSequences';

export const ClipRenderer: React.FC<{ clip: Clip, format: '9:16' | '16:9', title?: string, baseUrl?: string, transitionSfxUrl?: string }> = ({ clip, format, title, baseUrl, transitionSfxUrl }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const clipDuration = clip.durationInFrames;
    const isPreview = !baseUrl;
    const [hasError, setHasError] = useState(false);
    const [fallbackSrc, setFallbackSrc] = useState<string | null>(null);

    const resolvedSrc = useMemo(() => resolveAsset(clip.src, baseUrl), [clip.src, baseUrl]);

    const handleAssetError = useCallback(() => {
        if (fallbackSrc) return;
        const fallback = getRandomMedia(false);
        const fbUrl = getImageUrl(fallback, 1920, 1080);
        const resolvedFb = resolveAsset(fbUrl, baseUrl);
        if (resolvedFb) setFallbackSrc(resolvedFb);
    }, [fallbackSrc, baseUrl]);
    
    const transFrames = 12; 
    const isWhipManual = clip.motionEffect === 'whip-pan';
    
    const entryWhipX = interpolate(frame, [0, transFrames], [format === '9:16' ? -600 : -1000, 0], { extrapolateRight: 'clamp' });
    const entryBlur = interpolate(frame, [0, transFrames], [25, 0], { extrapolateRight: 'clamp' });
    const entryScale = interpolate(frame, [0, transFrames], [0.8, 1], { extrapolateRight: 'clamp' });
    
    const exitWhipX = isWhipManual ? interpolate(frame, [clipDuration - transFrames, clipDuration], [0, format === '9:16' ? 600 : 1000], { extrapolateLeft: 'clamp' }) : 0;
    const exitBlur = isWhipManual ? interpolate(frame, [clipDuration - transFrames, clipDuration], [0, 25], { extrapolateLeft: 'clamp' }) : 0;
    const exitScale = isWhipManual ? interpolate(frame, [clipDuration - transFrames, clipDuration], [1, 1.4], { extrapolateLeft: 'clamp' }) : 1;
    
    const totalWhipX = isWhipManual ? (entryWhipX + exitWhipX) : 0;
    const totalBlur = isWhipManual ? (entryBlur + exitBlur) : 0;

    const sfxOffset = clipDuration - Math.floor(transFrames / 2);
    const resolvedTransitionSfx = transitionSfxUrl;
    const showTransitionSfx = frame >= sfxOffset && frame < sfxOffset + 5 && resolvedTransitionSfx;

    if (!resolvedSrc) return null;

    const vScale = clip.scale ?? 1;
    const vOpacity = clip.opacity ?? 1;
    const vX = clip.x ?? 50;
    const vY = clip.y ?? 50;
    
    const kenFrames = clipDuration;
    const kbScale = interpolate(frame, [0, kenFrames], [1.1, 1.25]);
    const finalScale = (!clip.motionEffect || clip.motionEffect === 'ken-burns') ? (kbScale * (isWhipManual ? (frame < transFrames ? entryScale : 1) * (frame > clipDuration - transFrames ? exitScale : 1) : 1)) : (isWhipManual ? (frame < transFrames ? entryScale : 1) * (frame > clipDuration - transFrames ? exitScale : 1) : 1);
    const finalTx = totalWhipX;
    
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

    const left = `${vX}%`;
    const top = `${vY}%`;

    if (clip.src === 'intro') {
        return <IntroSequence title={clip.title || title || "HostingArena"} format={format} fps={fps} baseUrl={baseUrl} />;
    }
    if (clip.src === 'outro') {
        return <OutroSequence format={format} fps={fps} baseUrl={baseUrl} />;
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


    if (clip.type === 'video') {
        return (
            <AbsoluteFill>
                {fallbackSrc ? (
                    <Img src={fallbackSrc} style={styles} />
                ) : isPreview ? (
                    <Video 
                        src={resolvedSrc || ""} 
                        style={styles}
                        muted={true}
                        volume={0}
                        onCanPlay={() => console.log(`[VideoLoader] Preview Video Ready: ${resolvedSrc}`)}
                        onError={handleAssetError}
                    />
                ) : (
                    <OffthreadVideo 
                        src={resolvedSrc || ""} 
                        style={styles}
                        muted={true}
                        volume={0}
                        // @ts-ignore - Required to disable recursive proxying in headless.
                        proxyUrl={null}
                        onCanPlay={() => console.log(`[VideoLoader] Render Video Ready: ${resolvedSrc}`, { from: clip.startFrame, dur: clip.durationInFrames })}
                        onError={handleAssetError}
                    />
                )}
                {sfxElement}
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
        </AbsoluteFill>
    );
};
