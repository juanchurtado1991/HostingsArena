import { memo } from 'react';
import { cn } from '@/lib/utils';
import { Image, Film, Mic, Music, Sparkles, Layers, Globe, Star } from 'lucide-react';
import { AudioWaveform } from './AudioWaveform';
import { resolveAsset } from '@/lib/video/asset-utils';

interface MediaBlockProps {
    id: string;
    type: 'image' | 'video' | 'audio' | 'effect' | 'music' | 'overlay' | 'sfx';
    url?: string;
    label?: string;
    startFrame: number;
    durationInFrames: number;
    fps: number;
    pxPerSec: number;
    isSelected?: boolean;
    onClick?: () => void;
    onMouseDown?: (e: React.MouseEvent) => void;
    onResizeStartLeft?: (e: React.MouseEvent) => void;
    onResizeStartRight?: (e: React.MouseEvent) => void;
    className?: string;
}

export const MediaBlock = memo(({
    type,
    url,
    label,
    startFrame,
    durationInFrames,
    fps,
    pxPerSec,
    isSelected,
    onClick,
    onMouseDown,
    onResizeStartLeft,
    onResizeStartRight,
    className
}: MediaBlockProps) => {
    
    // Calculate precise width and position based on frame math
    const leftPx = (startFrame / fps) * pxPerSec;
    const widthPx = (durationInFrames / fps) * pxPerSec;

    const baseColor = {
        image: 'bg-zinc-100 border-black/5 text-zinc-500',
        video: 'bg-indigo-50 border-indigo-200 text-indigo-600',
        audio: 'bg-zinc-50 border-black/5 text-zinc-400',
        music: 'bg-blue-50 border-blue-200 text-blue-600',
        effect: 'bg-amber-50 border-amber-200 text-amber-600',
        overlay: 'bg-blue-50 border-blue-200 text-blue-600',
        sfx: 'bg-zinc-50 border-black/5 text-zinc-400'
    }[type];

    const Icon = {
        image: Image,
        video: Film,
        audio: Mic,
        music: Music,
        effect: Sparkles,
        overlay: Layers,
        sfx: Mic
    }[type];

    // Detection for symbolic/special clips to avoid 404s and show premium placeholders
    const isSpecialClip = url === 'intro' || url === 'outro' || url === 'news-card' || url === 'news-anchor' || url === 'news-lower-third';
    
    // Improved thumbnail logic
    const renderThumbnail = () => {
        if (!url || type === 'audio' || type === 'music' || type === 'sfx') return null;

        if (isSpecialClip) {
            // High-Lux Placeholder for special segments
            return (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm pointer-events-none">
                    {url === 'intro' && <Globe className="w-8 h-8 text-blue-500/40" />}
                    {url === 'outro' && <Star className="w-8 h-8 text-blue-500/40" />}
                    {url === 'news-card' && <Sparkles className="w-8 h-8 text-amber-500/40" />}
                </div>
            );
        }

        return (
            <div className="absolute inset-0 opacity-80 pointer-events-none">
                {type === 'image' ? (
                    <img src={url} className="w-full h-full object-cover" alt="" />
                ) : (
                    <video src={url} className="w-full h-full object-cover" muted />
                )}
            </div>
        );
    };

    return (
        <div 
            onClick={onClick}
            onMouseDown={onMouseDown}
            className={cn(
                "absolute top-0 bottom-0 rounded-sm border flex items-center overflow-hidden cursor-pointer transition-all hover:brightness-125 select-none",
                baseColor,
                isSelected ? "ring-2 ring-studio-accent ring-offset-1 ring-offset-white brightness-110 z-10" : "z-0",
                className
            )}
            style={{ 
                left: `${leftPx}px`, 
                width: `${Math.max(widthPx, 20)}px` 
            }}
        >
            {/* Audio Waveform for Audio/Music tracks (Only if real URL) */}
            {url && !isSpecialClip && (type === 'audio' || type === 'music') && (
                <div className="absolute inset-0 pointer-events-none">
                    <AudioWaveform 
                        url={resolveAsset(url) || url} 
                        color={type === 'audio' ? "#71717a" : "#6366f1"} 
                        className="w-full h-full"
                    />
                </div>
            )}

            {/* Background Thumbnail if available */}
            {renderThumbnail()}
            
            <div className="relative z-10 flex items-center gap-1.5 px-2 w-full h-full">
                <Icon className="w-3 h-3 shrink-0" />
                <span className="text-[10px] font-bold truncate tracking-wider">
                    {label || type.toUpperCase()}
                </span>
            </div>

            {/* Selection Handles (Unlocked for all media types) */}
            {isSelected && (
                <>
                    <div 
                        onMouseDown={(e) => { e.stopPropagation(); onResizeStartLeft?.(e); }}
                        className="absolute left-0 top-0 bottom-0 w-2 bg-studio-accent/20 cursor-ew-resize hover:bg-studio-accent z-20" 
                    />
                    <div 
                        onMouseDown={(e) => { e.stopPropagation(); onResizeStartRight?.(e); }}
                        className="absolute right-0 top-0 bottom-0 w-2 bg-studio-accent/20 cursor-ew-resize hover:bg-studio-accent z-20" 
                    />
                </>
            )}
        </div>
    );
});
MediaBlock.displayName = 'MediaBlock';
