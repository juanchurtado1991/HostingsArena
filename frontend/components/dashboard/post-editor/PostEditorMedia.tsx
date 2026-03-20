"use client";

import React from "react";
import { Upload, Trash2, Loader2 } from "lucide-react";

interface PostEditorMediaProps {
  coverImageUrl: string;
  setCoverImageUrl: (v: string) => void;
  imagePrompt: string;
  setImagePrompt: (v: string) => void;
  uploading: boolean;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (e: React.DragEvent) => void;
  dragOver: boolean;
  setDragOver: (v: boolean) => void;
}

const INPUT_CLASS = "w-full px-4 py-3 rounded-2xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-200 placeholder:text-muted-foreground/50";

export function PostEditorMedia({
  coverImageUrl,
  setCoverImageUrl,
  imagePrompt,
  setImagePrompt,
  uploading,
  handleFileSelect,
  handleDrop,
  dragOver,
  setDragOver,
}: PostEditorMediaProps) {
  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-6">
      <div>
        <label className="block text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2.5">
          Cover Image
        </label>
        {coverImageUrl ? (
          <div className="relative rounded-2xl overflow-hidden border border-border group">
            <img src={coverImageUrl} alt="Cover" className="w-full aspect-video object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
              <label className="px-4 py-2 rounded-xl bg-muted backdrop-blur-sm text-sm font-medium cursor-pointer hover:bg-accent transition-colors flex items-center gap-2">
                <Upload className="w-4 h-4" /> Replace
                <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              </label>
              <button
                type="button"
                onClick={() => setCoverImageUrl("")}
                className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Remove
              </button>
            </div>
          </div>
        ) : (
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed aspect-video cursor-pointer transition-all duration-300 ${
              dragOver ? "border-primary bg-primary/10 scale-[1.01]" : "border-border bg-muted/30 hover:border-border hover:bg-muted/50"
            }`}
          >
            {uploading ? (
              <div className="text-center">
                <Loader2 className="w-10 h-10 mx-auto mb-3 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="p-4 rounded-2xl bg-muted/50 mb-4 inline-block">
                  <Upload className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-medium mb-1">Drop image here or click to upload</p>
                <p className="text-xs text-muted-foreground/50">JPEG, PNG, WebP, GIF · Max 5MB</p>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          </label>
        )}
      </div>

      <div>
        <label className="block text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2.5">
          AI Image Prompt
        </label>
        <textarea
          value={imagePrompt}
          onChange={(e) => setImagePrompt(e.target.value)}
          placeholder="Describe the ideal image — used as placeholder text and for future AI image generation"
          className={`${INPUT_CLASS} h-24 resize-none`}
        />
        <p className="text-[10px] text-muted-foreground mt-1.5">
          AI uses this to generate descriptions. Shows as placeholder when no image is uploaded.
        </p>
      </div>
    </div>
  );
}
