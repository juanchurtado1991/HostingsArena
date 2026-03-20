"use client";

import React from "react";
import { Share2, Sparkles, Loader2 } from "lucide-react";

interface PostEditorSocialProps {
  editLang: "en" | "es";
  socialTw: string;
  setSocialTw: (v: string) => void;
  socialTwEs: string;
  setSocialTwEs: (v: string) => void;
  socialFb: string;
  setSocialFb: (v: string) => void;
  socialFbEs: string;
  setSocialFbEs: (v: string) => void;
  socialLi: string;
  setSocialLi: (v: string) => void;
  socialLiEs: string;
  setSocialLiEs: (v: string) => void;
  socialTags: string;
  setSocialTags: (v: string) => void;
  socialTagsEs: string;
  setSocialTagsEs: (v: string) => void;
  handleGenerateSocial: () => Promise<void>;
  isTranslating: boolean;
  coverImageUrl: string;
  title: string;
  titleEs: string;
  seoTitle: string;
  seoTitleEs: string;
  seoDesc: string;
  seoDescEs: string;
  excerpt: string;
  excerptEs: string;
}

const INPUT_CLASS = "w-full px-4 py-3 rounded-2xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-200 placeholder:text-muted-foreground/50";

export function PostEditorSocial({
  editLang,
  socialTw,
  setSocialTw,
  socialTwEs,
  setSocialTwEs,
  socialFb,
  setSocialFb,
  socialFbEs,
  setSocialFbEs,
  socialLi,
  setSocialLi,
  socialLiEs,
  setSocialLiEs,
  socialTags,
  setSocialTags,
  socialTagsEs,
  setSocialTagsEs,
  handleGenerateSocial,
  isTranslating,
  coverImageUrl,
  title,
  titleEs,
  seoTitle,
  seoTitleEs,
  seoDesc,
  seoDescEs,
  excerpt,
  excerptEs,
}: PostEditorSocialProps) {
  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8">
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-500/10 mb-6">
        <div>
          <h3 className="text-sm font-bold text-foreground">Social Media Content ({editLang.toUpperCase()})</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Customize your social posts for {editLang === "en" ? "English" : "Spanish"} audiences.
          </p>
        </div>
        <button
          onClick={handleGenerateSocial}
          disabled={isTranslating}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold bg-white dark:bg-zinc-800 border border-border/50 shadow-sm hover:scale-105 transition-all disabled:opacity-50"
        >
          {isTranslating ? (
            <Loader2 className="w-3 h-3 animate-spin text-primary" />
          ) : (
            <Sparkles className="w-3 h-3 text-primary" />
          )}
          REGENERATE SOCIAL (AI)
        </button>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-foreground" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
            </svg>
            Twitter Post ({editLang.toUpperCase()})
          </label>
          <span
            className={`text-[10px] font-mono ${
              (editLang === "es" ? socialTwEs : socialTw).length > 280 ? "text-red-400" : "text-muted-foreground"
            }`}
          >
            {(editLang === "es" ? socialTwEs : socialTw).length}/280
          </span>
        </div>

        <div className="p-4 rounded-xl border border-border/50 bg-card max-w-md mx-auto shadow-sm">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold">HostingArena</span>
                <span className="text-xs text-muted-foreground">@hostingarena · 1m</span>
              </div>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                {(editLang === "es" ? socialTwEs || socialTw : socialTw) || "Write something amazing..."}{" "}
                {editLang === "es" ? socialTagsEs : socialTags}
              </p>
              {coverImageUrl && (
                <div className="mt-2 rounded-xl overflow-hidden border border-border/50">
                  <img src={coverImageUrl} alt="Preview" className="w-full aspect-video object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>

        <textarea
          value={editLang === "es" ? socialTwEs : socialTw}
          onChange={(e) => (editLang === "es" ? setSocialTwEs(e.target.value) : setSocialTw(e.target.value))}
          placeholder="What's happening?"
          className={`${INPUT_CLASS} h-24 resize-none font-medium`}
        />
      </div>

      <div className="h-px bg-border/50" />

      <div className="space-y-4">
        <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-foreground" aria-hidden="true">
            <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path>
          </svg>
          Facebook Post ({editLang.toUpperCase()})
        </label>

        <div className="p-4 rounded-xl border border-border/50 bg-card max-w-md mx-auto shadow-sm">
          <div className="flex gap-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-600">HostingsArena</p>
              <p className="text-xs text-muted-foreground">Just now · 🌍</p>
            </div>
          </div>
          <p className="text-sm text-foreground/90 whitespace-pre-wrap mb-3">
            {editLang === "es" ? socialFbEs || socialFb || "What's on your mind?" : socialFb || "What's on your mind?"}
          </p>
          {coverImageUrl && (
            <div className="rounded-lg overflow-hidden border border-border/50 bg-muted/20">
              <img src={coverImageUrl} alt="Preview" className="w-full aspect-video object-cover" />
              <div className="p-3 bg-muted/30 border-t border-border/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                  HOSTINGSARENA.COM
                </p>
                <p className="text-sm font-bold text-foreground mt-1">
                  {editLang === "es" ? titleEs || "Article Title" : title || "Article Title"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {editLang === "es" ? seoDescEs || excerptEs : seoDesc || excerpt || "Read the full article..."}
                </p>
              </div>
            </div>
          )}
          <p className="text-sm text-blue-500 font-medium whitespace-pre-wrap mt-3">
            {editLang === "es" ? socialTagsEs : socialTags}
          </p>
        </div>

        <textarea
          value={editLang === "es" ? socialFbEs : socialFb}
          onChange={(e) => (editLang === "es" ? setSocialFbEs(e.target.value) : setSocialFb(e.target.value))}
          placeholder="Share on Facebook..."
          className={`${INPUT_CLASS} h-24 resize-none font-medium`}
        />
      </div>

      <div className="h-px bg-border/50" />

      <div className="space-y-4">
        <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#0077b5]" aria-hidden="true">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          LinkedIn Post ({editLang.toUpperCase()})
        </label>

        <div className="p-4 rounded-xl border border-border/50 bg-card max-w-md mx-auto shadow-sm">
          <div className="flex gap-2 mb-3">
            <div className="w-10 h-10 rounded-sm bg-primary/10 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">HostingsArena</p>
              <p className="text-xs text-muted-foreground">redefining verified benchmarks.</p>
            </div>
          </div>
          <p className="text-sm text-foreground/90 whitespace-pre-wrap mb-3">
            {editLang === "es" ? socialLiEs || socialLi || "Share your professional insights..." : socialLi || "Share your professional insights..."}
          </p>
          <p className="text-sm text-blue-500 font-medium whitespace-pre-wrap mb-3">
            {editLang === "es" ? socialTagsEs : socialTags}
          </p>
          {coverImageUrl && (
            <div className="rounded-sm overflow-hidden border border-border/50 bg-muted/20">
              <img src={coverImageUrl} alt="Preview" className="w-full aspect-video object-cover" />
              <div className="p-2 bg-muted/30">
                <p className="text-xs font-semibold">
                  {editLang === "es" ? seoTitleEs || titleEs || "Article Title" : seoTitle || title || "Article Title"}
                </p>
                <p className="text-[10px] text-muted-foreground">hostingarena.com</p>
              </div>
            </div>
          )}
        </div>

        <textarea
          value={editLang === "es" ? socialLiEs : socialLi}
          onChange={(e) => (editLang === "es" ? setSocialLiEs(e.target.value) : setSocialLi(e.target.value))}
          placeholder="Share on LinkedIn..."
          className={`${INPUT_CLASS} h-32 resize-none`}
        />
      </div>

      <div className="h-px bg-border/50" />

      <div>
        <label className="block text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2.5">
          Hashtags {editLang === "es" ? "(ES)" : "(EN)"}
        </label>
        <input
          type="text"
          value={editLang === "es" ? socialTagsEs : socialTags}
          onChange={(e) => (editLang === "es" ? setSocialTagsEs(e.target.value) : setSocialTags(e.target.value))}
          placeholder="#webhosting #tech #review"
          className={INPUT_CLASS}
        />
        {(editLang === "es" ? socialTagsEs : socialTags) && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {(editLang === "es" ? socialTagsEs : socialTags).split(" ").map(
              (t, i) =>
                t.trim() && (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-medium border border-blue-500/15"
                  >
                    {t.startsWith("#") ? t : `#${t}`}
                  </span>
                )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
