"use client";

import { memo } from 'react';
import { cn } from '../../../lib/utils';

interface TimeRulerProps {
    totalSeconds: number;
    pxPerSec: number;
    fps: number;
    className?: string;
    hideHeader?: boolean;
}

export const TimeRuler = memo(({ 
    totalSeconds, 
    pxPerSec, 
    fps, 
    className,
    hideHeader = false 
}: TimeRulerProps) => {
    
    const ticks = Array.from({ length: Math.ceil(totalSeconds) + 1 }).map((_, i) => i);

    const formatTimestamp = (secs: number) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const HEADER_WIDTH = 112;

    return (
        <div 
            className={cn("h-8 border-b border-black/5 sticky top-0 bg-white/80 backdrop-blur-xl z-50 flex items-stretch", className)}
            style={{ width: '100%' }}
        >
            {!hideHeader && (
                <div className="sticky left-0 w-28 shrink-0 bg-white border-r border-black/5 z-40 flex items-center justify-center">
                    <span className="text-[8px] font-black text-zinc-300 uppercase tracking-widest">Tiempo</span>
                </div>
            )}
 
            <div className="relative flex-1">
                {ticks.map(tick => {
                    const isMajor = tick % 5 === 0;
                    
                    return (
                        <div 
                            key={tick} 
                            className="absolute bottom-0 flex flex-col items-center"
                            style={{ left: `${tick * pxPerSec}px`, transform: 'translateX(-50%)' }}
                        >
                            {isMajor && (
                                <span className="text-[10px] font-bold text-zinc-400 mb-0.5 select-none tracking-wider">
                                    {formatTimestamp(tick)}
                                </span>
                            )}
                            <div className={cn("w-px bg-black/10", isMajor ? "h-2" : "h-1")} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
TimeRuler.displayName = 'TimeRuler';
