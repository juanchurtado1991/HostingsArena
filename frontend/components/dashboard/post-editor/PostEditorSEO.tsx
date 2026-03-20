"use client";

import React from "react";
import { Search } from "lucide-react";

interface PostEditorSEOProps {
  editLang: "en" | "es";
  seoTitle: string;
  setSeoTitle: (v: string) => void;
  seoTitleEs: string;
  setSeoTitleEs: (v: string) => void;
  seoDesc: string;
  setSeoDesc: (v: string) => void;
  seoDescEs: string;
  setSeoDescEs: (v: string) => void;
  keywords: string;
  setKeywords: (v: string) => void;
  keywordsEs: string;
  setKeywordsEs: (v: string) => void;
  title: string;
  titleEs: string;
  excerpt: string;
  excerptEs: string;
  slug: string;
}

const INPUT_CLASS = "w-full px-4 py-3 rounded-2xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-200 placeholder:text-muted-foreground/50";

export function PostEditorSEO({
  editLang,
  seoTitle,
  setSeoTitle,
  seoTitleEs,
  setSeoTitleEs,
  seoDesc,
  setSeoDesc,
  seoDescEs,
  setSeoDescEs,
  keywords,
  setKeywords,
  keywordsEs,
  setKeywordsEs,
  title,
  titleEs,
  excerpt,
  excerptEs,
  slug,
}: PostEditorSEOProps) {
  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-6">
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border border-blue-500/10">
        <p className="text-xs font-bold text-blue-400 mb-1 flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5" /> SEO Preview
        </p>
        <p className="text-sm font-semibold text-blue-300 mt-2 line-clamp-1">
          {editLang === "es" ? seoTitleEs || titleEs : seoTitle || title || "Page Title"}
        </p>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {editLang === "es" ? seoDescEs || excerptEs : seoDesc || excerpt || "Meta description will appear here..."}
        </p>
        <p className="text-[10px] text-emerald-400 mt-1 font-mono">
          hostingsarena.com/news/{slug || "slug"}
        </p>
      </div>

      <div>
        <label className="block text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2.5">
          SEO Title {editLang === "es" ? "(ES)" : "(EN)"}
        </label>
        <input
          type="text"
          value={editLang === "es" ? seoTitleEs : seoTitle}
          onChange={(e) => (editLang === "es" ? setSeoTitleEs(e.target.value) : setSeoTitle(e.target.value))}
          placeholder="SEO-optimized title"
          className={INPUT_CLASS}
          maxLength={60}
        />
        <div className="flex justify-between mt-1.5">
          <p className="text-[10px] text-muted-foreground">Recommended: 50-60 characters</p>
          <p
            className={`text-[10px] font-mono ${
              (editLang === "es" ? seoTitleEs : seoTitle).length > 60
                ? "text-red-400"
                : (editLang === "es" ? seoTitleEs : seoTitle).length > 50
                ? "text-emerald-400"
                : "text-muted-foreground"
            }`}
          >
            {(editLang === "es" ? seoTitleEs : seoTitle).length}/60
          </p>
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2.5">
          Meta Description {editLang === "es" ? "(ES)" : "(EN)"}
        </label>
        <textarea
          value={editLang === "es" ? seoDescEs : seoDesc}
          onChange={(e) => (editLang === "es" ? setSeoDescEs(e.target.value) : setSeoDesc(e.target.value))}
          placeholder="Compelling description for search results"
          className={`${INPUT_CLASS} h-24 resize-none`}
          maxLength={155}
        />
        <div className="flex justify-between mt-1.5">
          <p className="text-[10px] text-muted-foreground">Recommended: 120-155 characters</p>
          <p
            className={`text-[10px] font-mono ${
              (editLang === "es" ? seoDescEs : seoDesc).length > 155
                ? "text-red-400"
                : (editLang === "es" ? seoDescEs : seoDesc).length > 120
                ? "text-emerald-400"
                : "text-muted-foreground"
            }`}
          >
            {(editLang === "es" ? seoDescEs : seoDesc).length}/155
          </p>
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2.5">
          Target Keywords {editLang === "es" ? "(ES)" : "(EN)"}
        </label>
        <input
          type="text"
          value={editLang === "es" ? keywordsEs : keywords}
          onChange={(e) => (editLang === "es" ? setKeywordsEs(e.target.value) : setKeywords(e.target.value))}
          placeholder="keyword1, keyword2, keyword3"
          className={INPUT_CLASS}
        />
        {(editLang === "es" ? keywordsEs : keywords) && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {(editLang === "es" ? keywordsEs : keywords).split(",").map(
              (k, i) =>
                k.trim() && (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-medium border border-primary/15"
                  >
                    {k.trim()}
                  </span>
                )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
