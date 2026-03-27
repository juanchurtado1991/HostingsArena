"use client";
import React, { useState, useEffect } from "react";
import { Clock, RotateCcw, X, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVideoStudio } from "@/contexts/VideoStudioContext";
import { parseScript } from "@/components/video/studio/phase1/scriptParser";

interface TimeTravelHistoryItem {
  checkpoint_id: string;
  phase: number;
  script: string;
  timestamp: string;
}

interface TimeTravelModalProps {
  isOpen: boolean;
  onClose: () => void;
  threadId: string;
}

export function TimeTravelModal({ isOpen, onClose, threadId }: TimeTravelModalProps) {
  const [history, setHistory]   = useState<TimeTravelHistoryItem[]>([]);
  const [loading, setLoading]   = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const { setScenes, format } = useVideoStudio();

  useEffect(() => {
    if (!isOpen || !threadId) return;
    setLoading(true);
    fetch(`/api/admin/video/agent?threadId=${threadId}`)
      .then(r => r.json())
      .then(d => setHistory(d.history ?? []))
      .finally(() => setLoading(false));
  }, [isOpen, threadId]);

  const handleRestore = async (item: TimeTravelHistoryItem) => {
    if (!item.script) return;
    setRestoring(item.checkpoint_id);
    try {
      const parsed = parseScript(item.script, format);
      setScenes(parsed.map(s => ({ ...s, assetUrl: undefined, voiceUrl: undefined, titleCardEnabled: true })));
    } finally {
      setRestoring(null);
      onClose();
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="glass-card w-full max-w-md max-h-[70vh] flex flex-col overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.5)] border border-white/10 animate-in zoom-in-95 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-6 py-4 border-b border-studio-border">
          <div className="w-9 h-9 rounded-xl bg-studio-accent/10 flex items-center justify-center text-studio-accent border border-studio-accent/20">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-studio-accent">Time Travel</p>
            <p className="text-[11px] text-zinc-500">Historial de estados del proyecto</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-zinc-100 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-10 gap-2 text-studio-accent">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-widest">Cargando historial...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-zinc-400">
              <Clock className="w-8 h-8 opacity-30" />
              <p className="text-[10px] font-bold uppercase tracking-wider">Sin historial disponible</p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {history.map((item, i) => (
                <div key={item.checkpoint_id} className="flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border border-zinc-100 hover:border-studio-accent/20 transition-all group">
                  <div className={cn("w-2 h-2 rounded-full shrink-0", i === 0 ? "bg-studio-accent" : "bg-zinc-300")} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-zinc-700">Fase {item.phase ?? "??"}</p>
                    <p className="text-[9px] text-zinc-400 truncate">{item.script || "Sin guion"}</p>
                    <p className="text-[8px] text-zinc-300 mt-0.5">{item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : ""}</p>
                  </div>
                  <button
                    onClick={() => handleRestore(item)}
                    disabled={!!restoring}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-wider border border-studio-accent/25 text-studio-accent hover:bg-studio-accent hover:text-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    {restoring === item.checkpoint_id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                    Restore
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
