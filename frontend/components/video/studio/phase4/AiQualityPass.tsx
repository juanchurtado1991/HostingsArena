"use client";
import React from "react";
import { CheckCircle, XCircle, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface QualityChecks { timings: boolean; media: boolean; audio: boolean; }

interface AiQualityPassProps {
  checks: QualityChecks | null;
  isLoading?: boolean;
}

const CHECK_LABELS: { key: keyof QualityChecks; label: string }[] = [
  { key: "timings", label: "Tiempos del Timeline alineados" },
  { key: "media",   label: "Media cargada en todas las escenas" },
  { key: "audio",   label: "Audio Ducking configurado" },
];

export function AiQualityPass({ checks, isLoading }: AiQualityPassProps) {
  return (
    <div className="glass-card border-studio-accent/20 overflow-hidden animate-in fade-in duration-400">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-studio-border bg-studio-accent/5">
        <div className="w-8 h-8 rounded-xl bg-studio-accent/10 flex items-center justify-center text-studio-accent border border-studio-accent/20">
          <Sparkles className="w-4 h-4" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-studio-accent flex-1">
          AI Quality Pass
        </p>
        {isLoading && <Loader2 className="w-3.5 h-3.5 text-studio-accent animate-spin" />}
      </div>
      <div className="px-5 py-4 space-y-2.5">
        {CHECK_LABELS.map(({ key, label }) => {
          const passed = checks ? checks[key] : null;
          return (
            <div key={key} className="flex items-center gap-3">
              {isLoading || passed === null ? (
                <div className="w-4 h-4 rounded-full border-2 border-zinc-200 animate-pulse" />
              ) : passed ? (
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span className={cn(
                "text-[11px] font-medium",
                isLoading || passed === null ? "text-zinc-400" : passed ? "text-zinc-700" : "text-red-400"
              )}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
