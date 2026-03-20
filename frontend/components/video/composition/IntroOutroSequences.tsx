import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, Img, staticFile } from 'remotion';
import { Globe } from 'lucide-react';
import { SyncEngine } from '../../../lib/video-sync/SyncEngine';
import { BackgroundParticles } from './NewsTitleCard';

export const IntroSequence: React.FC<{ title: string; format: '9:16' | '16:9'; fps: number; baseUrl?: string }> = ({ title, format, fps, baseUrl }) => {
    const frame = useCurrentFrame();

    const logoScale = spring({ frame, fps, config: { damping: 14, stiffness: 150, mass: 0.7 } });
    const logoPulse = interpolate(frame % 40, [0, 20, 40], [1, 1.03, 1]);
    const titleOpacity = interpolate(frame, [25, 45], [0, 1], { extrapolateRight: 'clamp' });
    const titleY = interpolate(frame, [25, 45], [30, 0], { extrapolateRight: 'clamp' });
    const fadeOut = interpolate(frame, [SyncEngine.getIntroFrames() - 10, SyncEngine.getIntroFrames()], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    const neonGlow = interpolate(frame % 50, [0, 25, 50], [0.5, 1, 0.5]);
    const scanY = interpolate(frame % 90, [0, 90], [0, 100]);

    const particles = Array.from({ length: 20 }, (_, i) => ({
        x: 5 + (i * 67) % 90,
        y: 5 + (i * 43) % 90,
        delay: i * 2,
        size: 2 + (i % 3) * 2,
    }));

    return (
        <AbsoluteFill style={{
            background: 'radial-gradient(ellipse at 30% 40%, #0a1628 0%, #030508 100%)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            opacity: fadeOut, zIndex: 50,
        }}>
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)`,
                backgroundSize: '60px 60px', pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', left: 0, right: 0, top: `${scanY}%`, height: 2,
                background: `linear-gradient(90deg, transparent, rgba(0, 212, 255, ${0.15 * neonGlow}), transparent)`,
                boxShadow: `0 0 30px rgba(0, 212, 255, ${0.1 * neonGlow})`, pointerEvents: 'none', zIndex: 3,
            }} />

            {particles.map((p, idx) => {
                const particleOpacity = interpolate(frame, [p.delay, p.delay + 12, p.delay + 35], [0, 0.8, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                const particleY = interpolate(frame, [p.delay, p.delay + 35], [p.y, p.y - 20], { extrapolateRight: 'clamp' });
                return (
                    <div key={idx} style={{
                        position: 'absolute', left: `${p.x}%`, top: `${particleY}%`,
                        width: p.size, height: p.size, borderRadius: '50%',
                        background: '#00d4ff', boxShadow: '0 0 12px 4px rgba(0, 212, 255, 0.4)',
                        opacity: particleOpacity, zIndex: 1,
                    }} />
                );
            })}

            <div style={{
                transform: `scale(${logoScale * logoPulse})`,
                display: 'flex', alignItems: 'center', gap: 25,
                marginBottom: 35, position: 'relative', overflow: 'hidden',
                padding: '28px 56px', borderRadius: 16,
                background: 'rgba(0, 212, 255, 0.04)', backdropFilter: 'blur(12px)',
                border: `1px solid rgba(0, 212, 255, ${0.15 * neonGlow})`,
                boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 ${30 * neonGlow}px rgba(0, 212, 255, ${0.08 * neonGlow})`
            }}>
                <Globe size={format === '9:16' ? 65 : 85} color="#00d4ff" style={{ filter: `drop-shadow(0 0 ${20 * neonGlow}px rgba(0,212,255,0.6))` }} />
                <span style={{ fontSize: format === '9:16' ? 46 : 68, fontWeight: 950, color: '#fff', letterSpacing: -1.5, textShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>HostingArena</span>
                <div style={{
                    position: 'absolute', top: 0, left: '-150%', width: '300%', height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.15), transparent)',
                    transform: `translateX(${interpolate(frame % 70, [0, 70], [0, 100])}%) skewX(-25deg)`,
                    pointerEvents: 'none', zIndex: 2
                }} />
            </div>

            <div style={{ opacity: titleOpacity, transform: `translateY(${titleY}px)`, maxWidth: '85%', textAlign: 'center' }}>
                <h1 style={{ fontSize: format === '9:16' ? 30 : 42, fontWeight: 800, color: 'rgba(255,255,255,0.85)', lineHeight: 1.2, margin: 0, textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>{title}</h1>
            </div>

            <div style={{
                marginTop: 28,
                width: interpolate(frame, [30, 60], [0, format === '9:16' ? 200 : 350], { extrapolateRight: 'clamp' }),
                height: 2, background: `linear-gradient(90deg, transparent, #00d4ff, transparent)`,
                boxShadow: `0 0 15px rgba(0, 212, 255, ${0.4 * neonGlow})`, borderRadius: 4,
            }} />
        </AbsoluteFill>
    );
};

