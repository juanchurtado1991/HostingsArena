"use client";

import React from "react";
import { X, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PickerBaseProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle: string;
    tabs: readonly string[];
    activeTab: string;
    onTabChange: (tab: any) => void;
    children: React.ReactNode;
    sidebar: React.ReactNode;
    renderTabLabel?: (tab: string) => string;
}

export function PickerBase({
    isOpen,
    onClose,
    title,
    subtitle,
    tabs,
    activeTab,
    onTabChange,
    children,
    sidebar,
    renderTabLabel
}: PickerBaseProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-8">
            <div 
                className="absolute inset-0 bg-black/5 backdrop-blur-2xl animate-in fade-in duration-300" 
                onClick={onClose} 
            />
            
            <div className="relative w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden bg-studio-surface rounded-none border border-studio-border shadow-[0_32px_64px_rgba(0,0,0,0.1)] animate-in fade-in zoom-in duration-500 glass-card">
                
                {/* Header */}
                <div className="p-8 border-b border-black/5 flex items-center justify-between gap-8 bg-white">
                    <div className="flex items-center gap-8">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black uppercase tracking-[0.1em] text-zinc-900 italic">
                                {title}
                            </h3>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">{subtitle}</p>
                        </div>
                        <div className="flex p-1.5 bg-black/5 rounded-[1.25rem] border border-black/5 shadow-inner">
                            {tabs.map(t => (
                                <button
                                    key={t}
                                    onClick={() => onTabChange(t)}
                                    className={cn(
                                        "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest whitespace-nowrap",
                                        activeTab === t 
                                            ? "bg-studio-accent text-white shadow-[0_4px_12px_rgba(0,122,255,0.3)]"
                                            : "text-zinc-500 hover:text-zinc-900 hover:bg-black/5"
                                    )}
                                >
                                    {renderTabLabel ? renderTabLabel(t) : t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 flex items-center justify-center hover:bg-black/5 rounded-2xl transition-all text-zinc-400 hover:text-studio-accent group">
                        <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden bg-studio-bg/30">
                    {/* Browser Area */}
                    <div className="flex-1 flex flex-col p-8 min-w-0 border-r border-studio-border">
                        {children}
                    </div>

                    {/* Sidebar Area */}
                    <div className="w-96 p-10 flex flex-col bg-white shrink-0 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-studio-accent/[0.03] via-transparent to-transparent opacity-50" />
                        {sidebar}
                    </div>
                </div>
            </div>
        </div>
    );
}
