"use client";

import React, { useEffect, useRef, useState } from 'react';
import { getAudioPeaks } from '../../../lib/video/audio-analyzer';

interface AudioWaveformProps {
    url: string;
    color?: string;
    className?: string;
}

export const AudioWaveform = ({ url, color = "currentColor", className }: AudioWaveformProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [peaks, setPeaks] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!url) return;
        
        const loadPeaks = async () => {
            setIsLoading(true);
            try {
                // We request more samples than pixels to allow for better interpolation
                const p = await getAudioPeaks(url, 1000);
                setPeaks(p);
            } catch (err) {
                console.error("Failed to load peaks for waveform:", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadPeaks();
    }, [url]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || peaks.length === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;
        const midY = height / 2;

        ctx.clearRect(0, 0, width, height);
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;

        // Draw symmetric waveform
        const step = width / (peaks.length - 1);
        for (let i = 0; i < peaks.length; i++) {
            const x = i * step;
            const peakHeight = peaks[i] * (height / 2) * 0.8; // 80% of max height
            
            ctx.moveTo(x, midY - peakHeight);
            ctx.lineTo(x, midY + peakHeight);
        }
        ctx.stroke();

    }, [peaks, color, url]);

    return (
        <div className={className}>
            {isLoading ? (
                <div className="w-full h-full flex items-center justify-center opacity-20">
                    <div className="animate-pulse bg-white/20 h-0.5 w-full" />
                </div>
            ) : (
                <canvas 
                    ref={canvasRef} 
                    className="w-full h-full opacity-100"
                />
            )}
        </div>
    );
};
