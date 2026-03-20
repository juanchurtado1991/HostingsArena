import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate, spring, Img, staticFile } from 'remotion';
import { resolveAsset } from '../../../lib/video/asset-utils';

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

export { BackgroundParticles };

export const NewsTitleCard: React.FC<{ 
    headline: string, 
    subHeadline?: string, 
    format: '9:16' | '16:9', 
    frame: number, 
    fps: number,
    duration?: number 
}> = ({ headline, subHeadline, format, frame, fps, duration = 90 }) => {
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

    const exitStart = Math.max(0, duration - 15);
    const exit = spring({
        frame: frame - exitStart,
        fps,
        config: { damping: 18, stiffness: 100 },
    });

    const isVertical = format === '9:16';
    const opacity = entrance * (1 - exit);
    const scale = interpolate(entrance, [0, 1], [0.85, 1]) * interpolate(exit, [0, 1], [1, 1.15]);
    const accentGlow = interpolate(frame % 40, [0, 20, 40], [0.5, 1, 0.5]);
    const scanY = interpolate(frame % 80, [0, 80], [0, 100]);

    return (
        <AbsoluteFill style={{ zIndex: 100, opacity, transform: `scale(${scale})` }}>
            <AbsoluteFill style={{
                background: 'radial-gradient(ellipse at 50% 40%, rgba(10, 22, 40, 0.92) 0%, rgba(3, 5, 8, 0.96) 100%)',
                backdropFilter: 'blur(8px)',
            }} />
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `linear-gradient(rgba(0, 212, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.04) 1px, transparent 1px)`,
                backgroundSize: '80px 80px', pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', left: 0, right: 0, top: `${scanY}%`, height: 2,
                background: `linear-gradient(90deg, transparent, rgba(0, 212, 255, ${0.2 * accentGlow}), transparent)`,
                boxShadow: `0 0 40px rgba(0, 212, 255, ${0.12 * accentGlow})`,
                pointerEvents: 'none', zIndex: 5,
            }} />
            <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: isVertical ? '3rem 2rem' : '4rem' }}>
                <div style={{ opacity: stagger1, transform: `translateY(${interpolate(stagger1, [0, 1], [20, 0])}px)`, marginBottom: isVertical ? '1.5rem' : '2rem' }}>
                    <div style={{ background: 'rgba(0, 212, 255, 0.1)', border: `1px solid rgba(0, 212, 255, ${0.3 * accentGlow})`, borderRadius: '0.5rem', padding: isVertical ? '0.5rem 1.5rem' : '0.6rem 2rem', boxShadow: `0 0 ${20 * accentGlow}px rgba(0, 212, 255, ${0.1 * accentGlow})` }}>
                        <span style={{ fontSize: isVertical ? '1rem' : '1.3rem', fontWeight: 900, color: '#00d4ff', textTransform: 'uppercase', letterSpacing: '0.5em', textShadow: `0 0 20px rgba(0, 212, 255, ${0.5 * accentGlow})` }}>● BREAKING</span>
                    </div>
                </div>
                <div style={{ opacity: entrance, transform: `scale(${interpolate(entrance, [0, 1], [0.9, 1])})`, textAlign: 'center', maxWidth: isVertical ? '95%' : '85%' }}>
                    <h1 style={{ fontSize: isVertical ? '3.5rem' : '5.5rem', fontWeight: 950, margin: 0, color: '#ffffff', lineHeight: 1.05, letterSpacing: '-0.03em', textShadow: '0 6px 30px rgba(0, 0, 0, 0.5)' }}>{headline.toUpperCase()}</h1>
                </div>
                <div style={{ marginTop: isVertical ? '1.5rem' : '2rem', width: interpolate(stagger2, [0, 1], [0, isVertical ? 200 : 400]), height: 3, background: 'linear-gradient(90deg, transparent, #00d4ff, transparent)', boxShadow: `0 0 20px rgba(0, 212, 255, ${0.5 * accentGlow})`, borderRadius: 4 }} />
                {subHeadline && (
                    <div style={{ opacity: stagger2, transform: `translateY(${interpolate(stagger2, [0, 1], [15, 0])}px)`, marginTop: isVertical ? '1.2rem' : '1.5rem', textAlign: 'center', maxWidth: isVertical ? '90%' : '75%' }}>
                        <p style={{ fontSize: isVertical ? '1.6rem' : '2rem', fontWeight: 500, margin: 0, color: 'rgba(255, 255, 255, 0.5)', lineHeight: 1.3, letterSpacing: '0.01em' }}>{subHeadline}</p>
                    </div>
                )}
            </AbsoluteFill>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(90deg, transparent 5%, #00d4ff 30%, #007aff 50%, #00d4ff 70%, transparent 95%)', boxShadow: `0 0 ${25 * accentGlow}px rgba(0, 212, 255, ${0.6 * accentGlow}), 0 -${15 * accentGlow}px ${40 * accentGlow}px rgba(0, 212, 255, ${0.15 * accentGlow})` }} />
        </AbsoluteFill>
    );
};

