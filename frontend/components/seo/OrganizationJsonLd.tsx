export function OrganizationJsonLd() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.hostingsarena.com";

    const schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "HostingsArena",
        "url": siteUrl,
        "logo": `${siteUrl}/logo-wide.jpg`, // Updated to real logo
        "sameAs": [
            "https://x.com/HostingsArena",
            "https://www.facebook.com/profile.php?id=61588177618478",
            "https://www.linkedin.com/in/hostings-arena-ha-9b51063b0/"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer support",
            "email": "soporte@hostingsarena.com"
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
