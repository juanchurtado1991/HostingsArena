
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

import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import { SocialShare } from "@/components/news/SocialShare";

export default async function NewsPostPage({ params }: { params: Promise<{ slug: string; lang: Locale }> }) {
    const { slug, lang } = await params;
    const dict = await getDictionary(lang);
    const post = await getPost(slug);

    if (!post) {
        notFound();
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://hostingsarena.com'}/${lang}/news/${post.slug}`;

    return (
        <div className="min-h-screen pt-24 pb-20 px-4">
            <JsonLd post={post} url={shareUrl} />
            <PageTracker postSlug={post.slug} />

            <article className="container mx-auto lg:max-w-7xl">
                <Link href={`/${lang}/news`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors group">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    {lang === 'es' ? 'Volver a Noticias' : 'Back to News'}
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
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(post.created_at).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US')}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {estimateReadTime(post.content || "")}
                        </span>
                    </div>

                    <h1 className="hero-title mb-4 py-2">
                        {post.title}
                    </h1>

                    {post.seo_description && (
                        <p className="text-xl text-muted-foreground/60 max-w-3xl mx-auto mb-8 font-medium italic leading-relaxed">
                            {post.seo_description}
                        </p>
                    )}
                </header>

                {/* Cover Image */}
                {post.cover_image_url && (
                    <div className="relative aspect-video w-full lg:max-w-[60%] mx-auto rounded-3xl overflow-hidden mb-16 shadow-2xl shadow-primary/5 ring-1 ring-white/10">
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
                    <ArticleContent content={post.content || ""} />

                    <SocialShare
                        title={post.title}
                        url={shareUrl}
                        dict={dict.news}
                    />

                    <div className="mt-12 pt-12 border-t border-white/10">
                        <Suspense fallback={<div className="h-20 animate-pulse bg-white/5 rounded-2xl" />}>
                            <NewsConversionButtons
                                relatedProvider={post.related_provider_name}
                                category={post.category}
                                lang={lang}
                            />
                        </Suspense>
                    </div>
                </GlassCard>
            </article>
        </div>
    );
}

// --- Dynamic Conversion Components ---

import { AffiliateButton } from "@/components/conversion/AffiliateButton";

// Popular providers to compare against (Top tier)
const POPULAR_HOSTING = [
    { name: "Hostinger", id: "d587e19c-679a-4cd0-8daf-0c5329920a54" },
    { name: "Bluehost", id: "b42366e0-8cf0-4408-8139-5fe45c0d3ec9" },
    { name: "HostGator", id: "26431090-260e-4230-b3cc-1316daa2ff44" }
];

const POPULAR_VPN = [
    { name: "NordVPN", id: "f3895443-0bfa-4bc3-8c16-9ee3edf1536a" },
    { name: "ExpressVPN", id: "9b612374-874b-4439-b9ae-6f3671b80e2e" },
    { name: "Surfshark", id: "233ea0d4-3d2b-4547-a058-a8b3d36f523b" }
];

async function NewsConversionButtons({
    relatedProvider,
    category,
    lang
}: {
    relatedProvider: string | null;
    category: string | null;
    lang: string;
}) {
    if (!relatedProvider) return null;

    const supabase = await createClient();
    const type = (category?.toLowerCase().includes('vpn')) ? 'vpn' : 'hosting';

    // 1. Fetch Related Provider ID & Affiliate Info
    const table = type === 'vpn' ? 'vpn_providers' : 'hosting_providers';
    const { data: providerData } = await supabase
        .from(table)
        .select('id, provider_name, website_url')
        .ilike('provider_name', relatedProvider)
        .single();

    if (!providerData) return null;

    // 2. Get Affiliate URL
    const affiliateUrl = await getAffiliateUrl(providerData.provider_name, providerData.website_url);

    // 3. Pick random popular rival (not same as current)
    const rivals = type === 'vpn' ? POPULAR_VPN : POPULAR_HOSTING;
    const availableRivals = rivals.filter(r => r.name.toLowerCase() !== relatedProvider.toLowerCase());
    const randomRival = availableRivals[Math.floor(Math.random() * availableRivals.length)] || rivals[0];

    // 4. Build Comparison Link (using versus logic)
    const compareLink = `/${lang}/compare?a=${providerData.id}&b=${randomRival.id}&cat=${type}`;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <AffiliateButton
                providerName={providerData.provider_name}
                visitUrl={affiliateUrl}
                position="news_bottom_cta"
                className="w-full sm:w-auto h-14 px-8 text-base shadow-xl shadow-primary/20"
                variant="default"
            >
                {lang === 'es' ? 'Ver Oferta de' : 'Visit'} {providerData.provider_name}
            </AffiliateButton>

            <Link
                href={compareLink}
                className="w-full sm:w-auto h-14 px-8 flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 font-bold transition-all"
            >
                {lang === 'es' ? 'Comparar contra' : 'Compare vs'} {randomRival.name}
                <ChevronLeft className="w-4 h-4 rotate-180" />
            </Link>
        </div>
    );
}

