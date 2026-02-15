import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.hostingsarena.com"),
    title: {
        default: "HostingArena | Real Data Comparisons",
        template: "%s | HostingArena"
    },
    description: "Stop relying on fake reviews. We verified 50+ providers with deep data extraction. Real uptime, real speeds, real hidden fees revealed.",
    icons: {
        icon: "/swords-icon.svg",
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.hostingsarena.com",
        siteName: 'HostingsArena',
        images: [
            {
                url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.hostingsarena.com"}/logo-wide.jpg`,
                width: 1200,
                height: 630,
                alt: 'HostingArena - Real Data Comparisons',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'HostingArena | Real Data Comparisons',
        description: 'Stop relying on fake reviews. We verified 50+ providers with deep data extraction.',
        images: [`${process.env.NEXT_PUBLIC_SITE_URL || "https://www.hostingsarena.com"}/logo-wide.jpg`],
        creator: '@HostingsArena',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html suppressHydrationWarning>
            <head>
                <meta name="impact-site-verification" {...({ "value": "cdd074e0-5799-410e-9f6c-38b9e7633a9b" } as any)} />
            </head>
            <body className="min-h-screen bg-background text-foreground selection:bg-primary/30">
                {children}
            </body>
        </html>
    );
}
