"use client";
import React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Badge visual "✨ AI Suggested" que se muestra en los Pickers
// cuando el agente ha pre-seleccionado un asset para una escena.

interface AiSuggestedBadgeProps {
  label?: string;
  className?: string;
}

export function AiSuggestedBadge({ label = "AI Suggested", className }: AiSuggestedBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
      "bg-studio-accent text-white shadow-lg shadow-studio-accent/30 animate-in fade-in duration-300",
      className
    )}>
      <Sparkles className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}

// Sección "AI Suggested" para los Pickers (muestra assets sugeridos arriba)
interface AiSuggestedSectionProps {
  suggestions: any[];          // Assets sugeridos por el agente
  onSelect: (item: any) => void;
  renderItem: (item: any, onClick: () => void) => React.ReactNode;
}

export function AiSuggestedSection({ suggestions, onSelect, renderItem }: AiSuggestedSectionProps) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-400">
      <div className="flex items-center gap-2 mb-2 px-1">
        <AiSuggestedBadge />
        <span className="text-[9px] text-zinc-400 font-medium">
          El agente escogió estos para tus escenas
        </span>
      </div>
      <div className="rounded-2xl border border-studio-accent/20 bg-studio-accent/5 p-3 space-y-1">
        {suggestions.map((item, i) => (
          <div key={i} className="relative">
            {renderItem(item, () => onSelect(item))}
          </div>
        ))}
      </div>
    </div>
  );
}
