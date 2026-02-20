import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency } from "@/lib/utils";
import { Check, Server, Database, TrendingUp, ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getAffiliateUrlBatch, getActiveAffiliatePartners } from "@/lib/affiliates";
import { PageTracker } from "@/components/tracking/PageTracker";
import { AffiliateButton } from "@/components/conversion/AffiliateButton";
import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";

import { GlobalSearch } from "@/components/GlobalSearch";

export const metadata = {
  title: "Top Hosting Providers - Verified Benchmarks | HostingArena",
  description: "Browse 200+ hosting providers with real performance data. No fluff, just benchmarks.",
};

export default async function HostingPage({
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

  // Fetch ALL matching rows (no range limit yet) to allow proper grouping
  let dbQuery = supabase
    .from("hosting_providers")
    .select("*");

  if (query) {
    dbQuery = dbQuery.ilike("provider_name", `%${query}%`);
  }

  // Order by price to ensure we get the cheapest plan easily if we used distinct (but we'll do JS grouping)
  const { data: allRows } = await dbQuery.order("pricing_monthly", { ascending: true });

  // Group by provider_name and pick the first one (cheapest, since we ordered by price)
  const uniqueProvidersMap = new Map();

  if (allRows) {
    for (const row of allRows) {
      if (!uniqueProvidersMap.has(row.provider_name)) {
        uniqueProvidersMap.set(row.provider_name, row);
      }
    }
  }

  let uniqueProviders = Array.from(uniqueProvidersMap.values());

  const activeAffiliates = await getActiveAffiliatePartners();

  // Sort by affiliate status first, then alphabetically
  uniqueProviders.sort((a: any, b: any) => {
    const aHasAffiliate = activeAffiliates.has(a.provider_name.toLowerCase()) ? 1 : 0;
    const bHasAffiliate = activeAffiliates.has(b.provider_name.toLowerCase()) ? 1 : 0;
    
    if (aHasAffiliate !== bHasAffiliate) {
      return bHasAffiliate - aHasAffiliate;
    }
    
    return a.provider_name.localeCompare(b.provider_name);
  });

  // Client-side pagination
  const totalItems = uniqueProviders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const providers = uniqueProviders.slice(start, end + 1);

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
            {dict.hosting.title.split('Hosting')[0]} <span className="text-primary">Hosting</span> {dict.hosting.title.split('Hosting')[1] || ''}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            {dict.hosting.subtitle}
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <GlobalSearch
              variant="hero"
              lang={lang}
              placeholder={dict.hosting.search_placeholder}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {providers?.map((provider) => (
            <GlassCard key={provider.id} className="flex flex-col h-full hover:border-primary/30 transition-colors">

              {/* Card Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold line-clamp-1" title={provider.provider_name}>{provider.provider_name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-sm font-medium text-muted-foreground">{provider.plan_name || dict.hosting.starting_plan}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">{formatCurrency(provider.pricing_monthly)}</div>
                  <div className="text-xs text-muted-foreground">/mo</div>
                </div>
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
                {provider.storage_gb && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Server className="w-4 h-4" /> {dict.hosting.storage}
                    </span>
                    <span className="font-medium">
                      {provider.storage_gb && provider.storage_gb >= 999 ? dict.hosting.unlimited : `${provider.storage_gb} GB`} {provider.storage_type && provider.storage_type !== 'unknown' ? provider.storage_type : ''}
                    </span>
                  </div>
                )}
                {provider.inodes && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Database className="w-4 h-4" /> {dict.hosting.inode_limit}
                    </span>
                    <span className="font-medium">{provider.inodes?.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Money Maker Logic: Calculated Discount */}
              {provider.renewal_price && provider.pricing_monthly && provider.renewal_price > provider.pricing_monthly && (
                <div className="mb-4">
                  <span className="bg-green-500/10 text-green-500 text-xs font-bold px-2 py-1 rounded-full border border-green-500/20">
                    {dict.hosting.save_percent.replace('{percent}', Math.round(((provider.renewal_price - provider.pricing_monthly) / provider.renewal_price) * 100).toString())}
                  </span>
                </div>
              )}

              {/* CTA - Deep Analysis First */}
              <div className="mt-auto">
                <Link href={`/${lang}/hosting/${provider.slug || provider.provider_name.toLowerCase().replace(/\s+/g, '-')}`} className="w-full">
                  <Button 
                    variant="default" 
                    size="lg" 
                    className="w-full rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/10 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                  >
                    {dict.common.read_review.replace('{provider}', provider.provider_name)}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

            </GlassCard>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-4">
            {currentPage > 1 && (
              <Link href={`/${lang}/hosting?page=${currentPage - 1}${query ? `&q=${query}` : ''}`}>
                <Button variant="outline" size="icon" className="rounded-full">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </Link>
            )}
            <span className="flex items-center font-medium text-muted-foreground">
              {dict.hosting.page_x_of_y.replace('{current}', currentPage.toString()).replace('{total}', totalPages.toString())}
            </span>
            {currentPage < totalPages && (
              <Link href={`/${lang}/hosting?page=${currentPage + 1}${query ? `&q=${query}` : ''}`}>
                <Button variant="outline" size="icon" className="rounded-full">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>
        )}

        {(!providers || providers.length === 0) && (
          <div className="text-center py-20 text-muted-foreground">
            <p>{dict.hosting.no_results.replace('{query}', query)}</p>
            <Link href={`/${lang}/hosting`} className="text-primary hover:underline mt-2 inline-block">{dict.hosting.clear_search}</Link>
          </div>
        )}

      </div>
    </div>
  );
}
