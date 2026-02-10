
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { PageTracker } from "@/components/tracking/PageTracker";
import { GlassCard } from "@/components/ui/GlassCard";
import { Clock, Tag, ExternalLink, Calendar, User, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { getAffiliateUrl } from "@/lib/affiliates";
import Image from "next/image";

export const revalidate = 300; // ISR: 5 minutes

interface PageProps {
    params: Promise<{ slug: string }>;
}

async function getPost(slug: string) {
    const supabase = await createClient();
    const { data: post, error } = await supabase
        .from("posts")
        .select(`
            *,
            author:author_id(full_name, avatar_url)
        `)
        .eq("slug", slug)
        .eq("status", "published")
        .single();

    if (error || !post) return null;
    return post;
}

function estimateReadTime(content: string): string {
    const wordCount = content?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0;
    const minutes = Math.max(1, Math.ceil(wordCount / 200));
    return `${minutes} min read`;
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    const post = await getPost(slug);
    if (!post) return { title: "Post Not Found" };

    return {
        title: post.seo_title || post.title,
        description: post.seo_description || post.excerpt,
        openGraph: {
            images: post.cover_image_url ? [post.cover_image_url] : [],
        },
    };
}

export default async function NewsPostPage({ params }: PageProps) {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) {
        notFound();
    }

    const affiliateLink = post.related_provider_name
        ? await getAffiliateUrl(post.related_provider_name, `https://www.google.com/search?q=${post.related_provider_name}`)
        : null;

    return (
        <div className="min-h-screen pt-24 pb-20 px-6">
            <PageTracker postSlug={post.slug} />

            <article className="max-w-4xl mx-auto">
                <Link href="/news" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors group">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to News
                </Link>

                {/* Header */}
                <header className="mb-10 text-center">
                    <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-6">
                        {post.category && (
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                                <Tag className="w-3.5 h-3.5" />
                                {post.category}
                            </span>
                        )}
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {estimateReadTime(post.content || "")}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(post.published_at || post.created_at).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight tracking-tight">
                        {post.title}
                    </h1>

                    {post.excerpt && (
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            {post.excerpt}
                        </p>
                    )}
                </header>

                {/* Cover Image */}
                {post.cover_image_url && (
                    <div className="relative aspect-video w-full rounded-3xl overflow-hidden mb-12 shadow-2xl shadow-primary/5 border border-white/10">
                        <Image
                            src={post.cover_image_url}
                            alt={post.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                )}

                {/* Content */}
                <GlassCard className="p-8 md:p-12 mb-12">
                    <div
                        className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-lg text-muted-foreground leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: post.content || "" }}
                    />
                </GlassCard>

                {/* CTA */}
                {affiliateLink && (
                    <div className="flex justify-center">
                        <a
                            href={affiliateLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white font-bold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                        >
                            Visit {post.related_provider_name} <ExternalLink className="w-5 h-5" />
                        </a>
                    </div>
                )}
            </article>
        </div>
    );
}
