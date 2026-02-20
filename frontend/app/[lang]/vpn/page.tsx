import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency } from "@/lib/utils";
import { Check, Shield, Globe, Lock, Activity, ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { getAffiliateUrlBatch, getActiveAffiliatePartners } from "@/lib/affiliates";
import { PageTracker } from "@/components/tracking/PageTracker";
import { AffiliateButton } from "@/components/conversion/AffiliateButton";
import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";

import { GlobalSearch } from "@/components/GlobalSearch";
import { TrendingUp } from "lucide-react";

export const metadata = {
  title: "Top VPNs - Verified Privacy Audits | HostingArena",
  description: "Independent analysis of 60+ VPNs. Checking for RAM-only servers, real jurisdiction, and court-proven no-logs policies.",
};

export default async function VPNPage({
  searchParams,
  params
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
  params: Promise<{ lang: Locale }>;
}) {
  const supabase = await createClient();
  const { page, q } = await searchParams;
  const { lang } = await params;
  const dict = await getDictionary(lang);

  const currentPage = Number(page) || 1;
  const query = q || "";
  const itemsPerPage = 12;
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage - 1;

  // Let's fetch all active affiliates globally
  const activeAffiliates = await getActiveAffiliatePartners();
  
  // We need to fetch all providers if we want to sort globally before pagination.
  // BUT the VPN page currently natively paginates via Supabase `.range(start, end)`.
  // To sort by affiliate first, we MUST fetch all active providers, or at least modify the query.
  // For simplicity since the number of VPNs is small (< 100), we fetch all, sort, and slice like in Hosting.
  let allQuery = supabase
    .from("vpn_providers")
    .select("*", { count: "exact" });

  if (query) {
    allQuery = allQuery.ilike("provider_name", `%${query}%`);
  }

  const { data: allProviders, count } = await allQuery.order("provider_name", { ascending: true });
  
  // Deduplicate by provider_name
  const uniqueProvidersMap = new Map();
  if (allProviders) {
    for (const p of allProviders) {
      if (!uniqueProvidersMap.has(p.provider_name)) {
        uniqueProvidersMap.set(p.provider_name, p);
      }
    }
  }

  let uniqueProviders = Array.from(uniqueProvidersMap.values());
  
  let sortedProviders = uniqueProviders.sort((a: any, b: any) => {
    const aHasAffiliate = activeAffiliates.has(a.provider_name.toLowerCase()) ? 1 : 0;
    const bHasAffiliate = activeAffiliates.has(b.provider_name.toLowerCase()) ? 1 : 0;
    
    if (aHasAffiliate !== bHasAffiliate) {
      return bHasAffiliate - aHasAffiliate;
    }
    return a.provider_name.localeCompare(b.provider_name);
  });

  const totalPages = sortedProviders ? Math.ceil(sortedProviders.length / itemsPerPage) : 0;
  const providers = sortedProviders.slice(start, end + 1);

  const affiliateUrls = providers ? await getAffiliateUrlBatch(
    providers.map(p => ({ provider_name: p.provider_name, website_url: p.website_url }))
  ) : new Map<string, string>();

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <PageTracker />
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            {dict.vpn.title}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            {dict.vpn.subtitle}
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <GlobalSearch
              variant="hero"
              lang={lang}
              placeholder={dict.vpn.search_placeholder}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {providers?.map((provider) => (
            <GlassCard key={provider.id} className="flex flex-col h-full relative overflow-hidden hover:border-blue-500/30 transition-colors">

              {/* Badge for RAM Only - Make sure col exists or use safe check */}
              {provider.has_kill_switch && (
                <div className="absolute top-0 right-0 bg-green-500/10 text-green-500 text-xs font-bold px-3 py-1 rounded-bl-xl border-l border-b border-green-500/20">
                  {dict.vpn.verified}
                </div>
              )}

              {/* Card Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold line-clamp-1" title={provider.provider_name}>{provider.provider_name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <Globe className="w-3 h-3" /> {dict.vpn.countries.replace('{count}', (provider.country_count || "?").toString())}
                  </div>
                </div>
                <div className="text-right pt-4">
                  <div className="text-3xl font-bold text-primary">{formatCurrency(provider.pricing_monthly)}</div>
                  <div className="text-xs text-muted-foreground">/mo</div>
                </div>
              </div>

              {/* Jurisdiction Warning */}
              <div className={cn(
                "border rounded-xl p-3 mb-6 flex justify-between items-center text-sm",
                ["Panama", "BVI", "Switzerland", "Iceland"].includes(provider.jurisdiction)
                  ? "bg-blue-500/5 border-blue-500/20 text-blue-500"
                  : "bg-yellow-500/5 border-yellow-500/20 text-yellow-600"
              )}>
                <span className="font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4" /> {dict.vpn.jurisdiction}
                </span>
                <span className="font-bold">{provider.jurisdiction || "Unknown"}</span>
              </div>

              {/* Renewal Warning / Fair Renewal */}
              {provider.renewal_price && (
                provider.renewal_price <= provider.pricing_monthly ? (
                  <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-3 mb-6">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-green-500 font-medium flex items-center gap-2">
                        <Check className="w-4 h-4" /> {dict.common.fair_renewal}
                      </span>
                      <span className="font-bold text-foreground">{formatCurrency(provider.renewal_price)}/mo</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-destructive/5 border border-destructive/10 rounded-xl p-3 mb-6">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-destructive font-medium flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> {dict.hosting.renewal}
                      </span>
                      <span className="font-bold text-foreground">{formatCurrency(provider.renewal_price)}/mo</span>
                    </div>
                  </div>
                )
              )}

              {/* Specs */}
              <div className="space-y-4 mb-8 flex-grow">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Activity className="w-4 h-4" /> {dict.vpn.servers}
                  </span>
                  <span className="font-medium">{provider.server_count ? provider.server_count.toLocaleString() : "N/A"}</span>
                </div>
                {provider.simultaneous_connections && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Check className="w-4 h-4" /> {dict.vpn.devices}
                    </span>
                    <span className="font-medium">{provider.simultaneous_connections} {dict.vpn.simultaneous}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Lock className="w-4 h-4" /> {dict.vpn.audited_by}
                  </span>
                  <span className="font-medium text-right max-w-[120px] truncate">
                    {provider.audits && provider.audits.length > 0 ? provider.audits.join(", ") : dict.vpn.pending}
                  </span>
                </div>
              </div>

              {/* Money Maker Logic: Calculated Discount */}
              {provider.renewal_price && provider.pricing_monthly && provider.renewal_price > provider.pricing_monthly && (
                <div className="mb-4">
                  <span className="bg-green-500/10 text-green-500 text-xs font-bold px-2 py-1 rounded-full border border-green-500/20">
                    {dict.hosting.save_percent.replace('{percent}', Math.round(((provider.renewal_price - provider.pricing_monthly) / provider.renewal_price) * 100).toString())}
                  </span>
                </div>
              )}

              {/* CTA - Money First */}
              <div className="mt-auto space-y-3">
                <AffiliateButton
                  providerName={provider.provider_name}
                  visitUrl={affiliateUrls.get(provider.provider_name) || provider.website_url}
                  position="vpn_list_card"
                  className="w-full rounded-xl font-bold shadow-lg shadow-primary/10 hover:scale-[1.02] transition-transform"
                  size="lg"
                  showIcon={false}
                >
                  {dict.hosting.view_deal}
                </AffiliateButton>
                <Link href={`/${lang}/vpn/${provider.slug || provider.provider_name.toLowerCase().replace(/\s+/g, '-')}`} className="block text-center text-xs text-muted-foreground hover:text-primary transition-colors">
                  {dict.hosting.read_review.replace('{provider}', provider.provider_name)}
                </Link>
              </div>

            </GlassCard>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-4">
            {currentPage > 1 && (
              <Link href={`/${lang}/vpn?page=${currentPage - 1}${query ? `&q=${query}` : ''}`}>
                <Button variant="outline" size="icon" className="rounded-full">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </Link>
            )}
            <span className="flex items-center font-medium text-muted-foreground">
              {dict.hosting.page_x_of_y.replace('{current}', currentPage.toString()).replace('{total}', totalPages.toString())}
            </span>
            {currentPage < totalPages && (
              <Link href={`/${lang}/vpn?page=${currentPage + 1}${query ? `&q=${query}` : ''}`}>
                <Button variant="outline" size="icon" className="rounded-full">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>
        )}

        {(!providers || providers.length === 0) && (
          <div className="text-center py-20 text-muted-foreground">
            <p>{dict.vpn.no_results.replace('{query}', query)}</p>
            <Link href={`/${lang}/vpn`} className="text-primary hover:underline mt-2 inline-block">{dict.hosting.clear_search}</Link>
          </div>
        )}

      </div>
    </div>
  );
}
