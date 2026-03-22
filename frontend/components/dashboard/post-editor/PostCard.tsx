"use client";

import React from "react";
import { Clock, Tag, Share2, Globe, Edit3, Trash2, ImageIcon } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import { getCategoryColorClasses } from "@/lib/news-utils";
import { Post } from "./types";

interface PostCardProps {
    post: Post;
    onEdit: (post: Post) => void;
    onDelete: (id: string) => void;
    onIndex: (post: Post) => void;
    onSocialSummary: (post: Post) => void;
    isDeleting: boolean;
}

export function PostCard({
    post,
    onEdit,
    onDelete,
    onIndex,
    onSocialSummary,
    isDeleting
}: PostCardProps) {
    const isScheduled = post.status === "published" && new Date(post.published_at || "").getTime() > new Date().getTime();

    return (
        <GlassCard className="flex flex-col hover:scale-[1.01] transition-transform h-full overflow-hidden group">
            <div className="bg-zinc-100 dark:bg-zinc-800/10 h-36 relative overflow-hidden border-b border-border/50">
                {post.cover_image_url ? (
                    <img 
                        src={post.cover_image_url} 
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                        <ImageIcon className="w-8 h-8 mb-2 text-muted-foreground/20" />
                        <p className="text-[10px] text-muted-foreground/30 line-clamp-2 text-center italic">
                            {post.image_prompt || "No visual preview"}
                        </p>
                    </div>
                )}
                
                <span className={cn(
                    "absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md shadow-lg shadow-black/20",
                    isScheduled 
                        ? "bg-amber-500/90 text-amber-50" 
                        : (post.status === "published" ? "bg-emerald-500/90 text-emerald-50" : "bg-zinc-500/90 text-zinc-50")
                )}>
                    {isScheduled ? "Programado" : (post.status === "published" ? "Published" : "Draft")}
                </span>

                {post.is_ai_generated && (
                    <span className="absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded-full bg-primary/90 text-primary-foreground shadow-lg shadow-black/20 backdrop-blur-md">
                        🤖 AI
                    </span>
                )}
            </div>

            <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2.5">
                    {post.category && (
                        <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border flex items-center gap-1", getCategoryColorClasses(post.category))}>
                            <Tag className="w-2.5 h-2.5" /> {post.category}
                        </span>
                    )}
                    {post.related_provider_name && (
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{post.related_provider_name}</span>
                    )}
                </div>

                <h3 className="font-bold text-sm mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">{post.title}</h3>
                {post.excerpt && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mb-4 leading-relaxed opacity-70 italic">{post.excerpt}</p>
                )}

                <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1.5 font-bold uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5" />
                        {post.created_at ? new Date(post.created_at).toLocaleDateString('es-SV', { month: 'short', day: 'numeric' }) : '---'}
                    </span>
                    <div className="flex gap-0.5">
                        <button
                            onClick={() => onSocialSummary(post)}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                            title="Social Summary"
                        >
                            <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => onIndex(post)}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-emerald-400"
                            title="Index Google"
                        >
                            <Globe className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => onEdit(post)}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            title="Edit"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => onDelete(post.id)}
                            disabled={isDeleting}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-500"
                            title="Delete"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
}
