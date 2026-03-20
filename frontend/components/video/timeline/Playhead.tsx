import { memo, useRef, useEffect } from 'react';
import { cn } from '../../../lib/utils';
import { Scissors } from 'lucide-react';

interface PlayheadProps {
    currentFrame: number;
    fps: number;
    pxPerSec: number;
    onDrag: (frame: number) => void;
    snapPoints?: number[];
    headerOffset?: number;
    className?: string;
}

export const Playhead = memo(({
    currentFrame,
    fps,
    pxPerSec,
    onDrag,
    snapPoints = [],
    headerOffset = 112,
    className
}: PlayheadProps) => {
    const isDragging = useRef(false);
    
    const HEADER_WIDTH = headerOffset;
    
    const posX = (currentFrame / fps) * pxPerSec + HEADER_WIDTH;

    const handleMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.current) return;
        
        const container = document.querySelector('.timeline-scroll-area');
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left + container.scrollLeft - HEADER_WIDTH;
        
        let targetFrame = Math.round((mouseX / pxPerSec) * fps);
        
        const snapThresholdPx = 10;
        const snapThresholdFrames = (snapThresholdPx / pxPerSec) * fps;
        
        for (const point of snapPoints) {
            if (Math.abs(targetFrame - point) < snapThresholdFrames) {
                targetFrame = point;
                break;
            }
        }

        onDrag(Math.max(0, targetFrame));
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    return (
        <div 
            className={cn("absolute top-0 bottom-0 z-[100] flex flex-col items-center pointer-events-none", className)}
            style={{ 
                left: `${posX}px`,
                transform: 'translateX(-50%)' 
            }}
        >
            <div 
                className="w-4 h-4 rounded-t-sm bg-studio-accent border-b border-studio-accent shadow-lg flex items-center justify-center cursor-ew-resize pointer-events-auto hover:scale-110 transition-transform"
                onMouseDown={handleMouseDown}
            >
                <Scissors className="w-2 h-2 text-white" />
            </div>
            
            <div className="w-px bg-studio-accent flex-1 shadow-[0_0_10px_rgba(0,122,255,0.3)]" />
        </div>
    );
});
Playhead.displayName = 'Playhead';
