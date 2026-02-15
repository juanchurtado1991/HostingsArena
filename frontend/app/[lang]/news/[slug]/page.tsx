import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { GlassCard } from '@/components/ui/GlassCard';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { getDictionary } from '@/get-dictionary';
import { Suspense } from 'react';
import { Locale } from "@/i18n-config";
import { JsonLd } from '@/components/seo/JsonLd';
import { PageTracker } from '@/components/tracking/PageTracker';
import { ArticleContent } from '@/components/news/ArticleContent';
import { SocialShare } from '@/components/news/SocialShare';
import { AffiliateButton } from "@/components/conversion/AffiliateButton";
import { getAffiliateUrl } from "@/lib/affiliates";
import CommentSection from '@/components/comments/CommentSection';

export const revalidate = 300; // ISR: 5 minutes

interface PageProps {
    params: Promise<{ slug: string; lang: Locale }>;
}

async function getPost(slug: string) {
    const supabase = await createClient();
    const { data: post, error } = await supabase
        .from("posts")
        .select(`
            *,
            author: author_id(full_name, avatar_url)
        `)
        .eq("slug", slug)
        .eq("status", "published")
        .single();

    if (error || !post) return null;
    return post;
}

export async function generateMetadata({ params }: PageProps) {
    const { slug, lang } = await params;
    const post = await getPost(slug);
    if (!post) return { title: "Post Not Found" };

    const isEs = lang === 'es';
    const title = (isEs && post.title_es) ? post.title_es : post.title;
    const description = (isEs && post.seo_description_es) ? post.seo_description_es : (post.seo_description || post.excerpt);

    return {
        title: title,
        description: description,
        openGraph: {
            title: title,
            description: description,
            url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://hostingsarena.com'}/${lang}/news/${post.slug}`,
            siteName: 'HostingsArena',
            images: post.cover_image_url ? [{ url: post.cover_image_url, width: 1200, height: 630, alt: title }] : [],
            locale: lang === 'es' ? 'es_ES' : 'en_US',
            type: 'article',
        },
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://hostingsarena.com'}/${lang}/news/${post.slug}`,
            languages: {
                'en-US': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://hostingsarena.com'}/en/news/${post.slug}`,
                'es-ES': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://hostingsarena.com'}/es/news/${post.slug}`,
            },
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
            images: post.cover_image_url ? [post.cover_image_url] : [],
        },
    };
}

