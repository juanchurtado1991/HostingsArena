import React, { useMemo, useEffect } from 'react';
import { AbsoluteFill, useVideoConfig, useCurrentFrame, interpolate, Audio, Sequence, prefetch } from 'remotion';
import { Scene, Layer } from '../../../types/studio';
import { SyncEngine } from '../../../lib/video-sync/SyncEngine';
import { resolveAsset } from '../../../lib/video/asset-utils';
import { ClipRenderer } from './ClipRenderer';
import { TextRenderer } from './TextRenderer';
import { OutroSequence } from './IntroOutroSequences';

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
    introDuration?: number;
    outroDuration?: number;
    baseUrl?: string;
}

export const HostingComposition: React.FC<CompositionProps> = ({ 
    title, scenes, layers = [], format,
    bgMusicUrl = "/assets/bg-music.mp3", bgMusicVolume = 0.4,
    transitionSfxUrl = "/assets/click.mp3", outroSfxUrl,
    voiceSpeed = 1, introDuration = 6, outroDuration = 15, baseUrl = '',
}) => {
    const { fps, durationInFrames } = useVideoConfig();
    const isPreview = !baseUrl;
    const frame = useCurrentFrame();

    useEffect(() => {
        if (transitionSfxUrl) {
            const resolved = resolveAsset(transitionSfxUrl, baseUrl);
            if (resolved && resolved !== 'intro' && resolved !== 'outro') {
                prefetch(resolved);
            }
        }
    }, [transitionSfxUrl, baseUrl]);

    const introFrames = Math.round(introDuration * fps);
    const outroFrames = Math.round(outroDuration * fps);

    const sceneTimings = useMemo(() => {
        return SyncEngine.calculateTimingsCustom(scenes, introDuration, 5).map(t => ({
            startFrame: t.startFrame - introFrames, 
            durationFrames: t.durationInFrames 
        }));
    }, [scenes, introDuration, introFrames]);

    const textColor = '#ffffff';

    const renderLayers = (activeLayers: Layer[]) => {
        return (
            <>
                {activeLayers.map((layer, lIdx) => {
                    if (layer.isVisible === false) return null;
                    
                    const isAudioLayer = layer.clips.some(c => c.type === 'audio' || c.type === 'music' || c.type === 'sfx');
                    
                    if (isAudioLayer) {
                        return (
                            <React.Fragment key={layer.id}>
                                {layer.clips.map((clip) => {
                                    const assetUrl = resolveAsset(clip.src, baseUrl)!;
                                    const isVoice = clip.type === 'audio';
                                    
                                    if (isVoice) {
                                        console.log(`[AudioLoader] Preparing voice clip: ${clip.id}`, {
                                            src: assetUrl,
                                            volume: (clip.volume ?? 1) * 1.5,
                                            buffering: '10s (300 frames)'
                                        });
                                    }

                                    return (
                                        <Sequence 
                                            key={clip.id} 
                                            from={clip.startFrame} 
                                            durationInFrames={clip.durationInFrames}
                                            premountFor={90} 
                                        >
                                            <Audio 
                                                key={`audio-${clip.id}`}
                                                src={assetUrl}
                                                {...(assetUrl.includes('.webm') ? { type: 'audio/webm' } : {})}
                                                {...(assetUrl.includes('.mp3') ? { type: 'audio/mpeg' } : {})}
                                                playbackRate={1}
                                                pauseWhenBuffering={true} 
                                                acceptableTimeShiftInSeconds={0.5} 
                                                useWebAudioApi={true} 
                                                crossOrigin="anonymous"
                                                onCanPlay={() => console.log(`[AudioLoader] Audio Ready (${clip.type}): ${clip.id}`)}
                                                onError={(e) => console.error(`[AudioError] Failed to load ${clip.type}: ${assetUrl}`, e)}
                                                volume={isVoice 
                                                    ? (clip.volume ?? 1) * 1.5  
                                                    : (f: number) => {          
                                                        const vol = (clip.volume ?? 1);
                                                        const frameInComp = clip.startFrame + f;
                                                        const voiceActive = layers.some(l => 
                                                            l.clips.some(c => 
                                                                 c.type === 'audio' && 
                                                                frameInComp >= c.startFrame && 
                                                                frameInComp < c.startFrame + c.durationInFrames
                                                            )
                                                        );
                                                        return vol * (voiceActive ? 0.35 : 1.0);
                                                    }
                                                }
                                                loop={clip.type === 'music'}
                                                endAt={isVoice ? clip.durationInFrames : undefined}
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
            <AbsoluteFill style={{ 
                zIndex: -3, 
                backgroundColor: '#0f1729',
                background: 'radial-gradient(circle at center, #1c2a4d 0%, #050810 100%)' 
            }} />

            {renderLayers(layers)}

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

            {outroFrames > 0 && (
                <Sequence 
                    from={durationInFrames - outroFrames} 
                    durationInFrames={outroFrames} 
                    premountFor={60} 
                    style={{ zIndex: 9999 }}
                >
                    <AbsoluteFill>
                        <OutroSequence format={format} fps={fps} />
                        {outroSfxUrl && (
                            <Audio 
                                src={resolveAsset(outroSfxUrl, baseUrl) || outroSfxUrl} 
                                volume={() => 0.8}
                                pauseWhenBuffering={true}
                                useWebAudioApi={true}
                                crossOrigin="anonymous"
                                onError={(e) => console.error(`[AudioError] Failed to load Outro SFX: ${outroSfxUrl}`, e)}
                            />
                        )}
                    </AbsoluteFill>
                </Sequence>
            )}
        </AbsoluteFill>
    );
};
