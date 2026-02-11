"use client";

import { HostingProvider, VPNProvider } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Shield, Server, Zap, Globe, Cpu, HardDrive, Mail, Cloud, ShieldCheck, Trophy, Lock, Swords } from "lucide-react";
import Link from "next/link";

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
    <div className="w-full overflow-hidden rounded-3xl border border-border shadow-2xl bg-card">
      <div className="p-6 border-b border-border/50 flex items-center gap-3 bg-muted/5">
        <div className="p-2 bg-primary/10 rounded-xl">
          <Swords className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">{title || (type === 'hosting' ? 'Hosting Comparison' : 'VPN Comparison')}</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Side-by-Side Analysis</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-secondary/30 border-b border-border">
              <th className="p-6 min-w-[200px] font-bold text-lg">Specs Comparison</th>
              {data.map((p, i) => (
                <th key={i} className="p-6 min-w-[250px] text-center border-l border-border/50">
                  <div className="text-2xl font-black tracking-tight text-foreground">{p.provider_name}</div>
                  <div className="text-sm text-muted-foreground font-medium">{(p as HostingProvider).plan_name || "Premium Plan"}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {/* PRICE ROW */}
            <tr className={getRowClass(0)}>
              <td className="p-6 font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" /> Monthly Price
              </td>
              {data.map((p, i) => (
                <td key={i} className={`p-6 text-center border-l border-border/50 ${i === priceWinner ? "bg-green-500/5" : ""}`}>
                  <div className="relative inline-block">
                    <div className="text-3xl font-bold text-green-600">${p.pricing_monthly}</div>
                    {i === priceWinner && (
                      <Badge className="absolute -top-6 -right-8 bg-green-500 hover:bg-green-500 scale-75 border-none">
                        <Trophy className="w-3 h-3 mr-1" /> Best Value
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Starting term</div>
                </td>
              ))}
            </tr>

            {/* RENEWAL ROW */}
            <tr className={getRowClass(1)}>
              <td className="p-6 font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" /> Renewal Price
              </td>
              {data.map((p, i) => {
                const hp = p as HostingProvider;
                const hike = hp.renewal_price && hp.pricing_monthly
                  ? Math.round(((hp.renewal_price - hp.pricing_monthly) / hp.pricing_monthly) * 100)
                  : 0;
                return (
                  <td key={i} className={`p-6 text-center border-l border-border/50 ${i === renewalWinner ? "bg-blue-500/5" : ""}`}>
                    <div className="text-xl font-bold text-foreground">
                      {hp.renewal_price ? `$${hp.renewal_price}` : "N/A"}
                    </div>
                    {hike > 0 && (
                      <div className="text-[10px] font-bold text-destructive uppercase tracking-widest mt-1">
                        +{hike}% Price Hike
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>

            {type === "hosting" ? (
              <>
                {/* WEB SERVER */}
                <tr className={getRowClass(0)}>
                  <td className="p-6 font-semibold flex items-center gap-2">
                    <Server className="w-4 h-4 text-purple-500" /> Web Server
                  </td>
                  {data.map((p, i) => (
                    <td key={i} className="p-6 text-center border-l border-border/50">
                      <div className="font-bold flex items-center justify-center gap-2">
                        {(p as HostingProvider).web_server?.includes("LiteSpeed") && <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                        {(p as HostingProvider).web_server || "Apache"}
                      </div>
                    </td>
                  ))}
                </tr>
                {/* CONTROL PANEL */}
                <tr className={getRowClass(1)}>
                  <td className="p-6 font-semibold flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-amber-500" /> Control Panel
                  </td>
                  {data.map((p, i) => (
                    <td key={i} className="p-6 text-center border-l border-border/50">
                      <div className="font-bold">{(p as HostingProvider).control_panel || "cPanel"}</div>
                    </td>
                  ))}
                </tr>
                {/* UPTIME */}
                <tr className={getRowClass(0)}>
                  <td className="p-6 font-semibold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Uptime SLA
                  </td>
                  {data.map((p, i) => (
                    <td key={i} className="p-6 text-center border-l border-border/50">
                      <div className="font-bold">{(p as HostingProvider).uptime_guarantee ? `${(p as HostingProvider).uptime_guarantee}%` : "99.9%"}</div>
                    </td>
                  ))}
                </tr>
                {/* BACKUPS */}
                <tr className={getRowClass(1)}>
                  <td className="p-6 font-semibold flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-sky-500" /> Backup Sync
                  </td>
                  {data.map((p, i) => (
                    <td key={i} className="p-6 text-center border-l border-border/50">
                      <div className="font-bold text-xs">{(p as HostingProvider).backup_frequency || "Daily"}</div>
                    </td>
                  ))}
                </tr>
                {/* STORAGE TYPE */}
                <tr className={getRowClass(1)}>
                  <td className="p-6 font-semibold flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-indigo-500" /> Storage
                  </td>
                  {data.map((p, i) => (
                    <td key={i} className="p-6 text-center border-l border-border/50">
                      <div className="font-bold">{(p as HostingProvider).storage_gb} GB</div>
                      <div className="text-[10px] text-muted-foreground uppercase">{(p as HostingProvider).storage_type || "SSD"}</div>
                    </td>
                  ))}
                </tr>
                {/* WORDPRESS */}
                <tr className={getRowClass(0)}>
                  <td className="p-6 font-semibold flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" /> WordPress Support
                  </td>
                  {data.map((p, i) => (
                    <td key={i} className="p-6 text-center border-l border-border/50">
                      {renderFeature((p as HostingProvider).features?.wordpress_support ?? true)}
                    </td>
                  ))}
                </tr>
                {/* EMAILS */}
                <tr className={getRowClass(1)}>
                  <td className="p-6 font-semibold flex items-center gap-2">
                    <Mail className="w-4 h-4 text-pink-500" /> Email Accounts
                  </td>
                  {data.map((p, i) => (
                    <td key={i} className="p-6 text-center border-l border-border/50">
                      <div className="font-bold">{String((p as HostingProvider).features?.email_accounts || "Included")}</div>
                    </td>
                  ))}
                </tr>
                {/* PHP */}
                <tr className={getRowClass(0)}>
                  <td className="p-6 font-semibold flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-slate-500" /> PHP Versions
                  </td>
                  {data.map((p, i) => (
                    <td key={i} className="p-6 text-center border-l border-border/50">
                      <div className="flex flex-wrap justify-center gap-1">
                        {(p as HostingProvider).php_versions?.slice(0, 3).map((v: string) => (
                          <Badge key={v} variant="outline" className="text-[9px] px-1 py-0">{v}</Badge>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
                {/* MIGRATION */}
                <tr className={getRowClass(1)}>
                  <td className="p-6 font-semibold flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-cyan-500" /> Free Migration
                  </td>
                  {data.map((p, i) => (
                    <td key={i} className="p-6 text-center border-l border-border/50">
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
            <tr>
              <td className="p-6 bg-muted/5 font-bold text-center flex flex-col items-center justify-center gap-2">
                <Swords className="w-5 h-5 text-primary/50" />
                <span>Final Decision</span>
              </td>
              {data.map((p, i) => (
                <td key={i} className="p-8 text-center border-l border-border/50 bg-muted/5">
                  <Button className="w-full h-12 rounded-full font-black text-lg shadow-xl hover:scale-105 transition-transform" asChild>
                    <a href={p.website_url || "#"} target="_blank" rel="noopener noreferrer">
                      Get Offer <ChevronRight className="ml-1 w-5 h-5" />
                    </a>
                  </Button>
                  <div className="mt-3 text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                    Verified by HostingArena
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