export const NewsLowerThirdOverlay: React.FC<{ 
    headline: string, speech: string, format: '9:16' | '16:9', 
    frame: number, fps: number, duration: number, baseUrl?: string
}> = ({ headline, speech, format, frame, fps, duration, baseUrl }) => {
    const isVertical = format === '9:16';
    
    const entrance = spring({ frame, fps, config: { damping: 14, stiffness: 80, mass: 0.9 }, durationInFrames: 35 });
    const exitStart = Math.max(0, duration - 15);
    const exit = spring({ frame: frame - exitStart, fps, config: { damping: 18, stiffness: 100 } });

    const translateY = interpolate(entrance, [0, 1], [150, 0]) + interpolate(exit, [0, 1], [0, 150]);
    const opacity = entrance * (1 - exit);
    
    const firstSentence = speech ? (speech.match(/^[^.!?]+[.!?]?/)?.[0] || speech.substring(0, 120)).trim() : "";
    const circleSize = isVertical ? 110 : 150;
    const barHeight = isVertical ? 75 : 95;
    
    const logoPop = spring({ frame: frame - 10, fps, config: { damping: 12, stiffness: 100 } });
    const continuousRotation = (frame * 2) % 360;
    const pulseCycle = frame % 90;
    const continuousPulse = interpolate(pulseCycle, [0, 10, 20, 90], [1, 0.85, 1, 1], { extrapolateRight: 'clamp' });
    
    const isProduction = typeof baseUrl === 'string' && baseUrl.length > 0;
    const logoSrc = (isProduction ? resolveAsset("/ha-logo.png", baseUrl) : staticFile("/ha-logo.png")) as string;
    
    if (frame === 10) {
        console.log(`[NewsOverlay] Logo Source: ${logoSrc}`, { baseUrl, frame });
    }

    return (
        <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: isVertical ? '4.125%' : '2.2%', zIndex: 100, pointerEvents: 'none' }}>
            <div style={{ position: 'relative', width: isVertical ? '92%' : '84%', height: circleSize, opacity, transform: `translateY(${translateY}px)`, display: 'flex', alignItems: 'center', filter: `drop-shadow(0px 15px 30px rgba(0,0,0,0.4))` }}>
                
                <div style={{ position: 'absolute', right: 0, top: (circleSize - barHeight) / 2, height: barHeight, width: 35, display: 'flex', flexDirection: 'row', gap: 5, zIndex: 1 }}>
                    <div style={{ width: 6, height: '100%', backgroundColor: '#007aff', transform: 'skewX(-20deg)' }} />
                    <div style={{ width: 4, height: '100%', backgroundColor: '#00d4ff', transform: 'skewX(-20deg)' }} />
                    <div style={{ width: 3, height: '100%', backgroundColor: '#00bfff', transform: 'skewX(-20deg)' }} />
                </div>

                <div style={{
                    position: 'absolute', left: isVertical ? 85 : 140, right: 30,
                    top: (circleSize - barHeight) / 2, height: barHeight,
                    background: 'linear-gradient(90deg, rgba(16, 24, 40, 0.95) 0%, rgba(20, 30, 50, 0.85) 100%)',
                    backdropFilter: 'blur(16px)', transform: 'skewX(-20deg)', zIndex: 2,
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    paddingLeft: isVertical ? 45 : 55, paddingRight: 40,
                    border: '1px solid rgba(0, 212, 255, 0.2)', borderLeft: 'none',
                }}>
                    <div style={{ position: 'absolute', top: Math.floor(barHeight * 0.08), left: 10, right: 0, height: 2, background: 'linear-gradient(90deg, #00d4ff, transparent)' }} />
                    <div style={{ position: 'absolute', bottom: Math.floor(barHeight * 0.08), left: -10, right: 40, height: 2, background: 'linear-gradient(90deg, #007aff, transparent)' }} />
                    
                    <div style={{ transform: 'skewX(20deg)', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 3 }}>
                        <span style={{ fontSize: isVertical ? 24 : 34, fontWeight: 900, color: '#ffffff', lineHeight: 1.1, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.02em', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{headline}</span>
                        {firstSentence && (
                            <span style={{ fontSize: isVertical ? 16 : 22, fontWeight: 500, color: '#00d4ff', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>{firstSentence}</span>
                        )}
                    </div>
                </div>

                <div style={{ position: 'absolute', left: isVertical ? 5 : 20, width: circleSize, height: circleSize, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                        position: 'absolute', left: -12, top: -12, width: circleSize + 24, height: circleSize + 24,
                        borderRadius: '50%', border: '4px solid transparent',
                        borderLeftColor: '#007aff', borderBottomColor: '#00d4ff',
                        transform: `rotate(${interpolate(entrance, [0, 1], [-90, 15]) + continuousRotation}deg)`,
                    }} />
                    <div style={{
                        width: '100%', height: '100%', borderRadius: '50%',
                        background: 'radial-gradient(circle at center, rgba(0, 122, 255, 0.4) 0%, rgba(16, 24, 40, 0.95) 100%)',
                        border: '3px solid #000',
                        boxShadow: 'inset 0 0 0 3px rgba(0,212,255,0.5), inset 0 0 0 5px #000, 0 5px 15px rgba(0,0,0,0.5)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                        transform: `scale(${logoPop * continuousPulse})`
                    }}>
                        <Img src={logoSrc} style={{ width: '85%', height: '85%', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.6))' }} />
                    </div>
                </div>
            </div>
        </AbsoluteFill>
    );
};
