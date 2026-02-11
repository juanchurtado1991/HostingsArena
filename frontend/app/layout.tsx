import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "HostingArena | Real Data Comparisons",
  description: "Stop relying on fake reviews. We verified 120+ providers with deep data extraction.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="impact-site-verification" {...({ "value": "cdd074e0-5799-410e-9f6c-38b9e7633a9b" } as any)} />
      </head>
      <body className="min-h-screen bg-background text-foreground selection:bg-primary/30">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
