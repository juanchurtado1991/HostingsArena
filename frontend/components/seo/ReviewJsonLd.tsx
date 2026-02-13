export type ReviewType = "hosting" | "vpn";

interface ReviewJsonLdProps {
    providerName: string;
    description: string;
    rating: number; // 0-10 or 0-100
    slug: string;
    type: ReviewType;
    pros?: string[];
    cons?: string[];
    authorName?: string;
    datePublished: string;
    price?: number;
    currency?: string;
}

export function ReviewJsonLd({
    providerName,
    description,
    rating,
    slug,
    type,
    authorName = "HostingsArena Team",
    datePublished,
    price,
    currency = "USD",
}: ReviewJsonLdProps) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.hostingsarena.com";
    const url = `${siteUrl}/${type}/${slug}`;
    const scaledRating = rating > 10 ? rating / 10 : rating; // Normalize to 0-10 scale

    const schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": providerName,
        "description": description,
        "image": `${siteUrl}/logos/${providerName.toLowerCase().replace(/\s+/g, '-')}.png`, // Placeholder, should be real logo
        "brand": {
            "@type": "Brand",
            "name": providerName
        },
        "review": {
            "@type": "Review",
            "reviewRating": {
                "@type": "Rating",
                "ratingValue": scaledRating.toFixed(1),
                "bestRating": "10",
                "worstRating": "1"
            },
            "author": {
                "@type": "Organization",
                "name": authorName,
                "url": siteUrl
            },
            "datePublished": datePublished
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": scaledRating.toFixed(1),
            "reviewCount": "1", // Self-review
            "bestRating": "10",
            "worstRating": "1"
        }
    };

    // Add Offer if price is available
    if (price) {
        (schema as any).offers = {
            "@type": "Offer",
            "url": url,
            "priceCurrency": currency,
            "price": price,
            "availability": "https://schema.org/InStock"
        };
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
