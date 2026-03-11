import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

interface WordTimestamp {
    word: string;
    start: number; // seconds
    end: number;   // seconds
}

interface KineticTextProps {
    wordTimestamps: WordTimestamp[];
    format: '9:16' | '16:9';
    style?: 'kinetic' | 'classic' | 'minimal';
}

/**
 * KineticText renders animated "keyword pops" synchronized with narration.
 * Uses precise word timestamps from TTS for frame-accurate sync.
 * 
 * - 'kinetic': High-energy center-screen word pops with spring animation
 * - 'classic': Standard bottom subtitle bar
 * - 'minimal': Hidden (renders nothing)
 */
export const KineticText: React.FC<KineticTextProps> = ({ wordTimestamps, format, style = 'kinetic' }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    if (style === 'minimal' || !wordTimestamps || wordTimestamps.length === 0) return null;

    // Group words into chunks of 2-3 for readability
    const chunks = useMemo(() => {
        const result: { text: string; startFrame: number; endFrame: number }[] = [];
        let group: string[] = [];
        let groupStart = 0;
        let groupEnd = 0;

        wordTimestamps.forEach((wt, i) => {
            if (group.length === 0) {
                groupStart = Math.round(wt.start * fps);
            }
            group.push(wt.word);
            groupEnd = Math.round(wt.end * fps);

            // Flush after 2-3 words or at end
            if (group.length >= 3 || i === wordTimestamps.length - 1) {
                result.push({
                    text: group.join(' '),
                    startFrame: groupStart,
                    endFrame: groupEnd,
                });
                group = [];
            }
        });
        return result;
    }, [wordTimestamps, fps]);

    // Find current chunk
    const currentChunk = chunks.find(c => frame >= c.startFrame && frame < c.endFrame);
    if (!currentChunk) return null;

    const chunkLocalFrame = frame - currentChunk.startFrame;
    const chunkDuration = currentChunk.endFrame - currentChunk.startFrame;

    if (style === 'classic') {
        // Classic subtitle bar at bottom
        const opacity = interpolate(chunkLocalFrame, [0, 3, chunkDuration - 3, chunkDuration], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
        });

        return (
            <AbsoluteFill style={{ zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', pointerEvents: 'none' }}>
                <div style={{
                    marginBottom: format === '9:16' ? '15%' : '8%',
                    padding: '12px 32px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: 12,
                    opacity,
                }}>
                    <span style={{
                        fontSize: format === '9:16' ? '2rem' : '2.5rem',
                        fontWeight: 800,
                        color: '#fff',
                        textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                    }}>
                        {currentChunk.text}
                    </span>
                </div>
            </AbsoluteFill>
        );
    }

    // Kinetic mode — center-screen "pop" with spring animation
    const popScale = spring({
        frame: chunkLocalFrame,
        fps,
        config: { damping: 8, stiffness: 200, mass: 0.4 },
    });

    const exitOpacity = interpolate(
        chunkLocalFrame,
        [chunkDuration - 5, chunkDuration],
        [1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    const glowIntensity = interpolate(chunkLocalFrame, [0, 8, chunkDuration], [40, 15, 0], {
        extrapolateRight: 'clamp',
    });

    return (
        <AbsoluteFill style={{
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
        }}>
            <div style={{
                transform: `scale(${popScale})`,
                opacity: exitOpacity,
                padding: '16px 40px',
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 20,
                boxShadow: `0 0 ${glowIntensity}px rgba(0, 122, 255, 0.4), 0 20px 40px rgba(0, 0, 0, 0.3)`,
            }}>
                <span style={{
                    fontSize: format === '9:16' ? '3.5rem' : '5rem',
                    fontWeight: 950,
                    color: '#fff',
                    textTransform: 'uppercase',
                    letterSpacing: '-0.03em',
                    textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                    lineHeight: 1.1,
                }}>
                    {currentChunk.text}
                </span>
            </div>
        </AbsoluteFill>
    );
};
