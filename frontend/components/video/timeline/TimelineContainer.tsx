import React, { memo, useRef, useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { TrackLayer } from './TrackLayer';
import { TimeRuler } from './TimeRuler';
import { Playhead } from './Playhead';
import { useStudioStore } from '@/store/useStudioStore';

interface TimelineContainerProps {
    durationInFrames: number;
    fps: number;
    currentFrame: number;
    onFrameChange: (frame: number) => void;
    zoomLevel?: number; // Pixels per second maybe?
    snapPoints?: number[];
    className?: string;
    children?: React.ReactNode;
    sidebar?: React.ReactNode;
    onAddLayer?: () => void;
}

export const TimelineContainer = memo(({
    durationInFrames,
    fps,
    currentFrame,
    onFrameChange,
    zoomLevel = 10,
    snapPoints = [],
    className,
    children,
    sidebar,
    onAddLayer
}: TimelineContainerProps) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    
    const HEADER_WIDTH = 112;
    
    // Convert duration frames to seconds for width calc
    const totalSeconds = durationInFrames / fps;
    const pxPerSec = zoomLevel * 10; 
    const timelineWidth = totalSeconds * pxPerSec + HEADER_WIDTH;

    const isPlaying = useStudioStore(s => s.isPlayingPreview);
    const lastManualScroll = useRef<number>(0);

    // Auto-scroll logic: Follow the playhead
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container || !isPlaying) return;
        
        // Don't auto-scroll if the user just moved the timeline (2s cooldown)
        if (Date.now() - lastManualScroll.current < 2000) return;

        const playheadPx = (currentFrame / fps) * pxPerSec + HEADER_WIDTH;
        const scrollLeft = container.scrollLeft;
        const viewportWidth = container.clientWidth;

        // Keep a 20% padding at the edges before scrolling
        const padding = viewportWidth * 0.2;
        
        // If playhead goes beyond right edge padding
        if (playheadPx > scrollLeft + viewportWidth - padding) {
            container.scrollTo({
                left: playheadPx - (viewportWidth * 0.4), // Scroll to 40% of viewport
                behavior: 'auto'
            });
        } 
        // If playhead goes before left edge padding (and is not in the fixed header area)
        else if (playheadPx < scrollLeft + padding && playheadPx > HEADER_WIDTH) {
            container.scrollTo({
                left: Math.max(0, playheadPx - (viewportWidth * 0.4)),
                behavior: 'auto'
            });
        }
    }, [currentFrame, fps, pxPerSec, isPlaying]);

    // Handle manual scroll detection
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            // Only mark as manual if NOT playing or if scroll delta is significant
            lastManualScroll.current = Date.now();
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className={cn("w-full h-auto bg-white/80 backdrop-blur-xl border border-black/5 rounded-3xl flex flex-col relative overflow-hidden shadow-2xl ring-1 ring-black/5", className)}>
            {/* Toolbar Area — h-8 matches sidebar Tiempo header */}
            <div className="h-8 bg-black/5 border-b border-black/10 flex items-center shrink-0">
                {/* Fixed Corner for Toolbar */}
                <div className="w-28 shrink-0 bg-black/10 border-r border-black/10 h-full flex items-center justify-center">
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Tools</span>
                </div>
                <div className="flex-1 px-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap px-1">Timeline</span>
                        {onAddLayer && (
                            <button 
                                onClick={onAddLayer}
                                className="flex items-center gap-1.5 px-3 h-6 rounded-lg bg-studio-accent/5 hover:bg-studio-accent/20 text-studio-accent border border-studio-accent/20 transition-all group active:scale-95"
                            >
                                <span className="text-[9px] font-black uppercase tracking-widest">Nueva Capa</span>
                            </button>
                        )}
                    </div>
                    <div className="flex-1 max-w-sm flex items-center gap-2 group">
                        <span className="text-[8px] font-black text-zinc-300 uppercase tracking-widest">Deslizar</span>
                        <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.001"
                            className="flex-1 h-1 bg-black/5 rounded-full appearance-none accent-studio-accent cursor-pointer hover:bg-black/10 transition-colors"
                            onChange={(e) => {
                                if (scrollContainerRef.current) {
                                    const maxScroll = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;
                                    scrollContainerRef.current.scrollLeft = parseFloat(e.target.value) * maxScroll;
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
            
            <div className="flex-1 flex overflow-hidden">
                {/* Fixed Sidebar for Headers — flex-col with gap-0 ensures rows align exactly */}
                <div className="w-28 shrink-0 flex flex-col bg-white border-r border-black/10 z-30 overflow-hidden">
                    {/* This row is h-8 to match the TimeRuler h-8 row on the right */}
                    <div className="h-8 border-b border-black/5 shrink-0 bg-black/5 flex items-center justify-center">
                         <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Tiempo</span>
                    </div>
                    {sidebar}
                </div>

                {/* Scrollable Timeline Area */}
                <div 
                    ref={scrollContainerRef}
                    className="flex-1 overflow-x-scroll overflow-y-hidden relative timeline-scroll-area [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
                >
                    <div 
                        className="relative min-h-full"
                        style={{ width: `${Math.max(timelineWidth - HEADER_WIDTH, 100)}px`, minWidth: '100%' }}
                    >
                        <TimeRuler 
                            totalSeconds={totalSeconds} 
                            pxPerSec={pxPerSec} 
                            fps={fps}
                            hideHeader={true} // New prop to hide internal ruler header
                        />
                        
                        <div className="relative w-full">
                            {children}
                        </div>

                        <Playhead 
                            currentFrame={currentFrame}
                            fps={fps}
                            pxPerSec={pxPerSec}
                            onDrag={onFrameChange}
                            snapPoints={snapPoints}
                            headerOffset={0} // No offset needed inside the scroll container
                        />
                    </div>
                </div>
            </div>
        </div>
    );
});
TimelineContainer.displayName = 'TimelineContainer';
