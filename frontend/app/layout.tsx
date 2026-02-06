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
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground selection:bg-primary/30">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
