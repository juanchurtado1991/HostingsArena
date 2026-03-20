import React from 'react';
import { useStudioStore } from '@/store/useStudioStore';

interface PlaybackTimeDisplayProps {
    durationInFrames: number;
    fps: number;
}

export function PlaybackTimeDisplay({ durationInFrames, fps }: PlaybackTimeDisplayProps) {
    const currentTime = useStudioStore(s => s.currentTime);

    const fmt = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <div className="flex flex-col font-mono text-zinc-500">
            <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-zinc-900">{fmt(currentTime)}</span>
                <span className="text-zinc-200">/</span>
                <span className="text-zinc-400">{fmt(durationInFrames / fps)}</span>
            </div>
        </div>
    );
}
