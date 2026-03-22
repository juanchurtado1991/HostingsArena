"use client";

import React from "react";
import { CheckCircle, Video as VideoIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getImageUrl, getMediaThumbnail } from "../mediaLibrary";

// Using the actual MediaItem type from mediaLibrary.ts
interface MediaItem {
    type: 'image' | 'video';
    keywords: string[];
    url: string;
}

interface MediaGridItemProps {
    item: MediaItem;
    isSelected: boolean;
    onClick: () => void;
}

export function MediaGridItem({ item, isSelected, onClick }: MediaGridItemProps) {
    // Derive a label from the URL or keywords
    const label = item.keywords[0] || item.url.split('/').pop() || 'Asset';

    return (
        <div 
            onClick={onClick}
            className={cn(
                "relative aspect-video rounded-2xl overflow-hidden cursor-pointer group transition-all border-2",
                isSelected 
                    ? "border-studio-accent shadow-[0_0_20px_rgba(0,122,255,0.2)] scale-[0.98] bg-studio-accent/5" 
                    : "border-transparent bg-white shadow-sm hover:border-black/10"
            )}
        >
            {item.type === 'video' ? (
                <video 
                    src={item.url} 
                    poster={getMediaThumbnail(item)}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    preload="none"
                    onMouseOver={(e) => e.currentTarget.play()}
                    onMouseOut={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                />
            ) : (
                <img 
                    src={getMediaThumbnail(item)} 
                    alt={label} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                />
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center transform translate-y-2 group-hover:translate-y-0 transition-transform">
                <span className="text-[10px] font-black text-white uppercase tracking-wider truncate drop-shadow-md">
                    {label}
                </span>
                {item.type === 'video' && (
                    <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/30">
                        <VideoIcon className="w-3 h-3 text-white" />
                    </div>
                )}
            </div>

            {isSelected && (
                <div className="absolute top-3 right-3 p-1 px-3 rounded-full bg-studio-accent/10 border border-studio-accent/20 shadow-[0_0_10px_rgba(70,130,255,0.1)] backdrop-blur-md animate-in zoom-in">
                    <CheckCircle className="w-4 h-4 text-studio-accent" />
                </div>
            )}
        </div>
    );
}
