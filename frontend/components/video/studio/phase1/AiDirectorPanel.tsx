"use client";
import React from "react";
import { Sparkles, CheckCircle, Clock, RotateCcw, Loader2, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentState } from "@/hooks/useVideoAgent";

interface Props {
  agent: AgentState & {
    approveScript: () => void;
    rejectScript:  (f: string) => void;
  };
}

export function AiDirectorPanel({ agent }: Props) {
  const [feedback, setFeedback] = React.useState("");
  const isVisible = agent.status !== "idle";

  if (!isVisible) return null;

    return (
      <div className="glass-card bg-white/[0.03] border-white/10 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 bg-white/5">
          <div className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center text-studio-accent border border-studio-accent/20 bg-studio-accent/10",
            agent.status === "thinking" && "animate-pulse shadow-[0_0_15px_rgba(70,130,255,0.3)]"
          )}>
            <Brain className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-studio-accent">AI Status</p>
            <p className="text-[11px] text-zinc-400 mt-0.5 font-medium">{agent.statusMessage || "En espera..."}</p>
          </div>
          {agent.status === "thinking" && <Loader2 className="w-4 h-4 text-studio-accent animate-spin" />}
          {agent.status === "done"     && <CheckCircle className="w-4 h-4 text-emerald-500" />}
        </div>
  
        {/* Streaming Script */}
        {(agent.streamedText || agent.script) && agent.status !== "waiting_approval" && (
          <div className="px-5 py-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-3">Narrativa en proceso</p>
            <div className="max-h-48 overflow-y-auto custom-scrollbar">
              <p className="text-[11px] text-zinc-300 leading-relaxed font-medium whitespace-pre-wrap">
                {agent.streamedText || agent.script}
                {agent.status === "thinking" && (
                  <span className="inline-block w-1.5 h-3.5 bg-studio-accent ml-0.5 animate-pulse rounded-sm" />
                )}
              </p>
            </div>
          </div>
        )}
  
        {/* HITL: Aprobación */}
        {agent.status === "waiting_approval" && (
          <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-5 bg-studio-accent/5">
            <div className="p-3 rounded-xl bg-studio-accent/10 border border-studio-accent/20">
                <p className="text-[10px] font-bold text-studio-accent leading-relaxed">
                  ✨ Guion listo. ¿Quieres ajustar algo antes de sincronizar el video?
                </p>
            </div>

            <div className="relative group">
                <input
                    type="text"
                    placeholder="Ej: más corto, enfatiza la IA..."
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    className="w-full text-[11px] bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-studio-accent/50 transition-all placeholder:text-zinc-600"
                />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => agent.rejectScript(feedback)}
                className="flex-[0.4] h-10 rounded-xl text-[9px] font-black uppercase tracking-wider border border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Ajustar
              </button>
              <button
                onClick={agent.approveScript}
                className="flex-1 h-10 rounded-xl text-[9px] font-black uppercase tracking-wider bg-studio-accent text-white shadow-lg shadow-studio-accent/25 hover:opacity-90 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Aprobar y Sincronizar
              </button>
            </div>
          </div>
        )}
      </div>
  );
}
