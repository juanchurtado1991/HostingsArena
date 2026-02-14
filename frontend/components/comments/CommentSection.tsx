"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { MessageSquare, User, Send, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Comment {
  id: string;
  user_id?: string;
  author_name?: string; // For news guest comments
  content: string;
  created_at: string;
  status: string;
}

interface CommentSectionProps {
  type: 'vpn' | 'hosting' | 'post';
  slug: string;
  lang: string;
}

export default function CommentSection({ type, slug, lang }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState(""); // For news/guest
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const supabase = createClient();

  const isPost = type === 'post';
  const table = isPost ? 'post_comments' : 'comments';
  const slugField = isPost ? 'post_slug' : 'provider_slug';
  const isEs = lang === 'es';

  const fetchComments = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from(table)
      .select("*")
      .eq(slugField, slug)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (!isPost) {
      query = query.eq("provider_type", type);
    }

    const { data, error } = await query;

    if (!error && data) {
      setComments(data as Comment[]);
    }
    setLoading(false);
  }, [slug, type, isPost, table, slugField, supabase]);

  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUserData();
    fetchComments();
  }, [fetchComments, supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    // For providers, user must be logged in
    if (!isPost && !user) {
      window.location.href = `/${lang}/login`;
      return;
    }

    // For news, can be guest if no user
    if (isPost && !user && !authorName.trim()) {
      alert(isEs ? "Por favor ingrese su nombre" : "Please enter your name");
      return;
    }

    setPosting(true);
    try {
      const payload: any = {
        content: newComment,
        status: 'approved', // Auto-approve for now as requested
      };

      if (isPost) {
        payload.post_slug = slug;
        payload.author_name = user?.email?.split('@')[0] || authorName;
      } else {
        payload.provider_type = type;
        payload.provider_slug = slug;
        payload.user_id = user?.id;
      }

      const { error } = await supabase.from(table).insert(payload);

      if (!error) {
        setNewComment("");
        fetchComments();
      } else {
        console.error("Error posting comment:", error);
      }
    } catch (err) {
      console.error("Critical error posting comment:", err);
    } finally {
      setPosting(false);
    }
  };

  return (
    <section className="mt-16 max-w-4xl mx-auto px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-primary/10 rounded-xl">
          <MessageSquare className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-foreground">
          {isPost ? (isEs ? "Comentarios" : "Comments") : (isEs ? "Reseñas de la Comunidad" : "Community Reviews")}
          <span className="ml-3 text-sm font-normal text-muted-foreground">
            ({comments.length})
          </span>
        </h3>
      </div>

      {/* Input Section */}
      <div className="mb-12 bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          {!user && isPost && (
            <div className="mb-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 ml-1">
                {isEs ? "Tu Nombre" : "Your Name"}
              </label>
              <input
                type="text"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder={isEs ? "Ingresa tu nombre..." : "Enter your name..."}
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 ml-1">
              {isPost ? (isEs ? "Comparte tu opinión" : "Share your thoughts") : (isEs ? "Comparte tu experiencia" : "Share your experience")}
            </label>
            <textarea
              className="w-full bg-background border border-border rounded-[1.5rem] p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all min-h-[120px]"
              placeholder={!user && !isPost ? (isEs ? "Inicia sesión para reseñar..." : "Log in to post a review...") : (isEs ? "Escribe algo valioso..." : "Write something meaningful...")}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={!user && !isPost}
            />
          </div>

          <div className="flex justify-end items-center gap-4">
            {!user && !isPost && (
              <p className="text-xs text-muted-foreground">{isEs ? "Se requiere autenticación" : "Authentication required"}</p>
            )}
            <Button
              type="submit"
              className="rounded-full px-8 h-12 font-bold shadow-lg"
              disabled={posting || (!user && !isPost)}
            >
              {posting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {isPost ? (isEs ? "Publicar Comentario" : "Post Comment") : (isEs ? "Enviar Reseña" : "Submit Review")}
            </Button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center py-12 gap-3 opacity-50">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs font-bold uppercase tracking-widest">{isEs ? "Cargando Conversación..." : "Loading Conversation..."}</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12 bg-white/5 border border-dashed border-white/10 rounded-[2.5rem]">
            <p className="text-muted-foreground italic">{isEs ? "Nadie ha hablado aún. ¡Comienza la conversación!" : "No one has spoken yet. Start the conversation!"}</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 group">
              <div className="h-12 w-12 rounded-2xl bg-secondary/30 border border-border/50 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                <User className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="bg-white/5 border border-white/10 rounded-[1.5rem] p-6 transition-all hover:bg-white/[0.08] hover:border-white/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-foreground">
                      {isPost ? (comment.author_name || "Guest") : (isEs ? `Usuario ${comment.user_id?.slice(0, 5)}` : `User ${comment.user_id?.slice(0, 5)}`)}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-60">
                      {formatDate(comment.created_at, lang)}
                    </span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
