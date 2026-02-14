import { Post } from '@/components/dashboard/PostEditor';

interface JsonLdProps {
    post: Post;
    url: string;
    lang?: string;
}

export function JsonLd({ post, url, lang = 'en' }: JsonLdProps) {
    const isEs = lang === 'es';
    const title = (isEs && post.title_es) ? post.title_es : post.title;
    const headline = (isEs && post.seo_title_es) ? post.seo_title_es : (post.seo_title || post.title);
    const description = (isEs && post.seo_description_es) ? post.seo_description_es : (post.seo_description || post.excerpt);

    const articleData = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": headline,
        "description": description,
        "image": post.cover_image_url ? [post.cover_image_url] : [],
        "datePublished": post.published_at ? new Date(post.published_at).toISOString() : new Date(post.created_at).toISOString(),
        "dateModified": post.updated_at ? new Date(post.updated_at).toISOString() : new Date(post.created_at).toISOString(),
        "author": [{
            "@type": "Person",
            "name": "HostingsArena Team",
            "url": `${process.env.NEXT_PUBLIC_SITE_URL}/about`
        }],
        "publisher": {
            "@type": "Organization",
            "name": "HostingsArena",
            "logo": {
                "@type": "ImageObject",
                "url": `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": url
        },
        "inLanguage": lang
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(articleData) }}
        />
    );
}
