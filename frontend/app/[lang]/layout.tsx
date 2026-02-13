import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/layout/Footer";
import "../globals.css";
import { i18n } from "../../i18n-config";
import { getDictionary } from "../../get-dictionary";
import type { Locale } from "../../i18n-config";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.hostingsarena.com"),
  title: {
    default: "HostingArena | Real Data Comparisons",
    template: "%s | HostingArena"
  },
  description: "Stop relying on fake reviews. We verified 120+ providers with deep data extraction. Real uptime, real speeds, real hidden fees revealed.",
  icons: {
    icon: "/swords-icon.svg",
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.hostingsarena.com",
    siteName: 'HostingsArena',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo-wide.jpg`,
        width: 1200,
        height: 630,
        alt: 'HostingArena - Real Data Comparisons',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HostingArena | Real Data Comparisons',
    description: 'Stop relying on fake reviews. We verified 120+ providers with deep data extraction.',
    images: [`${process.env.NEXT_PUBLIC_SITE_URL}/logo-wide.jpg`],
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

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <meta name="impact-site-verification" {...({ "value": "cdd074e0-5799-410e-9f6c-38b9e7633a9b" } as any)} />
      </head>
      <body className="min-h-screen bg-background text-foreground selection:bg-primary/30">
        <Navbar dict={dict} lang={lang} />
        <main>{children}</main>
        <Footer dict={dict} lang={lang} />
      </body>
    </html>
  );
}
