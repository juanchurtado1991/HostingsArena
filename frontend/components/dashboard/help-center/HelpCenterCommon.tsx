"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Sparkles, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function AccordionSection({ title, icon: Icon, children, defaultOpen = false }: {
    title: string;
    icon: any;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border border-white/10 rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                        <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm">{title}</span>
                </div>
                {open ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
            </button>
            {open && (
                <div className="px-4 pb-4 pt-1 border-t border-white/5 space-y-3 text-sm text-muted-foreground leading-relaxed animate-in slide-in-from-top-2 duration-200">
                    {children}
                </div>
            )}
        </div>
    );
}

export function Tip({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex gap-2 p-3 rounded-lg bg-primary/5 border border-primary/15 text-primary text-xs">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{children}</span>
        </div>
    );
}

export function Warning({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-amber-400 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{children}</span>
        </div>
    );
}

export function Step({ n, title, children }: { n: number; title: string; children?: React.ReactNode }) {
    return (
        <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-black flex items-center justify-center shrink-0 mt-0.5">{n}</div>
            <div>
                <div className="font-semibold text-foreground text-sm">{title}</div>
                {children && <div className="text-muted-foreground text-xs mt-0.5">{children}</div>}
            </div>
        </div>
    );
}

export function Badge({ color, label }: { color: string; label: string }) {
    return (
        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", color)}>
            {label}
        </span>
    );
}
