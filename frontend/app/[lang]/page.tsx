import { HeroSection } from "@/components/HeroSection";
import { TopProviders, TopProviderData } from "@/components/TopProviders";
import { GlassCard } from "@/components/ui/GlassCard";
import { RefreshCw, Zap, ShieldCheck } from "lucide-react";
import { getDictionary } from "../../get-dictionary";
import type { Locale } from "../../i18n-config";
import { Metadata } from "next";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";
import { createAdminClient } from "@/lib/tasks/supabaseAdmin";

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.hostingsarena.com";
  
  return {
    title: "Best Web Hosting 2026 (Verified Data) | HostingArena",
    description: "We tested 50+ hosting providers. See the real winners for speed, uptime, and support. No fake reviews, just data.",
    alternates: {
      canonical: `${baseUrl}/${lang}`,
    },
    openGraph: {
      images: [
        {
          url: `${baseUrl}/logo-wide.jpg`,
          width: 1200,
          height: 630,
          alt: 'HostingArena - Web Hosting Comparisons',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      images: [`${baseUrl}/logo-wide.jpg`],
    }
  };
}

export default async function Home({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  const supabase = createAdminClient();
  const { data: activeAffiliates } = await supabase
      .from('affiliate_partners')
      .select('provider_name, affiliate_link')
      .eq('status', 'active');

  const providerNames = activeAffiliates?.map(a => a.provider_name) || [];

  const { data: providersData } = await supabase
      .from('hosting_providers')
      .select('*')
      .in('provider_name', providerNames)
      .order('support_score', { ascending: false });

  const uniqueProviders: TopProviderData[] = [];
  const seenNames = new Set();
  
  for (const p of (providersData || [])) {
      const lowerName = p.provider_name.toLowerCase();
      if (!seenNames.has(lowerName)) {
          seenNames.add(lowerName);
          
          const aff = activeAffiliates?.find(a => a.provider_name.toLowerCase() === lowerName);
          
          uniqueProviders.push({
              rank: uniqueProviders.length + 1,
              name: p.provider_name,
              slug: p.provider_name.toLowerCase().replace(/\s+/g, '-'),
              price: p.pricing_monthly,
              discount: p.renewal_price && p.pricing_monthly 
                  ? `${Math.round(((p.renewal_price - p.pricing_monthly) / p.renewal_price) * 100)}%` 
                  : "0%",
              features: [
                  p.storage_gb ? `${p.storage_gb} GB Storage` : "Generous Storage",
                  p.bandwidth || "Unmetered Bandwidth",
                  "24/7 Support"
              ],
              color: uniqueProviders.length === 0 ? "from-purple-500/20 to-blue-500/20" : uniqueProviders.length === 1 ? "from-orange-500/20 to-red-500/20" : "from-blue-400/20 to-cyan-400/20",
              badge: uniqueProviders.length === 0 ? "Best Overall 2026" : uniqueProviders.length === 1 ? "Fastest Speed" : "Best Value",
              affiliateLink: aff?.affiliate_link || "#"
          });
          
          if (uniqueProviders.length === 3) break;
      }
  }

  const providersToPass = uniqueProviders.length > 0 ? uniqueProviders : undefined;

  return (
    <div className="flex flex-col pb-20 overflow-x-hidden">
      <OrganizationJsonLd />

      <HeroSection dict={dict.hero} lang={lang} />

      <div className="relative z-20 -mt-12 px-4">
        <TopProviders dict={dict.common} lang={lang} providers={providersToPass} />
      </div>


      <section className="py-24 relative z-10 bg-gradient-to-b from-transparent to-background/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">{dict.home.trust_title}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {dict.home.trust_desc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <RefreshCw className="w-8 h-8 text-blue-400" />,
                title: dict.home.trust_1_title,
                desc: dict.home.trust_1_desc
              },
              {
                icon: <Zap className="w-8 h-8 text-yellow-400" />,
                title: dict.home.trust_2_title,
                desc: dict.home.trust_2_desc
              },
              {
                icon: <ShieldCheck className="w-8 h-8 text-green-400" />,
                title: dict.home.trust_3_title,
                desc: dict.home.trust_3_desc
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
      </section>


      <section className="container mx-auto px-6 text-center py-20 pb-40">
        <h2 className="text-3xl font-bold mb-6">{dict.home.convince_title}</h2>
        <p className="text-muted-foreground mb-8 text-lg">
          {dict.home.convince_desc}
        </p>
      </section>
    </div >
  );
}
