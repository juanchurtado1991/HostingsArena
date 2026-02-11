import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency } from "@/lib/utils";
import { Check, Server, Database, TrendingUp, Search, ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getAffiliateUrlBatch } from "@/lib/affiliates";
import { PageTracker } from "@/components/tracking/PageTracker";

export const metadata = {
  title: "Top Hosting Providers - Verified Benchmarks | HostingArena",
  description: "Browse 200+ hosting providers with real performance data. No fluff, just benchmarks.",
};

export default async function HostingPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const supabase = await createClient();
  const { page, q } = await searchParams;

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

  const uniqueProviders = Array.from(uniqueProvidersMap.values());

  // Sort alphabetically by provider name (or keep price order if preferred, but usually lists are alphabetical or by rank)
  // Let's stick to the previous behavior: alphabetical
  uniqueProviders.sort((a, b) => a.provider_name.localeCompare(b.provider_name));

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
            Premium <span className="text-primary">Hosting</span> Providers
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Compare real performance metrics, hidden renewal costs, and infrastructure limits.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <form action="/hosting" method="get">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                name="q"
                placeholder="Search providers (e.g. Bluehost)..."
                defaultValue={query}
                className="w-full h-12 pl-10 pr-4 rounded-full border border-border bg-black/5 dark:bg-white/5 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </form>
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
                    <span className="text-sm font-medium text-muted-foreground">{provider.plan_name || "Starting Plan"}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">{formatCurrency(provider.pricing_monthly)}</div>
                  <div className="text-xs text-muted-foreground">/mo</div>
                </div>
              </div>

              {/* Renewal Warning */}
              {provider.renewal_price && (
                <div className="bg-destructive/5 border border-destructive/10 rounded-xl p-3 mb-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-destructive font-medium flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Renewal
                    </span>
                    <span className="font-bold text-foreground">{formatCurrency(provider.renewal_price)}/mo</span>
                  </div>
                </div>
              )}

              {/* Specs */}
              <div className="space-y-4 mb-8 flex-grow">
                {provider.storage_gb && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Server className="w-4 h-4" /> Storage
                    </span>
                    <span className="font-medium">{provider.storage_gb} GB {provider.storage_type}</span>
                  </div>
                )}
                {provider.inodes && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Database className="w-4 h-4" /> Inode Limit
                    </span>
                    <span className="font-medium">{provider.inodes?.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Money Maker Logic: Calculated Discount */}
              {provider.renewal_price && provider.pricing_monthly && provider.renewal_price > provider.pricing_monthly && (
                <div className="mb-4">
                  <span className="bg-green-500/10 text-green-500 text-xs font-bold px-2 py-1 rounded-full border border-green-500/20">
                    Save {Math.round(((provider.renewal_price - provider.pricing_monthly) / provider.renewal_price) * 100)}%
                  </span>
                </div>
              )}

              {/* CTA - Money First */}
              <div className="mt-auto space-y-3">
                <Link href={affiliateUrls.get(provider.provider_name) || provider.website_url} target="_blank" className="w-full block">
                  <Button className="w-full rounded-xl font-bold shadow-lg shadow-primary/10 hover:scale-[1.02] transition-transform" size="lg">
                    Ver Oferta Exclusiva ⚡️
                  </Button>
                </Link>
                <Link href={`/hosting/${provider.slug || provider.provider_name.toLowerCase().replace(/\s+/g, '-')}`} className="block text-center text-xs text-muted-foreground hover:text-primary transition-colors">
                  Ver análisis de {provider.provider_name}
                </Link>
              </div>

            </GlassCard>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-4">
            {currentPage > 1 && (
              <Link href={`/hosting?page=${currentPage - 1}${query ? `&q=${query}` : ''}`}>
                <Button variant="outline" size="icon" className="rounded-full">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </Link>
            )}
            <span className="flex items-center font-medium text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            {currentPage < totalPages && (
              <Link href={`/hosting?page=${currentPage + 1}${query ? `&q=${query}` : ''}`}>
                <Button variant="outline" size="icon" className="rounded-full">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>
        )}

        {(!providers || providers.length === 0) && (
          <div className="text-center py-20 text-muted-foreground">
            <p>No hosting providers found matching "{query}".</p>
            <Link href="/hosting" className="text-primary hover:underline mt-2 inline-block">Clear search</Link>
          </div>
        )}

      </div>
    </div>
  );
}
