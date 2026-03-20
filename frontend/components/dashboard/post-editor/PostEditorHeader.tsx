"use client";

import React from "react";
import { 
  Edit3, Loader2, CheckCircle, X, Save, Send 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PostEditorHeaderProps {
  post: any;
  status: string;
  setStatus: (v: string) => void;
  scheduledDate: string;
  setScheduledDate: (v: string) => void;
  shouldIndexGoogle: boolean;
  setShouldIndexGoogle: (v: boolean) => void;
  saving: boolean;
  handleSave: (publish?: boolean) => Promise<void>;
  onClose: () => void;
  wordCount: number;
  lastSavedAt: Date | null;
  isAutoSaving: boolean;
  editLang: "en" | "es";
  title: string;
  titleEs: string;
}

export function PostEditorHeader({
  post,
  status,
  setStatus,
  scheduledDate,
  setScheduledDate,
  shouldIndexGoogle,
  setShouldIndexGoogle,
  saving,
  handleSave,
  onClose,
  wordCount,
  lastSavedAt,
  isAutoSaving,
  editLang,
  title,
  titleEs,
}: PostEditorHeaderProps) {
  return (
    <div className="flex flex-col border-b border-border/50 bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
      <div className="flex items-center justify-between px-4 md:px-6 pt-3 pb-2 md:pt-4 md:pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary/20 to-primary/15 shadow-lg shadow-primary/10 shrink-0">
            <Edit3 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base md:text-xl font-bold tracking-tight">
              {post ? "Edit Post" : "New Post"}
            </h2>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {post?.is_ai_generated && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/15">
                  🤖 AI
                </span>
              )}
              <span className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                {wordCount}w
                {(lastSavedAt || isAutoSaving) && <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />}
                {isAutoSaving ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-primary animate-pulse">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    Saving...
                  </span>
                ) : lastSavedAt ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500/80">
                    <CheckCircle className="w-2.5 h-2.5" />
                    Saved {lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                ) : null}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-muted/50 transition-all duration-200 group shrink-0"
        >
          <X className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
      </div>

      <div className="flex items-center gap-2 px-4 md:px-6 pb-3 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/50 border border-border shrink-0">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="draft">📝 Draft</option>
            <option value="published">✅ Published</option>
          </select>
        </div>

        {status === "published" && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/50 border border-border shrink-0"
            title="Publish Date (El Salvador Time UTC-6)"
          >
            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer outline-none [color-scheme:dark] dark:[color-scheme:dark] light:[color-scheme:light]"
            />
          </div>
        )}

        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/50 border border-border cursor-pointer hover:bg-muted/80 transition-colors shrink-0"
          onClick={() => setShouldIndexGoogle(!shouldIndexGoogle)}
          title="Toggle Google Indexing on Publish"
        >
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              shouldIndexGoogle ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500/50"
            }`}
          />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80 font-bold">G-Index</span>
        </div>

        <div className="flex-1" />

        <div className="flex gap-1.5 shrink-0">
          <Button
            onClick={() => handleSave()}
            className="rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border shadow-sm text-xs font-semibold px-3 h-8 transition-all duration-200"
            disabled={saving || (!title.trim() && editLang === "en") || (!titleEs.trim() && editLang === "es")}
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span className="hidden sm:inline ml-1.5">Save Draft</span>
              </>
            )}
          </Button>

          <Button
            onClick={() => handleSave(true)}
            className="rounded-xl bg-gradient-to-r from-primary to-sky-600 hover:from-blue-500 hover:to-sky-500 shadow-lg shadow-primary/25 text-xs font-semibold px-3 h-8 transition-all duration-200"
            disabled={saving || (!title.trim() && editLang === "en") || (!titleEs.trim() && editLang === "es")}
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span className="ml-1.5">Publish</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
