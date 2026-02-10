import { GlassCard } from "@/components/ui/GlassCard";
import { Clock, Tag, ExternalLink, Sparkles, ImageIcon, Calendar } from "lucide-react";
import { getAffiliateUrl } from "@/lib/affiliates";
import { createClient } from "@/utils/supabase/server";
import { PageTracker } from "@/components/tracking/PageTracker";
import Link from "next/link";

export const revalidate = 300; // ISR: revalidate every 5 minutes

async function getPublishedPosts() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(30);

    if (error) {
        console.error('Failed to fetch posts:', error);
        return [];
    }
    return data || [];
}

function estimateReadTime(content: string): string {
    const wordCount = content?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0;
    const minutes = Math.max(1, Math.ceil(wordCount / 200));
    return `${minutes} min read`;
}

export default async function NewsPage() {
    const posts = await getPublishedPosts();

    return (
        <div className="min-h-screen pt-24 pb-12 px-6">
            <PageTracker />
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                        Industry <span className="text-primary">Intelligence</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        AI-curated updates on privacy, price changes, and infrastructure verified by our scrapers.
                    </p>
                </div>

                {posts.length === 0 ? (
                    <div className="text-center py-16">
                        <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                        <p className="text-lg font-semibold mb-2">Coming soon</p>
                        <p className="text-muted-foreground">Our editors are curating fresh industry articles. Check back shortly.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {await Promise.all(posts.map(async (post) => {
                            const affiliateLink = post.related_provider_name
                                ? await getAffiliateUrl(post.related_provider_name, `https://www.google.com/search?q=${post.related_provider_name}`)
                                : null;

                            return (
                                <GlassCard key={post.id} className="flex flex-col h-full hover:scale-[1.01] transition-transform group">
                                    <Link href={`/news/${post.slug}`} className="block flex-1 group/link">
                                        {/* Image Placeholder */}
                                        <div className="bg-gray-500/10 h-48 w-full rounded-xl mb-6 flex items-center justify-center relative overflow-hidden p-4 group-hover/link:opacity-90 transition-opacity">
                                            {post.cover_image_url ? (
                                                <img src={post.cover_image_url} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
                                            ) : (
                                                <>
                                                    <div className="absolute inset-0 bg-gradient-to-tr from-gray-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <div className="text-center relative z-10">
                                                        <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                                                        <p className="text-[11px] text-muted-foreground/40 line-clamp-3">
                                                            {post.image_prompt || post.related_provider_name || "News article"}
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 text-xs font-medium text-primary mb-3">
                                            {post.category && (
                                                <span className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-md">
                                                    <Tag className="w-3 h-3" /> {post.category}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1 text-muted-foreground">
                                                <Clock className="w-3 h-3" /> {estimateReadTime(post.content || "")}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold mb-3 leading-tight group-hover/link:text-primary transition-colors">{post.title}</h3>
                                        <p className="text-muted-foreground text-sm line-clamp-3 mb-6">
                                            {post.excerpt || post.seo_description || ""}
                                        </p>
                                    </Link>

                                    <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center text-xs text-muted-foreground">
                                        <span>
                                            {post.published_at
                                                ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                                                : ""}
                                        </span>
                                        {affiliateLink && (
                                            <a
                                                href={affiliateLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-primary font-semibold hover:underline"
                                            >
                                                Check Deal <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                </GlassCard>
                            );
                        }))}
                    </div>
                )}
            </div>
        </div >
    );
}
