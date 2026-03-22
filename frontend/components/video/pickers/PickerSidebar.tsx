"use client";

import React from "react";
import { Activity, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PickerSidebarProps {
    title?: string;
    description?: string;
    icon: React.ReactNode;
    isPlaying: boolean;
    onConfirm: () => void;
    confirmDisabled: boolean;
    confirmLabel: string;
    children: React.ReactNode;
    spectralType?: 'audio' | 'voice' | 'media';
}

export function PickerSidebar({
    title = "",
    description = "",
    icon,
    isPlaying,
    onConfirm,
    confirmDisabled,
    confirmLabel,
    children,
    spectralType = 'audio'
}: PickerSidebarProps) {
    return (
        <>
            <div className="absolute top-0 right-0 w-64 h-64 bg-studio-accent/5 rounded-full blur-[100px] -mr-32 -mt-32 opacity-20" />
            
            <div className="relative z-10 flex items-center gap-3 mb-10 shrink-0">
                <div className="text-studio-accent">{icon}</div>
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.3em]">{title}</span>
            </div>
            
            <div className="flex-1 space-y-10 text-center relative z-10 overflow-y-auto custom-scrollbar pr-2 mb-6">
                {children}
            </div>

            <div className="mt-auto pt-4 border-t border-studio-border relative z-10 shrink-0">
                <Button 
                    className="w-full h-14 rounded-2xl bg-studio-accent hover:opacity-90 text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-[0_8px_24px_rgba(0,122,255,0.3)] transition-all active:scale-95 flex items-center justify-center gap-4" 
                    disabled={confirmDisabled}
                    onClick={onConfirm}
                >
                    <CheckCircle className="w-4 h-4" />
                    {confirmLabel}
                </Button>
            </div>
        </>
    );
}

export function PickerMonitor({ isPlaying, icon, active, children }: { isPlaying: boolean, icon: React.ReactNode, active: boolean, children?: React.ReactNode }) {
    return (
        <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden border border-black/[0.03] bg-white shadow-[inset_0_2px_10px_rgba(0,0,0,0.02),0_15px_35px_-5px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center group/monitor transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-b from-studio-accent/[0.03] to-transparent opacity-50" />
            
            {isPlaying ? (
                <div className="flex items-center gap-2 h-24 px-8 w-full justify-center">
                    {[...Array(12)].map((_, i) => (
                        <div 
                            key={i} 
                            className="w-2 bg-studio-accent rounded-full animate-pulse shadow-[0_0_15px_rgba(70,130,255,0.4)]" 
                            style={{ 
                                height: `${30 + Math.random() * 70}%`, 
                                animationDuration: `${0.4 + Math.random() * 0.6}s`,
                                animationDelay: `${i * 0.05}s` 
                            }} 
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center gap-6 opacity-40 group-hover/monitor:opacity-80 transition-opacity duration-700">
                    <div className="text-zinc-900">{icon}</div>
                    <div className="h-[2px] w-32 bg-gradient-to-r from-transparent via-black/[0.05] to-transparent" />
                </div>
            )}
            
            <div className="absolute bottom-6 left-0 right-0 px-6 flex justify-between items-center">
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-studio-accent/40 animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-studio-accent/40 animate-pulse delay-75" />
                </div>
            </div>
            {children}
        </div>
    );
}
