"use client";

/**
 * Audio Analyzer Utility
 * Extracts peaks from audio files for high-performance waveform rendering.
 */

const waveformCache = new Map<string, number[]>();

export async function getAudioPeaks(url: string, samples: number = 200): Promise<number[]> {
    if (waveformCache.has(url)) {
        return waveformCache.get(url)!;
    }

    try {
        // Route external URLs through proxy to avoid CORS
        const isExternal = url.startsWith('http') && !url.includes('localhost') && !url.includes('127.0.0.1');
        const fetchUrl = isExternal ? `/api/proxy?url=${encodeURIComponent(url)}` : url;
        
        const response = await fetch(fetchUrl);
        const arrayBuffer = await response.arrayBuffer();
        
        // Use standard AudioContext
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        const channelData = audioBuffer.getChannelData(0); // Use first channel
        
        const blockSize = Math.floor(channelData.length / samples);
        const peaks: number[] = [];

        for (let i = 0; i < samples; i++) {
            let start = i * blockSize;
            let sum = 0;
            for (let j = 0; j < blockSize; j++) {
                sum = sum + Math.abs(channelData[start + j]);
            }
            peaks.push(sum / blockSize);
        }

        // Normalize peaks
        const max = Math.max(...peaks);
        const normalizedPeaks = peaks.map(p => p / (max || 1));

        waveformCache.set(url, normalizedPeaks);
        return normalizedPeaks;
    } catch (err) {
        console.error("Error analyzing audio for waveform:", err);
        return [];
    }
}
