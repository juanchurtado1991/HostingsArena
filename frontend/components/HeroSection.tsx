"use client";

import { m, LazyMotion, domAnimation } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { GlobalSearch } from "./GlobalSearch";

export function HeroSection({ dict, lang = 'en' }: { dict?: any, lang?: string }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <section className="relative pt-28 pb-12 flex flex-col items-center justify-start overflow-hidden">

        {/* Background Gradients — non-blocking decorative elements */}
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-400/20 rounded-full blur-[64px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-[64px]" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">

          {/* Badge - rendered immediately, animated subtly */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-8 animate-in fade-in slide-in-from-top-2 duration-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            {dict?.badge || "Based on 100% Real Verification Data"}
          </div>

          {/* Title — LCP element: render immediately, NO opacity:0 initial so browser can paint it */}
          <h1 className="hero-title max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {dict?.title || "The Truth About"} <span className="text-primary">{dict?.title_highlight || "Hosting & VPNs"}</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle mb-8 animate-in fade-in duration-700 delay-100">
            {dict?.subtitle || "Stop relying on fake reviews. We verified 50+ providers with deep data extraction. See hidden renewal fees, real RAM limits, and proven audit histories."}
          </p>

          {/* Hero Search */}
          <m.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex justify-center mb-10 w-full px-4"
          >
            <GlobalSearch
              variant="hero"
              lang={lang}
              placeholder={lang === 'es' ? "Buscar proveedores (ej. Bluehost, NordVPN)..." : "Search providers (e.g. Bluehost, NordVPN)..."}
            />
          </m.div>

          {/* CTA Buttons */}
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <Link href={`/${lang}/compare`} className="h-12 px-8 rounded-full bg-foreground text-background font-semibold flex items-center gap-2 hover:scale-105 transition-transform">
              {dict?.cta_compare || "Start Comparing"} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href={`/${lang}/hosting`} className="h-12 px-8 rounded-full border border-border bg-background/50 backdrop-blur-sm text-foreground font-semibold flex items-center gap-2 hover:bg-background/80 transition-colors">
              {dict?.cta_browse || "Browse Providers"}
            </Link>
          </m.div>

        </div>
      </section>
    </LazyMotion>
  );
}
