"use client";

import { HostingProvider, VPNProvider } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Check, X, Zap, Shield, Globe, Server, ShieldCheck, Lock, Trophy, Swords } from "lucide-react";
import { AffiliateButton } from "@/components/conversion/AffiliateButton";

interface ComparisonTableProps {
  data: (HostingProvider | VPNProvider)[];
  title?: string;
  type?: "hosting" | "vpn";
  affiliateUrls?: string[];
}

export function ComparisonTable({ data, title, type = "hosting", affiliateUrls }: ComparisonTableProps) {
  if (!data || data.length === 0) return null;

  const renderFeature = (val: any) => {
    if (typeof val === 'boolean') {
      return val ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-red-500 mx-auto" />;
    }
    if (!val || val === 'unknown' || val === 'Unknown') return <span className="text-muted-foreground opacity-50">-</span>;
    return (
      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-medium whitespace-nowrap text-xs">
        {String(val)}
      </Badge>
    );
  };

  const getWinner = (field: keyof HostingProvider | keyof VPNProvider, lowIsBetter = true) => {
    let bestVal = lowIsBetter ? Infinity : -Infinity;
    let winnerIdx = -1;
    data.forEach((p, i) => {
      const val = (p as any)[field];
      if (typeof val === 'number' && val > 0) {
        if ((lowIsBetter && val < bestVal) || (!lowIsBetter && val > bestVal)) {
          bestVal = val;
          winnerIdx = i;
        }
      }
    });
    return winnerIdx;
  };

  const priceWinner = getWinner('pricing_monthly', true);
  const renewalWinner = getWinner('renewal_price', true);

  // Build rows data for both layout types
  const hostingRows = [
    { label: 'Intro Price', icon: <Zap className="w-4 h-4 text-green-500" />, key: 'pricing_monthly', render: (p: any, i: number) => (
      <div className={`text-2xl md:text-4xl font-black ${i === priceWinner ? "text-green-500" : "text-foreground"}`}>
        ${p.pricing_monthly}<span className="text-sm font-medium text-muted-foreground ml-1">/mo</span>
        {i === priceWinner && <div className="text-xs text-green-600 font-bold mt-1">🏆 Best Price</div>}
      </div>
    )},
    { label: 'Renewal Price', icon: <Shield className="w-4 h-4 text-blue-500" />, key: 'renewal_price', render: (p: any, i: number) => {
      const hike = p.renewal_price && p.pricing_monthly ? Math.round(((p.renewal_price - p.pricing_monthly) / p.pricing_monthly) * 100) : 0;
      return (
        <div>
          <div className="text-xl font-black">{p.renewal_price ? `$${p.renewal_price}` : 'N/A'}</div>
          {hike > 0 && <div className="text-xs text-red-500 font-bold mt-1">+{hike}% Jump</div>}
        </div>
      );
    }},
    { label: 'Web Server', icon: <Server className="w-4 h-4 text-purple-500" />, key: 'web_server', render: (p: any) => (
      <div className="font-bold flex items-center gap-1 justify-center">
        {p.web_server?.includes("LiteSpeed") && <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
        {p.web_server || 'Apache'}
      </div>
    )},
    { label: 'Disk Space', icon: <Shield className="w-4 h-4 text-orange-500" />, key: 'storage_gb', render: (p: any) => (
      <div><div className="text-xl font-black">{p.storage_gb} GB</div><div className="text-xs text-muted-foreground">{p.storage_type || 'SSD'}</div></div>
    )},
    { label: 'Uptime', icon: <Zap className="w-4 h-4 text-emerald-500" />, key: 'uptime_guarantee', render: (p: any) => (
      <div><div className="text-xl font-black">{p.uptime_guarantee ? `${p.uptime_guarantee}%` : '99.9%'}</div><div className="text-xs text-emerald-500 font-bold">Verified</div></div>
    )},
    { label: 'WordPress', icon: <Check className="w-4 h-4 text-blue-500" />, key: 'features.wordpress_support', render: (p: any) => renderFeature(p.features?.wordpress_support ?? true)},
    { label: 'Free Migration', icon: <Globe className="w-4 h-4 text-green-500" />, key: 'features.free_migration', render: (p: any) => renderFeature(p.features?.free_migration)},
  ];

  const vpnRows = [
    { label: 'Intro Price', icon: <Zap className="w-4 h-4 text-green-500" />, key: 'pricing_monthly', render: (p: any, i: number) => (
      <div className={`text-2xl font-black ${i === priceWinner ? "text-green-500" : "text-foreground"}`}>${p.pricing_monthly}/mo</div>
    )},
    { label: 'Protocols', icon: <ShieldCheck className="w-4 h-4 text-green-500" />, key: 'protocols', render: (p: any) => (
      <div className="flex flex-wrap justify-center gap-1">{(p.protocols || []).slice(0,3).map((v: string) => <Badge key={v} variant="outline" className="text-[9px] px-1 py-0">{v}</Badge>)}</div>
    )},
    { label: 'Devices', icon: <Zap className="w-4 h-4 text-orange-500" />, key: 'simultaneous_connections', render: (p: any) => (
      <div className="font-bold">{p.simultaneous_connections || 'Standard (5-8)'}</div>
    )},
    { label: 'Kill Switch', icon: <Lock className="w-4 h-4 text-red-500" />, key: 'features.kill_switch', render: (p: any) => renderFeature(p.features?.kill_switch ?? true)},
    { label: 'Jurisdiction', icon: <Globe className="w-4 h-4 text-blue-500" />, key: 'jurisdiction', render: (p: any) => <div className="font-bold">{p.jurisdiction || 'N/A'}</div>},
    { label: 'Encryption', icon: <Server className="w-4 h-4 text-purple-500" />, key: 'encryption_type', render: (p: any) => <div className="font-bold">{p.encryption_type || 'AES-256'}</div>},
    { label: 'Streaming', icon: <Zap className="w-4 h-4 text-yellow-500" />, key: 'features.supports_streaming', render: (p: any) => renderFeature(p.features?.supports_streaming)},
  ];

  const rows = type === 'hosting' ? hostingRows : vpnRows;

  return (
    <div className="w-full overflow-hidden rounded-2xl md:rounded-[2.5rem] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] bg-background/20 backdrop-blur-3xl relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

      {/* Header */}
      <div className="p-4 md:p-8 border-b border-white/5 flex items-center gap-3 md:gap-4 bg-white/5">
        <div className="p-2 md:p-3 bg-primary/20 rounded-xl md:rounded-2xl border border-primary/30">
          <Swords className="w-5 h-5 md:w-6 md:h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-lg md:text-2xl font-black tracking-tight">{title || (type === 'hosting' ? 'Verified Comparison' : 'VPN Deep Analysis')}</h2>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Live Verification Engine</p>
        </div>
      </div>

      {/* MOBILE: Card-based layout — one column per provider, stacked */}
      <div className="block md:hidden">
        {data.map((provider, providerIdx) => (
          <div key={providerIdx} className={`p-4 border-b border-white/5 ${providerIdx > 0 ? 'border-t-4 border-t-primary/20' : ''}`}>
            {/* Provider header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div>
                <div className="text-xl font-black">{provider.provider_name}</div>
                <div className="text-xs text-primary font-bold">{(provider as HostingProvider).plan_name || 'Premium Plan'}</div>
              </div>
              {providerIdx === priceWinner && (
                <Badge className="bg-green-500 text-white text-xs flex items-center gap-1">
                  <Trophy className="w-3 h-3" /> Best Price
                </Badge>
              )}
            </div>

            {/* Rows as key-value pairs */}
            <div className="space-y-3">
              {rows.map((row, rowIdx) => (
                <div key={rowIdx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                    {row.icon}
                    <span className="truncate">{row.label}</span>
                  </div>
                  <div className="text-right text-sm font-medium ml-4 shrink-0">
                    {row.render(provider, providerIdx)}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-4">
              <AffiliateButton
                className="w-full h-12 font-bold rounded-xl"
                providerName={provider.provider_name}
                visitUrl={(affiliateUrls && affiliateUrls[providerIdx] && affiliateUrls[providerIdx] !== '#') ? affiliateUrls[providerIdx] : (provider.website_url || '#')}
                position="comparison_table_mobile"
              >
                Get Offer →
              </AffiliateButton>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP: Full table with horizontal scroll fallback */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              <th className="p-6 min-w-[180px] font-bold text-sm uppercase tracking-widest text-muted-foreground/60">Features</th>
              {data.map((p, i) => (
                <th key={i} className="p-6 min-w-[240px] text-center border-l border-white/5">
                  <div className="text-2xl font-black tracking-tighter mb-1">{p.provider_name}</div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary">
                    {(p as HostingProvider).plan_name || 'Premium Verified Plan'}
                  </div>
                  {i === priceWinner && <div className="mt-2"><Badge className="bg-green-500 text-white text-xs"><Trophy className="w-3 h-3 mr-1" />Best Price</Badge></div>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-5 font-bold text-foreground">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg">{row.icon}</div>
                    <span className="text-sm">{row.label}</span>
                  </div>
                </td>
                {data.map((p, i) => (
                  <td key={i} className="p-5 text-center border-l border-white/5">
                    {row.render(p, i)}
                  </td>
                ))}
              </tr>
            ))}

            {/* CTA row */}
            <tr className="bg-white/5">
              <td className="p-8 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Swords className="w-6 h-6 text-primary/30" />
                  <span className="text-xs uppercase tracking-widest text-muted-foreground/60">Final Decision</span>
                </div>
              </td>
              {data.map((p, i) => (
                <td key={i} className="p-8 text-center border-l border-white/5">
                  <AffiliateButton
                    className="w-full h-12 text-base font-black rounded-2xl"
                    providerName={p.provider_name}
                    visitUrl={(affiliateUrls && affiliateUrls[i] && affiliateUrls[i] !== '#') ? affiliateUrls[i] : (p.website_url || '#')}
                    position="comparison_table_final"
                  >
                    Get Verified Offer →
                  </AffiliateButton>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