export default async function NewsPostPage({ params }: PageProps) {
    const { slug, lang } = await params;
    const dict = await getDictionary(lang);
    const post = await getPost(slug);

    if (!post) {
        notFound();
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://hostingsarena.com'}/${lang}/news/${post.slug}`;
    const isEs = lang === 'es';

    const displayTitle = (isEs && post.title_es) ? post.title_es : post.title;
    const displayContent = (isEs && post.content_es) ? post.content_es : post.content;
    const displayExcerpt = (isEs && post.excerpt_es) ? post.excerpt_es : post.excerpt;

    return (
        <div className="min-h-screen pt-16 pb-20 px-4">
            <JsonLd post={post} url={shareUrl} lang={lang} />
            <PageTracker postSlug={post.slug} />

            <article className="mx-auto max-w-7xl px-6 md:px-12">
                <GlassCard className="p-8 md:p-14 lg:p-16 shadow-2xl border-white/10 rounded-[2.5rem] mb-12 mt-3 overflow-hidden">
                    <header className="mb-10 text-center">
                        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                            <Link
                                href={`/${lang}/news`}
                                className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-all hover:translate-x-[-2px]"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                {lang === 'es' ? 'Noticias' : 'News'}
                            </Link>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                            <span className="px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase bg-primary/10 text-primary border border-primary/20 backdrop-blur-md">
                                {post.category || "General"}
                            </span>
                            <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-bold uppercase tracking-tighter bg-white/5 px-3 py-1 rounded-full border border-white/10">
                                <Calendar className="w-3 h-3" />
                                {formatDate(post.published_at || post.created_at, lang)}
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-bold uppercase tracking-tighter bg-white/5 px-3 py-1 rounded-full border border-white/10">
                                <Clock className="w-3 h-3" />
                                {Math.ceil((displayContent?.length || 0) / 1000)} {isEs ? "min de lectura" : "min read"}
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight text-gradient leading-[1.15] text-balance mx-auto">
                            {displayTitle}
                        </h1>

                        {displayExcerpt && (
                            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-4xl font-medium tracking-tight mb-12 text-balance mx-auto">
                                {displayExcerpt}
                            </p>
                        )}

                        {post.cover_image_url && (
                            <div className="relative aspect-video w-full max-w-4xl mx-auto rounded-[2rem] overflow-hidden shadow-2xl shadow-primary/10 ring-1 ring-white/10 mb-12">
                                <Image
                                    src={post.cover_image_url}
                                    alt={displayTitle}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        )}
                    </header>

                    <div className="max-w-4xl mx-auto">
                        <ArticleContent content={displayContent} className="prose-layout" />

                        <div className="mt-1 pt-0 border-t border-white/5">
                            <SocialShare
                                url={shareUrl}
                                title={displayTitle}
                                dict={dict.news}
                            />
                        </div>

                    </div>
                </GlassCard>

                {/* Conversion Buttons (Prominent) */}
                <div className="mt-8 mb-4">
                    <Suspense fallback={<div className="h-24 animate-pulse bg-white/5 rounded-[2.5rem]" />}>
                        <NewsConversionButtons
                            relatedProvider={post.related_provider_name}
                            category={post.category}
                            lang={lang}
                        />
                    </Suspense>
                </div>

                <div className="pt-0 mb-20">
                    <CommentSection type="post" slug={post.slug} lang={lang} />
                </div>
            </article>
        </div>
    );
}

// Popular rivals for conversion
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
    const isEs = lang === 'es';
    const type = (category?.toLowerCase().includes('vpn')) ? 'vpn' : 'hosting';
    const rivals = type === 'vpn' ? POPULAR_VPN : POPULAR_HOSTING;
    const targetProviderName = relatedProvider || (type === 'vpn' ? "NordVPN" : "Hostinger");

    const supabase = await createClient();
    const table = type === 'vpn' ? 'vpn_providers' : 'hosting_providers';

    // Try to find the specific provider
    const { data: providerData } = await supabase
        .from(table)
        .select('id, provider_name, website_url')
        .ilike('provider_name', targetProviderName)
        .limit(1)
        .maybeSingle();

    // Fallback if provider not in DB (highly unlikely for top ones, but just in case)
    const provider = providerData || {
        id: type === 'vpn' ? POPULAR_VPN[0].id : POPULAR_HOSTING[0].id,
        provider_name: targetProviderName,
        website_url: targetProviderName.toLowerCase().includes('hostinger') ? 'https://www.hostinger.com' : 'https://nordvpn.com'
    };

    const affiliateUrl = await getAffiliateUrl(provider.provider_name, provider.website_url);
    // Intelligent Comparison Logic:
    // 1. Challenger vs Champion: Compare current provider against category leader (Hostinger/NordVPN).
    // 2. Champion vs Contender: If looking at leader, compare against top runner-up.
    let rival;
    const isHostinger = provider.provider_name.toLowerCase().includes('hostinger');
    const isNord = provider.provider_name.toLowerCase().includes('nordvpn');

    if (type === 'vpn') {
        // VPN Leader: NordVPN -> Backup: ExpressVPN
        const express = POPULAR_VPN.find(p => p.name === 'ExpressVPN') || POPULAR_VPN[1];
        const nord = POPULAR_VPN.find(p => p.name === 'NordVPN') || POPULAR_VPN[0];
        rival = isNord ? express : nord;
    } else {
        // Hosting Leader: Hostinger -> Backup: Bluehost
        const bluehost = POPULAR_HOSTING.find(p => p.name === 'Bluehost') || POPULAR_HOSTING[1];
        const hostinger = POPULAR_HOSTING.find(p => p.name === 'Hostinger') || POPULAR_HOSTING[0];
        rival = isHostinger ? bluehost : hostinger;
    }

    const compareLink = `/${lang}/compare?a=${provider.id}&b=${rival.id}&cat=${type}`;

    return (
        <GlassCard className="p-8 md:p-10 border-primary/10 shadow-2xl shadow-primary/5 rounded-[2.5rem]">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
                        {isEs ? "¿Listo para empezar?" : "Ready to get started?"}
                    </h3>
                    <p className="text-muted-foreground font-medium">
                        {isEs
                            ? `Obtén la mejor oferta en ${provider.provider_name} hoy.`
                            : `Get the best deal on ${provider.provider_name} today.`}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <AffiliateButton
                        providerName={provider.provider_name}
                        visitUrl={affiliateUrl}
                        position="news_bottom_cta"
                        className="w-full sm:w-auto h-16 px-10 text-lg shadow-xl shadow-primary/20 rounded-full font-black"
                        variant="default"
                    >
                        {isEs
                            ? `Ir a ${provider.provider_name}`
                            : `Go to ${provider.provider_name}`}
                    </AffiliateButton>

                    <Link
                        href={compareLink}
                        className="w-full sm:w-auto h-16 px-8 flex items-center justify-center gap-2 rounded-full border border-border bg-background/50 hover:bg-secondary/50 font-bold transition-all group"
                    >
                        {isEs ? 'Versus' : 'Versus'} {rival.name}
                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </GlassCard>
    );
}
