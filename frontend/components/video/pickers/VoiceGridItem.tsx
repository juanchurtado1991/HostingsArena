"use client";

import React from "react";
import { Play, Pause, CheckCircle, Mic, Globe, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Voice {
    id: string;
    name: string;
    gender?: 'male' | 'female';
    category?: 'premade' | 'professional' | 'cloned' | 'generated' | 'other';
    accent?: string;
    descriptive?: string;
    preview_url?: string;
}

interface VoiceGridItemProps {
    voice: Voice;
    isPlaying: boolean;
    isSelected: boolean;
    isLoading: boolean;
    onPreview: (e: React.MouseEvent) => void;
    onClick: () => void;
}

export function VoiceGridItem({ voice, isPlaying, isSelected, isLoading, onPreview, onClick }: VoiceGridItemProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "flex items-center gap-6 p-4 rounded-2xl border transition-all cursor-pointer group/item",
                isSelected 
                    ? "bg-studio-accent/5 border-studio-accent/40 shadow-[0_4px_12px_rgba(0,122,255,0.05)]" 
                    : "bg-white border-black/5 hover:border-black/10 hover:bg-zinc-50 shadow-sm"
            )}
        >
            <button 
                onClick={onPreview}
                className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all shadow-xl active:scale-90",
                    isPlaying 
                        ? "bg-studio-accent text-white shadow-[0_4px_12px_rgba(0,122,255,0.4)] animate-pulse" 
                        : "bg-black/5 text-zinc-500 border border-black/5 hover:text-zinc-900 hover:border-studio-accent/30"
                )}
                disabled={isLoading}
            >
                {isLoading ? (
                    <Sparkles className="w-5 h-5 animate-spin" />
                ) : isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                ) : (
                    <Play className="w-5 h-5 fill-current ml-1" />
                )}
            </button>
            
            <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-black uppercase tracking-tight italic transition-colors truncate", isSelected ? "text-studio-accent" : "text-zinc-900 group-hover/item:text-studio-accent")}>
                    {voice.name}
                </p>
                <div className="flex items-center gap-3 mt-1.5 opacity-60">
                    <span className="text-[9px] font-black uppercase text-zinc-500">
                        {voice.accent || 'Neural'}
                    </span>
                    <div className="w-1 h-1 bg-zinc-200 rounded-full" />
                    <span className="text-[9px] font-black uppercase text-zinc-400">
                        {voice.gender?.charAt(0).toUpperCase()} ENGINE
                    </span>
                    {voice.category === 'cloned' && (
                        <Globe className="w-3 h-3 text-studio-accent/40 ml-auto" />
                    )}
                </div>
            </div>
            
            {isSelected && (
                <div className="p-1 px-3 rounded-full bg-studio-accent/10 border border-studio-accent/20 shadow-[0_0_10px_rgba(70,130,255,0.1)] animate-in zoom-in">
                    <CheckCircle className="w-4 h-4 text-studio-accent" />
                </div>
            )}
        </div>
    );
}
