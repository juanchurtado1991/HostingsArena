"use client";

import React from "react";
import { Play, Pause, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { type AudioItem } from "@/components/video/audioLibrary";

interface AudioGridItemProps {
    item: AudioItem;
    isPlaying: boolean;
    isSelected: boolean;
    onTogglePlay: (e: React.MouseEvent) => void;
    onClick: () => void;
}

export function AudioGridItem({ item, isPlaying, isSelected, onTogglePlay, onClick }: AudioGridItemProps) {
    return (
        <div 
            onClick={onClick}
            className={cn(
                "flex items-center gap-6 p-4 rounded-2xl border transition-all cursor-pointer group/item",
                isSelected
                    ? "bg-studio-accent/5 border-studio-accent/30 shadow-[0_4px_12px_rgba(0,122,255,0.05)]" 
                    : "bg-white border-black/5 hover:border-black/10 hover:bg-zinc-50 shadow-sm"
            )}
        >
            <button 
                onClick={onTogglePlay}
                className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-xl active:scale-90",
                    isPlaying 
                        ? "bg-studio-accent text-white shadow-[0_4px_12px_rgba(0,122,255,0.4)]" 
                        : "bg-black/5 text-zinc-500 border border-black/5 group-hover/item:text-zinc-900 group-hover/item:border-studio-accent/30 font-black"
                )}
            >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
            </button>

            <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-black uppercase tracking-tight italic transition-colors", isSelected ? "text-studio-accent" : "text-zinc-900 group-hover/item:text-studio-accent")}>
                    {item.label}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[9px] font-black uppercase text-zinc-500 tracking-[0.2em] px-2 py-0.5 rounded-md bg-black/5 border border-black/5">
                        {item.keywords[0]}
                    </span>
                    <div className="w-1 h-1 rounded-full bg-zinc-800" />
                    <span className="text-[10px] font-black text-studio-accent/40 uppercase tracking-widest italic">
                        {item.duration ? `${Math.floor(item.duration / 60)}:${(item.duration % 60).toString().padStart(2, '0')}` : 'STREAM'}
                    </span>
                </div>
            </div>

            {isSelected && (
                <div className="p-1 px-3 rounded-full bg-studio-accent/10 border border-studio-accent/20 shadow-[0_0_10px_rgba(70,130,255,0.1)]">
                    <CheckCircle className="w-4 h-4 text-studio-accent animate-in zoom-in" />
                </div>
            )}
        </div>
    );
}
