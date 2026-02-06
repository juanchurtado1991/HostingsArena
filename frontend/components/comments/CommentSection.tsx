"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Comment } from "@/types";

interface CommentSectionProps {
  providerType: 'vpn' | 'hosting';
  providerSlug: string;
}

export default function CommentSection({ providerType, providerSlug }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchComments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("provider_type", providerType)
      .eq("provider_slug", providerSlug)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setComments(data as Comment[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Check Auth
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // Fetch Comments
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    const { error } = await supabase.from("comments").insert({
      user_id: user.id,
      provider_type: providerType,
      provider_slug: providerSlug,
      content: newComment,
    });

    if (!error) {
      setNewComment("");
      fetchComments(); // Refresh list
    } else {
        alert("Error posting comment");
    }
  };

  return (
    <div className="mt-12 p-6 bg-secondary/10 rounded-xl border border-border">
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
        💬 Community Reviews
        <span className="text-sm font-normal text-muted-foreground ml-2">({comments.length})</span>
      </h3>

      {/* Input Section */}
      <div className="mb-8">
        {user ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              className="w-full p-4 rounded-lg bg-background border border-input focus:ring-2 focus:ring-primary min-h-[100px]"
              placeholder="Share your experience with this provider..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button type="submit">Post Comment</Button>
          </form>
        ) : (
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <p className="text-muted-foreground mb-2">Log in to share your experience</p>
            <Button variant="outline" onClick={() => window.location.href = '/login'}>
              Log In
            </Button>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {loading ? (
            <p className="text-muted-foreground">Loading comments...</p>
        ) : comments.length === 0 ? (
            <p className="text-muted-foreground italic">No comments yet. Be the first!</p>
        ) : (
            comments.map((comment) => (
            <div key={comment.id} className="p-4 bg-background rounded-lg border border-border">
                <div className="flex justify-between items-start mb-2">
                <div className="font-semibold text-sm text-foreground/80">
                    User ({comment.user_id.slice(0, 6)}...)
                </div>
                <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </div>
                </div>
                <p className="text-foreground/90 leading-relaxed">{comment.content}</p>
            </div>
            ))
        )}
      </div>
    </div>
  );
}
