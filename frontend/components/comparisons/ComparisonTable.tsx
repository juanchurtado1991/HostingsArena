"use client";

import { useState } from "react";
import { HostingProvider } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Check, X, Trophy, AlertTriangle, Crown } from "lucide-react";
import Link from "next/link"; // Assuming Link is needed for CTA

interface ComparisonTableProps {
  data: HostingProvider[];
  title?: string;
}

type SortField = "pricing_monthly" | "renewal_price" | "performance_grade" | "storage_gb" | "support_satisfaction_score";

export function ComparisonTable({ data, title = "Hosting Comparison" }: ComparisonTableProps) {
  const [sortField, setSortField] = useState<SortField>("pricing_monthly");
  const [sortAsc, setSortAsc] = useState(true);

  const getWinner = (field: SortField) => {
    if (!data || data.length < 2) return null;
    let winner = data[0];
    for (let i = 1; i < data.length; i++) {
      const valA = winner[field];
      const valB = data[i][field];

      if (field === "pricing_monthly" || field === "renewal_price") {
        if (Number(valB) < Number(valA)) winner = data[i];
      } else {
        if (Number(valB) > Number(valA)) winner = data[i];
      }
    }
    return winner.provider_name;
  };

  const monthlyPriceWinner = getWinner("pricing_monthly");
  const renewalPriceWinner = getWinner("renewal_price");
  const scoreWinner = getWinner("support_satisfaction_score");


  const sortedData = [...data].sort((a, b) => {
    const valA = a[sortField] || 0;
    const valB = b[sortField] || 0;

    if (sortField === "performance_grade") {
      return sortAsc ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
    }

    if (typeof valA === "number" && typeof valB === "number") {
      return sortAsc ? valA - valB : valB - valA;
    }
    return 0;
  });

  const handleSort = (field: SortField) => {
    /* ... logic remains ... */
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="w-full relative">
      {/* Sticky Mobile/Desktop Action Header (Optional, or just keep buttons inside) */}

      <div className="overflow-x-auto rounded-xl border border-border shadow-sm bg-card">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b">
            <tr>
              <th className="px-6 py-4 min-w-[200px]">Provider</th>
              <th className="px-6 py-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort("pricing_monthly")}>
                <div className="flex items-center gap-1">
                  Initial Price <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="px-6 py-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort("renewal_price")}>
                <div className="flex items-center gap-1">
                  True Renewal <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="px-6 py-4">Specs</th>
              <th className="px-6 py-4">Features</th>
              <th className="px-6 py-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort("support_satisfaction_score")}>
                Score
              </th>
              <th className="px-6 py-4 text-center sticky right-0 bg-muted/30 backdrop-blur-sm z-10 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                Verdict
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedData.map((provider, idx) => (
              <tr key={`${provider.provider_name}-${idx}`} className="bg-card hover:bg-muted/10 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-foreground flex items-center gap-2">
                      {provider.provider_name}
                    </span>
                    <span className="text-xs text-muted-foreground">{provider.plan_name}</span>
                  </div>
                </td>

                {/* Initial Price */}
                <td className="px-6 py-5 relative">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className={`text-xl font-bold ${monthlyPriceWinner === provider.provider_name ? 'text-green-600' : 'text-foreground'}`}>
                        {formatCurrency(provider.pricing_monthly)}
                      </span>
                      {monthlyPriceWinner === provider.provider_name && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200 text-[10px] px-1 py-0 h-5">
                          Best
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">/mo</span>
                  </div>
                </td>

                {/* Renewal Price (Aggressive) */}
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${renewalPriceWinner === provider.provider_name ? 'text-green-600' : 'text-foreground'}`}>
                        {formatCurrency(provider.renewal_price)}
                      </span>
                      {renewalPriceWinner === provider.provider_name && <Check className="w-4 h-4 text-green-500" />}
                    </div>

                    {/* HIKING ALERT */}
                    {provider.renewal_price && provider.pricing_monthly && (provider.renewal_price > provider.pricing_monthly * 1.5) && (
                      <div className="flex items-center gap-1 mt-1 text-destructive font-bold text-[10px] animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                        <span>+{Math.round(((provider.renewal_price - provider.pricing_monthly) / provider.pricing_monthly) * 100)}% Hike</span>
                      </div>
                    )}
                  </div>
                </td>

                {/* Specs */}
                <td className="px-6 py-5">
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    <li className="flex items-center gap-1.5">
                      <span className="text-foreground font-medium">disk:</span>
                      <b>{provider.storage_gb ?? "Unl."} GB</b> {provider.storage_type}
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-foreground font-medium">ram:</span>
                      <b>{provider.ram_mb ? `${provider.ram_mb}MB` : "-"}</b>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-foreground font-medium">sites:</span>
                      <b>{provider.websites_allowed}</b>
                    </li>
                  </ul>
                </td>

                {/* Features */}
                <td className="px-6 py-5">
                  <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                    {provider.free_ssl && <Badge variant="secondary" className="text-[10px] bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">SSL</Badge>}
                    {provider.backup_included && <Badge variant="secondary" className="text-[10px] bg-purple-500/10 text-purple-600 hover:bg-purple-500/20">Daily Backups</Badge>}
                    {provider.free_domain && <Badge variant="secondary" className="text-[10px] bg-orange-500/10 text-orange-600 hover:bg-orange-500/20">Domain</Badge>}
                  </div>
                </td>

                {/* Score */}
                <td className="px-6 py-5">
                  {provider.support_satisfaction_score ? (
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-lg ${scoreWinner === provider.provider_name ? 'text-primary' : 'text-foreground'}`}>
                        {provider.support_satisfaction_score}
                      </span>
                      <span className="text-xs text-muted-foreground">/5</span>
                      {scoreWinner === provider.provider_name && <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </td>

                {/* Atomic CTA (Sticky) */}
                <td className="px-6 py-5 sticky right-0 bg-card group-hover:bg-muted/10 transition-colors shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)] border-l border-border/50">
                  <div className="flex flex-col gap-2 min-w-[140px]">
                    <Link href={`https://www.google.com/search?q=${provider.provider_name}+hosting+deal`} target="_blank">
                      <Button size="sm" className="w-full font-bold shadow-md shadow-primary/20 hover:scale-105 transition-transform">
                        Ver Oferta ⚡️
                      </Button>
                    </Link>
                    {monthlyPriceWinner === provider.provider_name && (
                      <span className="text-[10px] text-center text-green-600 font-semibold">
                        🏆 Best Value
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
