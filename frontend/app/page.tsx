import { HeroSection } from "@/components/HeroSection";
import { TopProviders } from "@/components/TopProviders";
import { GlassCard } from "@/components/ui/GlassCard";
import { RefreshCw, Zap, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col pb-20 overflow-x-hidden">

      {/* 1. Hero Section (Clean) */}
      <HeroSection />

      {/* 2. Money Maker: Top 3 Providers (Overlap Effect done correctly) */}
      <div className="relative z-20 -mt-12 px-4">
        <TopProviders />
      </div>

      {/* 3. Value Props (Moved below to avoid visual clash) */}
      <section className="py-24 relative z-10 bg-gradient-to-b from-transparent to-background/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Trust HostingArena?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We don't rely on marketing claims. We scrape, verify, and benchmark every single provider daily.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <RefreshCw className="w-8 h-8 text-blue-400" />,
                title: "Real Renewal Prices",
                desc: "Hosting companies hide their real prices. We expose the 200% price hikes after year 1."
              },
              {
                icon: <Zap className="w-8 h-8 text-yellow-400" />,
                title: "True Performance",
                desc: "We track TTFB and Uptime from multiple global locations, not just what they advertise."
              },
              {
                icon: <ShieldCheck className="w-8 h-8 text-green-400" />,
                title: "Privacy Verified",
                desc: "For VPNs, we verify No-Log policies and ownership jurisdictions to ensure your safety."
              }
            ].map((feature, i) => (
              <GlassCard key={i} className="p-8 flex flex-col items-center text-center gap-4 border-white/5 hover:border-primary/20 transition-all">
                <div className="p-4 rounded-2xl bg-primary/10 mb-2 ring-1 ring-white/10">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-xl">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section >

      {/* 4. Compare CTA */}
      < section className="container mx-auto px-6 text-center py-10" >
        <h2 className="text-3xl font-bold mb-6">Not convinced?</h2>
        <p className="text-muted-foreground mb-8 text-lg">
          Compare 50+ providers side-by-side with our deep data engine.
        </p>
      </section >
    </div >
  );
}
