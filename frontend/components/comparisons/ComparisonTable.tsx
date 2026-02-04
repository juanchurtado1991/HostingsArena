"use client";

import { useState } from "react";
import { HostingProvider } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Check, X } from "lucide-react";

interface ComparisonTableProps {
  data: HostingProvider[];
  title?: string;
}

type SortField = "pricing_monthly" | "renewal_price" | "performance_grade";

export function ComparisonTable({ data, title = "Hosting Comparison" }: ComparisonTableProps) {
  const [sortField, setSortField] = useState<SortField>("pricing_monthly");
  const [sortAsc, setSortAsc] = useState(true);

  const sortedData = [...data].sort((a, b) => {
    const valA = a[sortField] || 0;
    const valB = b[sortField] || 0;
    
    // Custom sort for grades
    if (sortField === "performance_grade") {
      // Logic for grades A, B, C...
      return sortAsc ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
    }
    
    if (typeof valA === "number" && typeof valB === "number") {
      return sortAsc ? valA - valB : valB - valA;
    }
    return 0;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="w-full overflow-x-auto rounded-lg border">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 min-w-[200px]">Provider</th>
            <th className="px-6 py-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("pricing_monthly")}>
              <div className="flex items-center gap-1">
                Price (mo) <ArrowUpDown className="h-4 w-4" />
              </div>
            </th>
            <th className="px-6 py-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("renewal_price")}>
              <div className="flex items-center gap-1">
                Renewal <ArrowUpDown className="h-4 w-4" />
              </div>
            </th>
            <th className="px-6 py-3">Specs</th>
            <th className="px-6 py-3">Features</th>
            <th className="px-6 py-3">Score</th>
            <th className="px-6 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((provider, idx) => (
            <tr key={`${provider.provider_name}-${idx}`} className="bg-white border-b hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900">
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-gray-900">{provider.provider_name}</span>
                  <span className="text-xs text-gray-500">{provider.plan_name} Plan</span>
                  {provider.website_url && (
                    <a href={provider.website_url} target="_blank" className="text-xs text-blue-600 hover:underline mt-1">Visit Site ↗</a>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(provider.pricing_monthly)}
                  </span>
                  {provider.pricing_yearly && (
                    <span className="text-xs text-gray-500">
                      billed yearly ({formatCurrency(provider.pricing_yearly)})
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-700">
                    {formatCurrency(provider.renewal_price)}
                  </span>
                  {provider.renewal_increase_percentage && (
                    <Badge variant="destructive" className="mt-1 w-fit text-[10px]">
                      +{provider.renewal_increase_percentage}% hike
                    </Badge>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <ul className="space-y-1 text-xs text-gray-600">
                  <li className="flex items-center gap-1">
                    💾 <b>{provider.storage_gb ?? "Unl."} GB</b> {provider.storage_type}
                  </li>
                  <li className="flex items-center gap-1">
                    🧠 <b>{provider.ram_mb ? `${provider.ram_mb}MB`: "-"}</b> RAM
                  </li>
                  <li className="flex items-center gap-1">
                    🌐 <b>{provider.websites_allowed}</b> Sites
                  </li>
                </ul>
              </td>
              <td className="px-6 py-4">
                 <div className="flex flex-wrap gap-1">
                   {provider.free_ssl && <Badge variant="secondary" className="text-[10px]">SSL</Badge>}
                   {provider.backup_included && <Badge variant="secondary" className="text-[10px]">Backups</Badge>}
                   {provider.free_domain && <Badge variant="secondary" className="text-[10px]">Domain</Badge>}
                 </div>
              </td>
              <td className="px-6 py-4">
                {provider.support_satisfaction_score ? (
                   <div className="flex items-center gap-1">
                     <span className="font-bold">{provider.support_satisfaction_score}</span>
                     <span className="text-xs text-gray-400">/5</span>
                   </div>
                ) : (
                  <span className="text-xs text-gray-400">-</span>
                )}
              </td>
              <td className="px-6 py-4">
                <Button size="sm" className="w-full">
                  View Deal
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