export const OutroSequence: React.FC<{ format: '9:16' | '16:9'; fps: number; baseUrl?: string }> = ({ format, fps, baseUrl }) => {
    const frame = useCurrentFrame();

    const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
    const scaleIn = spring({ frame, fps, config: { damping: 14, stiffness: 70 } });
    const ctaOpacity = interpolate(frame, [30, 50], [0, 1], { extrapolateRight: 'clamp' });
    const ctaY = interpolate(frame, [30, 50], [20, 0], { extrapolateRight: 'clamp' });

    const neonGlow = interpolate(frame % 50, [0, 25, 50], [0.5, 1, 0.5]);
    const scanY = interpolate(frame % 90, [0, 90], [0, 100]);

    return (
        <AbsoluteFill style={{
            background: 'radial-gradient(ellipse at 70% 60%, #0a1628 0%, #030508 100%)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            gap: format === '9:16' ? 50 : 40, opacity: fadeIn, zIndex: 50,
        }}>
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)`,
                backgroundSize: '60px 60px', pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', left: 0, right: 0, top: `${scanY}%`, height: 2,
                background: `linear-gradient(90deg, transparent, rgba(0, 212, 255, ${0.12 * neonGlow}), transparent)`,
                boxShadow: `0 0 25px rgba(0, 212, 255, ${0.08 * neonGlow})`, pointerEvents: 'none', zIndex: 3,
            }} />

            <BackgroundParticles frame={frame} count={18} color="#00d4ff" />

            <div style={{ transform: `scale(${scaleIn})`, display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{
                    width: format === '9:16' ? 90 : 110, height: format === '9:16' ? 90 : 110,
                    borderRadius: '20%', background: 'rgba(0, 212, 255, 0.08)',
                    border: `1px solid rgba(0, 212, 255, ${0.2 * neonGlow})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 20px 50px rgba(0, 0, 0, 0.5), 0 0 ${25 * neonGlow}px rgba(0, 212, 255, ${0.12 * neonGlow})`,
                    position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute', top: 0, left: '-100%', width: '200%', height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.2), transparent)',
                        transform: `translateX(${interpolate(frame % 50, [0, 50], [0, 100])}%) skewX(-20deg)`,
                    }} />
                    <Globe size={format === '9:16' ? 45 : 58} color="#00d4ff" style={{ filter: `drop-shadow(0 0 ${15 * neonGlow}px rgba(0,212,255,0.5))` }} />
                </div>
                <span style={{ fontSize: format === '9:16' ? 44 : 60, fontWeight: 950, color: '#fff', letterSpacing: '-0.05em', textShadow: '0 10px 35px rgba(0,0,0,0.4)' }}>HostingArena</span>
            </div>

            <div style={{ opacity: ctaOpacity, transform: `translateY(${ctaY}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
                <div style={{
                    background: 'rgba(0, 212, 255, 0.1)',
                    padding: format === '9:16' ? '22px 56px' : '18px 52px', borderRadius: '1rem',
                    boxShadow: `0 15px 50px rgba(0, 0, 0, 0.4), 0 0 ${20 * neonGlow}px rgba(0, 212, 255, ${0.15 * neonGlow})`,
                    border: `1px solid rgba(0, 212, 255, ${0.3 * neonGlow})`,
                    transform: `scale(${interpolate(frame % 40, [0, 20, 40], [1, 1.04, 1])})`,
                }}>
                    <span style={{ fontSize: format === '9:16' ? 26 : 30, fontWeight: 950, color: '#00d4ff', textTransform: 'uppercase', letterSpacing: '0.2em', textShadow: `0 0 15px rgba(0, 212, 255, ${0.4 * neonGlow})` }}>Visit Site</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: format === '9:16' ? 20 : 26, color: 'rgba(255, 255, 255, 0.8)', fontWeight: 700, display: 'block', marginBottom: 6 }}>HostingArena.com</span>
                    <span style={{ fontSize: format === '9:16' ? 14 : 16, color: 'rgba(0, 212, 255, 0.5)', letterSpacing: '0.15em', fontWeight: 600, textTransform: 'uppercase' }}>PREMIUM CLOUD COMPARISONS</span>
                </div>
            </div>

            <div style={{
                position: 'absolute', bottom: format === '9:16' ? 120 : 80,
                width: interpolate(frame, [25, 55], [0, 240], { extrapolateRight: 'clamp' }),
                height: 2, background: `linear-gradient(90deg, transparent, #00d4ff, transparent)`,
                boxShadow: `0 0 15px rgba(0, 212, 255, ${0.3 * neonGlow})`, borderRadius: 4,
            }} />
        </AbsoluteFill>
    );
};
