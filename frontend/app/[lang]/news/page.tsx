import { GlassCard } from "@/components/ui/GlassCard";
import { Clock, Tag, ExternalLink, Sparkles, ImageIcon, Calendar } from "lucide-react";
import { getAffiliateUrl } from "@/lib/affiliates";
import { createClient } from "@/lib/supabase/server";
import { PageTracker } from "@/components/tracking/PageTracker";
import Link from "next/link";
import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import Image from "next/image";

import { NewsFilters } from "@/components/news/NewsFilters";

export const revalidate = 300; // ISR: revalidate every 5 minutes

async function getPublishedPosts(query?: string, category?: string) {
    const supabase = await createClient();
    let rpc = supabase
        .from('posts')
        .select('*')
        .eq('status', 'published');

    if (query) {
        rpc = rpc.or(`title.ilike.%${query}%,content.ilike.%${query}%`);
    }

    if (category && category !== 'all') {
        rpc = rpc.eq('category', category);
    }

    const { data, error } = await rpc
        .order('published_at', { ascending: false })
        .limit(30);

    if (error) {
        console.error('Failed to fetch posts:', error);
        return [];
    }
    return data || [];
}

async function getCategories() {
    const supabase = await createClient();
    const { data } = await supabase
        .from('posts')
        .select('category')
        .eq('status', 'published');

    const categories = Array.from(new Set(data?.map(p => p.category).filter(Boolean))) as string[];
    return categories.sort();
}

function estimateReadTime(content: string): string {
    const wordCount = content?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0;
    const minutes = Math.max(1, Math.ceil(wordCount / 200));
    return `${minutes} min read`;
}

export default async function NewsPage({
    params,
    searchParams
}: {
    params: Promise<{ lang: Locale }>;
    searchParams: Promise<{ q?: string; category?: string }>;
}) {
    const { lang } = await params;
    const { q, category } = await searchParams;
    const dict = await getDictionary(lang);

    // Fetch data in parallel
    const [posts, categories] = await Promise.all([
        getPublishedPosts(q, category),
        getCategories()
    ]);

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 relative overflow-hidden">
            <PageTracker />

            {/* Design Polish: Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
            <div className="absolute top-[20%] -right-20 w-80 h-80 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />

            <div className="container mx-auto lg:max-w-7xl">
                <div className="text-center mb-10 relative">
                    <div className="max-w-3xl mx-auto">
                        <NewsFilters
                            categories={categories}
                            lang={lang}
                            dict={{
                                searchPlaceholder: lang === 'es' ? "Buscar noticias..." : "Search news...",
                                allCategories: lang === 'es' ? "Todas" : "All"
                            }}
                        />
                    </div>
                </div>

                {posts.length === 0 ? (
                    <div className="text-center py-24 glass-card border-dashed border-white/10 rounded-3xl">
                        <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                        <p className="text-2xl font-bold mb-4">
                            {q || category ? (lang === 'es' ? "Sin resultados" : "No results found") : dict.news.coming_soon_title}
                        </p>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            {q || category ? (lang === 'es' ? "Intenta ajustar los términos de búsqueda o filtros para encontrar lo que buscas." : "Try adjusting your search terms or filters to find what you are looking for.") : dict.news.coming_soon_desc}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {await Promise.all(posts.map(async (post) => {
                            const isEs = lang === 'es';
                            const displayTitle = (isEs && post.title_es) ? post.title_es : post.title;
                            const displayExcerpt = (isEs && post.excerpt_es) ? post.excerpt_es : (post.excerpt || post.seo_description || "");
                            const displayContent = (isEs && post.content_es) ? post.content_es : (post.content || "");

                            const affiliateLink = post.related_provider_name
                                ? await getAffiliateUrl(post.related_provider_name, `https://www.google.com/search?q=${post.related_provider_name}`)
                                : null;

                            return (
                                <GlassCard key={post.id} className="flex flex-col h-full hover:scale-[1.01] transition-transform group">
                                    <Link href={`/${lang}/news/${post.slug}`} className="block flex-1 group/link">
                                        {/* Image Placeholder */}
                                        <div className="bg-gray-500/10 h-48 w-full rounded-xl mb-6 flex items-center justify-center relative overflow-hidden p-4 group-hover/link:opacity-90 transition-opacity">
                                            {post.cover_image_url ? (
                                                <Image
                                                    src={post.cover_image_url}
                                                    alt={displayTitle}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <>
                                                    <div className="absolute inset-0 bg-gradient-to-tr from-gray-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <div className="text-center relative z-10">
                                                        <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                                                        <p className="text-[11px] text-muted-foreground/40 line-clamp-3">
                                                            {post.image_prompt || post.related_provider_name || (isEs ? "Noticia" : "News article")}
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
                                                <Clock className="w-3 h-3" /> {estimateReadTime(displayContent)}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold mb-3 leading-tight group-hover/link:text-primary transition-colors">{displayTitle}</h3>
                                        <p className="text-muted-foreground text-sm line-clamp-3 mb-6">
                                            {displayExcerpt}
                                        </p>
                                    </Link>
                                    <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center text-xs text-muted-foreground">
                                        <span>
                                            {post.published_at || post.created_at
                                                ? new Date(post.published_at || post.created_at).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                                                : ""}
                                        </span>
                                        {affiliateLink && (
                                            <a
                                                href={affiliateLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-primary font-semibold hover:underline"
                                            >
                                                {lang === 'es' ? 'Ver Oferta' : 'Check Deal'} <ExternalLink className="w-3 h-3" />
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
