"use client";

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Clip } from '@/types/studio';
import { cn } from '@/lib/utils';
import { Move, Scaling, Target } from 'lucide-react';
import { useStudioStore } from '@/store/useStudioStore';
import { SyncEngine } from '@/lib/video-sync/SyncEngine';

export function CanvasEditor() {
    const layers = useStudioStore(s => s.layers);
    const currentTime = useStudioStore(s => s.currentTime);
    const selectedClipId = useStudioStore(s => s.selectedClipId);
    
    const setSelectedClipId = useStudioStore(s => s.setSelectedClipId);
    const updateClip = useStudioStore(s => s.updateClip);
    const pushToHistory = useStudioStore(s => s.pushToHistory);

    const containerRef = useRef<HTMLDivElement>(null);
    const [bounds, setBounds] = useState({ width: 0, height: 0 });
    const [dragState, setDragState] = useState<{
        clipId: string;
        mode: 'move' | 'resize-tl' | 'resize-tr' | 'resize-bl' | 'resize-br';
        initialX: number;
        initialY: number;
        initialClipX: number;
        initialClipY: number;
        initialClipScale: number;
    } | null>(null);

    const currentFrame = Math.round(currentTime * SyncEngine.FPS);

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                setBounds({ width: entry.contentRect.width, height: entry.contentRect.height });
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const activeClips = useMemo(() => {
        const clips: Clip[] = [];
        layers.forEach(layer => {
            if (layer.isVisible === false) return;
            const visible = layer.clips.filter(c => 
                currentFrame >= c.startFrame && currentFrame < c.startFrame + c.durationInFrames &&
                (c.type === 'image' || c.type === 'video' || c.type === 'overlay')
            );
            if (visible.length > 0) clips.push(...visible);
        });
        return clips;
    }, [layers, currentFrame]);

    const getRectStyle = (clip: Clip) => {
        const x = clip.x ?? 50;
        const y = clip.y ?? 50;
        const scale = clip.scale ?? 1;
        
        const wpx = bounds.width * scale;
        const hpx = bounds.height * scale;
        
        const leftPx = (x / 100) * bounds.width - (wpx / 2);
        const topPx = (y / 100) * bounds.height - (hpx / 2);

        return {
            left: `${leftPx}px`,
            top: `${topPx}px`,
            width: `${wpx}px`,
            height: `${hpx}px`,
            zIndex: isSelected(clip.id) ? 100 : 10
        };
    };

    const isSelected = (id: string) => selectedClipId === id;

    const handlePointerDown = (e: React.PointerEvent, clip: Clip, mode: 'move' | 'resize-tl' | 'resize-tr' | 'resize-bl' | 'resize-br' = 'move') => {
        e.stopPropagation();
        setSelectedClipId(clip.id);
        
        setDragState({
            clipId: clip.id,
            mode,
            initialX: e.clientX,
            initialY: e.clientY,
            initialClipX: clip.x ?? 50,
            initialClipY: clip.y ?? 50,
            initialClipScale: clip.scale ?? 1,
        });
        
        if (e.target instanceof Element) {
            e.target.setPointerCapture(e.pointerId);
        }
    };

    useEffect(() => {
        if (!dragState || !containerRef.current || bounds.width === 0) return;

        const handlePointerMove = (e: PointerEvent) => {
            const deltaX = e.clientX - dragState.initialX;
            const deltaY = e.clientY - dragState.initialY;
            
            const deltaXPct = (deltaX / bounds.width) * 100;
            const deltaYPct = (deltaY / bounds.height) * 100;

            if (dragState.mode === 'move') {
                updateClip(dragState.clipId, {
                    x: dragState.initialClipX + deltaXPct,
                    y: dragState.initialClipY + deltaYPct
                });
            } else {
                let multiplier = 1;
                if (dragState.mode === 'resize-tl' || dragState.mode === 'resize-bl') multiplier = -1;
                
                const scaleDelta = (deltaX / (bounds.width / 2)) * multiplier;
                const newScale = Math.max(0.05, Math.min(10, dragState.initialClipScale + scaleDelta));
                
                updateClip(dragState.clipId, { scale: newScale });
            }
        };

        const handlePointerUp = (e: PointerEvent) => {
            if (dragState) {
                pushToHistory();
            }
            setDragState(null);
            if (e.target instanceof Element) {
                try { e.target.releasePointerCapture(e.pointerId); } catch(err) {}
            }
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [dragState, bounds, updateClip, pushToHistory]);

    return (
        <div ref={containerRef} className="absolute inset-0 z-[60] pointer-events-none overflow-hidden">
            {activeClips.map((clip) => {
                const selected = isSelected(clip.id);
                const style = getRectStyle(clip);

                return (
                    <div
                        key={`canvas-item-${clip.id}`}
                        className={cn(
                            "absolute flex items-center justify-center transition-all pointer-events-auto",
                            selected ? "ring-2 ring-studio-accent z-[100] shadow-2xl" : "hover:ring-1 hover:ring-white/30"
                        )}
                        style={style}
                        onPointerDown={(e) => handlePointerDown(e, clip, 'move')}
                    >
                        {selected && (
                            <>
                                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white rounded-full cursor-nwse-resize shadow-lg z-10 border border-studio-border hover:scale-125 transition-transform" onPointerDown={(e) => handlePointerDown(e, clip, 'resize-tl')} />
                                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white rounded-full cursor-nesw-resize shadow-lg z-10 border border-studio-border hover:scale-125 transition-transform" onPointerDown={(e) => handlePointerDown(e, clip, 'resize-tr')} />
                                <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white rounded-full cursor-nesw-resize shadow-lg z-10 border border-studio-border hover:scale-125 transition-transform" onPointerDown={(e) => handlePointerDown(e, clip, 'resize-bl')} />
                                <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white rounded-full cursor-nwse-resize shadow-lg z-10 border border-studio-border hover:scale-125 transition-transform" onPointerDown={(e) => handlePointerDown(e, clip, 'resize-br')} />
                                
                                <div className="w-5 h-5 rounded-full border border-studio-accent/30 flex items-center justify-center bg-studio-bg/60 backdrop-blur-sm pointer-events-none">
                                    <Target className="w-3 h-3 text-studio-accent" />
                                </div>

                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full px-5 py-2.5 flex items-center gap-4 shadow-2xl pointer-events-none ring-1 ring-white/5">
                                    <div className="flex items-center gap-2">
                                        <Scaling className="w-3.5 h-3.5 text-studio-accent" />
                                        <span className="text-[11px] font-bold text-white tracking-tight">{Math.round((clip.scale || 1) * 100)}%</span>
                                    </div>
                                    <div className="w-px h-4 bg-white/10" />
                                    <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                        <span className="flex items-center gap-1">X <span className="text-zinc-400 font-mono">{Math.round(clip.x || 50)}</span></span>
                                        <span className="flex items-center gap-1">Y <span className="text-zinc-400 font-mono">{Math.round(clip.y || 50)}</span></span>
                                    </div>
                                </div>
                                
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                                    <Move className="w-6 h-6 text-white drop-shadow-lg" />
                                </div>
                            </>
                        )}
                        
                        {!selected && (
                            <div className="absolute inset-0 bg-studio-accent/5 border border-white/10 rounded-none opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
