
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PageTracker } from "@/components/tracking/PageTracker";
import { GlassCard } from "@/components/ui/GlassCard";
import { Clock, Tag, ExternalLink, Calendar, User, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { getAffiliateUrl } from "@/lib/affiliates";
import Image from "next/image";
import { JsonLd } from "@/components/seo/JsonLd";
import { ArticleContent } from "@/components/news/ArticleContent";

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
            title: post.seo_title || post.title,
            description: post.seo_description || post.excerpt,
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/news/${post.slug}`,
            siteName: 'HostingsArena',
            images: post.cover_image_url ? [
                {
                    url: post.cover_image_url,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                }
            ] : [],
            locale: 'en_US',
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: post.seo_title || post.title,
            description: post.seo_description || post.excerpt,
            images: post.cover_image_url ? [post.cover_image_url] : [],
        },
    };
}

import { Suspense } from "react";

async function AffiliateCTA({ providerName }: { providerName: string }) {
    try {
        const affiliateLink = await getAffiliateUrl(
            providerName,
            `https://www.google.com/search?q=${providerName}`
        );

        if (!affiliateLink) return null;

        return (
            <div className="flex justify-center mt-12">
                <a
                    href={affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white font-bold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                >
                    Visit {providerName} <ExternalLink className="w-5 h-5" />
                </a>
            </div>
        );
    } catch (error) {
        console.error("Error loading Affiliate CTA:", error);
        return null;
    }
}

export default async function NewsPostPage({ params }: PageProps) {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) {
        notFound();
    }

    return (
        <div className="min-h-screen pt-24 pb-20 px-6">
            <JsonLd post={post} url={`https://hostingsarena.com/news/${post.slug}`} />
            <PageTracker postSlug={post.slug} />

            <article className="max-w-7xl mx-auto">
                {/* Content */}
                <GlassCard className="p-8 md:p-12 mb-12">
                    <ArticleContent content={post.content || ""} />
                </GlassCard>
            </article>
        </div >
    );
}

