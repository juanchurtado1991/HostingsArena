interface BreadcrumbJsonLdProps {
    items: {
        name: string;
        item: string;
    }[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.hostingsarena.com";

    const schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.item.startsWith("http") ? item.item : `${siteUrl}${item.item}`
        }))
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
