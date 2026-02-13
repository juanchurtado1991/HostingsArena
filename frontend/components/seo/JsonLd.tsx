import { Post } from '@/components/dashboard/PostEditor';

interface JsonLdProps {
    post: Post;
    url: string;
}

export function JsonLd({ post, url }: JsonLdProps) {
    const articleData = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.seo_title || post.title,
        "description": post.seo_description || post.excerpt,
        "image": post.cover_image_url ? [post.cover_image_url] : [],
        "datePublished": post.published_at || post.created_at,
        "dateModified": post.updated_at || post.created_at,
        "author": [{
            "@type": "Person",
            "name": "HostingArena Team",
            "url": "https://hostingarena.com/about"
        }],
        "publisher": {
            "@type": "Organization",
            "name": "HostingArena",
            "logo": {
                "@type": "ImageObject",
                "url": "https://hostingarena.com/logo.png"
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": url
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(articleData) }}
        />
    );
}
