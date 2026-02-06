"use client";

import { motion } from "framer-motion";
import { GlassCard } from "./ui/GlassCard";
import { ArrowRight, Shield, Zap, RefreshCw } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      
      {/* Background Gradients */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-400/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-[128px] animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Based on 100% Real Verification Data
        </motion.div>

        {/* Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hero-title max-w-4xl mx-auto"
        >
          The Truth About <span className="text-primary">Hosting & VPNs</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="hero-subtitle mb-10"
        >
          Stop relying on fake reviews. We verified 120+ providers with deep data extraction.
          <br className="hidden md:block" />
          See hidden renewal fees, real RAM limits, and proven audit histories.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <Link href="/compare" className="h-12 px-8 rounded-full bg-foreground text-background font-semibold flex items-center gap-2 hover:scale-105 transition-transform">
            Start Comparing <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/hosting" className="h-12 px-8 rounded-full border border-border bg-background/50 backdrop-blur-sm text-foreground font-semibold flex items-center gap-2 hover:bg-background/80 transition-colors">
            Browse Providers
          </Link>
        </motion.div>

        {/* Features Grid (Floating Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <MotionGlassCard delay={0.4} icon={RefreshCw} title="Real Renewal Prices" desc="We expose the 200%+ price hikes hidden in the fine print." />
          <MotionGlassCard delay={0.5} icon={Zap} title="True Performance" desc="Verified TTFB, NVMe storage types, and LVE RAM limits." />
          <MotionGlassCard delay={0.6} icon={Shield} title="Privacy Audits" desc="We track which VPNs actually have 'No-Logs' audits." />
        </div>

      </div>
    </section>
  );
}

function MotionGlassCard({ delay, icon: Icon, title, desc }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <GlassCard className="text-left h-full">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
      </GlassCard>
    </motion.div>
  );
}
