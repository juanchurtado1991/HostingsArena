"use client";

import { HostingProvider, VPNProvider } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Shield, Server, Zap, Globe, Cpu, HardDrive, Mail, Cloud, ShieldCheck, Trophy, Lock, Swords } from "lucide-react";
import Link from "next/link";
import { AffiliateButton } from "@/components/conversion/AffiliateButton";

interface ComparisonTableProps {
  data: (HostingProvider | VPNProvider)[];
  title?: string;
  type?: "hosting" | "vpn";
}

export function ComparisonTable({ data, title, type = "hosting" }: ComparisonTableProps) {
  if (!data || data.length === 0) return null;

  const renderFeature = (val: any) => {
    if (typeof val === 'boolean') {
      return val ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-red-500 mx-auto" />;
    }
    if (!val || val === 'unknown' || val === 'Unknown') return <span className="text-muted-foreground opacity-50">-</span>;

    return (
      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-medium whitespace-nowrap">
        {String(val)}
      </Badge>
    );
  };

  const getRowClass = (idx: number) => idx % 2 === 0 ? "bg-background" : "bg-muted/10";

  // WINNER LOGIC
  const getWinner = (field: keyof HostingProvider | keyof VPNProvider, lowIsBetter = true) => {
    let bestVal = lowIsBetter ? Infinity : -Infinity;
    let winnerIdx = -1;

    data.forEach((p, i) => {
      const val = (p as any)[field];
      if (typeof val === 'number' && val > 0) {
        if (lowIsBetter) {
          if (val < bestVal) {
            bestVal = val;
            winnerIdx = i;
          }
        } else {
          if (val > bestVal) {
            bestVal = val;
            winnerIdx = i;
          }
        }
      }
    });

    return winnerIdx;
  };

  const priceWinner = getWinner('pricing_monthly', true);
  const renewalWinner = getWinner('renewal_price', true);

  return (
    <div className="w-full overflow-hidden rounded-[2.5rem] border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] bg-background/20 backdrop-blur-3xl relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

      <div className="p-8 border-b border-white/5 flex items-center justify-between relative bg-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/20 rounded-2xl border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Swords className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">{title || (type === 'hosting' ? 'Verified Comparison' : 'VPN Deep Analysis')}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-black">Live Verification Engine</p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              <th className="p-8 min-w-[200px] font-bold text-sm uppercase tracking-widest text-muted-foreground/60">Features Breakdown</th>
              {data.map((p, i) => (
                <th key={i} className="p-8 min-w-[280px] text-center border-l border-white/5">
                  <div className="text-3xl font-black tracking-tighter text-foreground mb-1">{p.provider_name}</div>
                  <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-tighter">
                    {(p as HostingProvider).plan_name || "Premium Verified Plan"}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {/* PRICE ROW */}
            <tr className="hover:bg-white/[0.02] transition-colors">
              <td className="p-8 font-bold text-foreground">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Zap className="w-4 h-4 text-green-500" />
                  </div>
                  <span>Intro Price</span>
                </div>
              </td>
              {data.map((p, i) => (
                <td key={i} className={`p-8 text-center border-l border-white/5 transition-all relative overflow-hidden ${i === priceWinner ? "bg-green-500/[0.03]" : ""}`}>
                  {i === priceWinner && (
                    <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 to-transparent pointer-events-none" />
                  )}
                  <div className="relative inline-block">
                    <div className={`text-4xl font-black ${(i === priceWinner) ? "text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]" : "text-foreground"}`}>
                      ${p.pricing_monthly}
                      <span className="text-sm font-medium text-muted-foreground ml-1">/mo</span>
                    </div>
                    {i === priceWinner && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                        <Badge className="bg-green-500 hover:bg-green-500 text-[9px] font-black uppercase tracking-tighter py-0 px-2 rounded-sm ring-2 ring-background">
                          <Trophy className="w-2.5 h-2.5 mr-1" /> Overwhelming Winner
                        </Badge>
                      </div>
                    )}
                  </div>
                </td>
              ))}
            </tr>

            {/* RENEWAL ROW */}
            <tr className="hover:bg-white/[0.02] transition-colors">
              <td className="p-8 font-bold text-foreground">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Shield className="w-4 h-4 text-blue-500" />
                  </div>
                  <span>Renewal Price</span>
                </div>
              </td>
              {data.map((p, i) => {
                const hp = p as HostingProvider;
                const hike = hp.renewal_price && hp.pricing_monthly
                  ? Math.round(((hp.renewal_price - hp.pricing_monthly) / hp.pricing_monthly) * 100)
                  : 0;
                return (
                  <td key={i} className={`p-8 text-center border-l border-white/5 transition-all ${i === renewalWinner ? "bg-blue-500/[0.02]" : ""}`}>
                    <div className="text-2xl font-black text-foreground">
                      {hp.renewal_price ? `$${hp.renewal_price}` : "N/A"}
                    </div>
                    {hike > 0 && (
                      <div className="inline-block mt-2 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-[9px] font-black text-red-500 uppercase tracking-widest">
                        +{hike}% Jump
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>

            {type === "hosting" ? (
              <>
                {/* WEB SERVER */}
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-8 font-medium text-muted-foreground">Web Server</td>
                  {data.map((p, i) => (
                    <td key={i} className="p-8 text-center border-l border-white/5">
                      <div className="font-black text-foreground flex items-center justify-center gap-2">
                        {(p as HostingProvider).web_server?.includes("LiteSpeed") && <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                        {(p as HostingProvider).web_server || "Apache"}
                      </div>
                    </td>
                  ))}
                </tr>
                {/* STORAGE */}
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-8 font-medium text-muted-foreground">Disk Space</td>
                  {data.map((p, i) => (
                    <td key={i} className="p-8 text-center border-l border-white/5">
                      <div className="text-xl font-black text-foreground">{(p as HostingProvider).storage_gb} GB</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{(p as HostingProvider).storage_type || "SSD"}</div>
                    </td>
                  ))}
                </tr>
                {/* UPTIME */}
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-8 font-medium text-muted-foreground">Market Uptime</td>
                  {data.map((p, i) => (
                    <td key={i} className="p-8 text-center border-l border-white/5">
                      <div className="text-xl font-black text-foreground">{(p as HostingProvider).uptime_guarantee ? `${(p as HostingProvider).uptime_guarantee}%` : "99.9%"}</div>
                      <div className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">Verified</div>
                    </td>
                  ))}
                </tr>
                {/* WORDPRESS */}
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-8 font-medium text-muted-foreground">WordPress Ready</td>
                  {data.map((p, i) => (
                    <td key={i} className="p-8 text-center border-l border-white/5">
                      {renderFeature((p as HostingProvider).features?.wordpress_support ?? true)}
                    </td>
                  ))}
                </tr>
                {/* FREE MIGRATION */}
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-8 font-medium text-muted-foreground">Free Migration</td>
                  {data.map((p, i) => (
                    <td key={i} className="p-8 text-center border-l border-white/5">
                      {renderFeature((p as HostingProvider).features?.free_migration)}
                    </td>
                  ))}
                </tr>
              </>
            ) : (
              <>
                {/* PROTOCOLS */}
                <tr className={getRowClass(0)}>
                  <td className="p-6 font-semibold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-500" /> Protocols
                  </td>
                  {data.map((p, i) => {
                    const vp = p as VPNProvider;
                    const protocols = vp.protocols || [];
                    return (
                      <td key={i} className="p-6 text-center border-l border-border/50">
                        <div className="flex flex-wrap justify-center gap-1">
                          {protocols.slice(0, 3).map((v: string) => (
                            <Badge key={v} variant="outline" className="text-[9px] px-1 py-0 bg-green-500/5">{v}</Badge>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
                {/* CONNECTIONS */}
                <tr className={getRowClass(1)}>
                  <td className="p-6 font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-500" /> Devices
                  </td>
                  {data.map((p, i) => (
                    <td key={i} className="p-6 text-center border-l border-border/50">
                      <div className="font-bold">{(p as VPNProvider).simultaneous_connections || "Standard (5-8)"}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-tighter">Simultaneous</div>
                    </td>
                  ))}
                </tr>
                {/* KILL SWITCH */}
                <tr className={getRowClass(0)}>
                  <td className="p-6 font-semibold flex items-center gap-2">
                    <Lock className="w-4 h-4 text-red-500" /> Kill Switch
                  </td>
                  {data.map((p, i) => (
                    <td key={i} className="p-6 text-center border-l border-border/50">
                      {renderFeature((p as VPNProvider).features?.kill_switch ?? true)}
                    </td>
                  ))}
                </tr>
                {/* JURISDICTION */}
                <tr className={getRowClass(1)}>
                  <td className="p-6 font-semibold flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-500" /> Jurisdiction
                  </td>
                  {data.map((p, i) => (
                    <td key={i} className="p-6 text-center border-l border-border/50">
                      <div className="font-bold">{(p as any).jurisdiction || "N/A"}</div>
                    </td>
                  ))}
                </tr>
                {/* ENCRYPTION */}
                <tr className={getRowClass(0)}>
                  <td className="p-6 font-semibold flex items-center gap-2">
                    <Server className="w-4 h-4 text-purple-500" /> Encryption
                  </td>
                  {data.map((p, i) => (
                    <td key={i} className="p-6 text-center border-l border-border/50">
                      <div className="font-bold">{(p as any).encryption_type || "AES-256"}</div>
                    </td>
                  ))}
                </tr>
                {/* STREAMING */}
                <tr className={getRowClass(1)}>
                  <td className="p-6 font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" /> Streaming Support
                  </td>
                  {data.map((p, i) => (
                    <td key={i} className="p-6 text-center border-l border-border/50">
                      {renderFeature((p as VPNProvider).features?.supports_streaming)}
                    </td>
                  ))}
                </tr>
              </>
            )}

            {/* FINAL CTA ROW */}
            <tr className="bg-white/5">
              <td className="p-10 font-bold text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 -z-10" />
                <div className="flex flex-col items-center gap-3">
                  <Swords className="w-8 h-8 text-primary/30" />
                  <span className="text-sm uppercase tracking-[0.3em] font-black text-muted-foreground/60">Final Decision</span>
                </div>
              </td>
              {data.map((p, i) => (
                <td key={i} className="p-10 text-center border-l border-white/5 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <AffiliateButton
                    className="w-full h-14 text-xl font-black rounded-2xl shadow-[0_20px_40px_-10px_rgba(59,130,246,0.3)] hover:scale-[1.02] transition-all"
                    providerName={p.provider_name}
                    visitUrl={p.website_url || "#"}
                    position="comparison_table_final"
                  >
                    Get Verified Offer <ChevronRight className="ml-2 w-6 h-6" />
                  </AffiliateButton>
                  <div className="mt-4 text-[9px] text-muted-foreground uppercase font-black tracking-widest flex items-center justify-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary" />
                    Trusted Verification Seal
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ChevronRight({ className, ...props }: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
