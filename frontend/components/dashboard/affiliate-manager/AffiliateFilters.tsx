import React from "react";
import { Search, Filter, ChevronDown, BookOpen, RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AffiliateFiltersProps {
    search: string;
    setSearch: (s: string) => void;
    statusFilter: string;
    setStatusFilter: (s: string) => void;
    networkFilter: string;
    setNetworkFilter: (s: string) => void;
    uniqueNetworks: string[];
    showGuide: boolean;
    setShowGuide: (s: boolean) => void;
    onRefresh: () => void;
    onAdd: () => void;
    loading: boolean;
}

export function AffiliateFilters({
    search, setSearch,
    statusFilter, setStatusFilter,
    networkFilter, setNetworkFilter,
    uniqueNetworks,
    showGuide, setShowGuide,
    onRefresh, onAdd,
    loading
}: AffiliateFiltersProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search providers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                    />
                </div>

                <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/10 overflow-x-auto max-w-full scrollbar-hide">
                    {["all", "active", "paused", "expired", "processing_approval", "rejected"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${statusFilter === s
                                ? "bg-primary text-white shadow-lg shadow-primary/25"
                                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                }`}
                        >
                            {s === "all" ? "All" : s === "processing_approval" ? "Processing" : s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Filter className="w-3.5 h-3.5" />
                    </div>
                    <select
                        value={networkFilter}
                        onChange={(e) => setNetworkFilter(e.target.value)}
                        className="h-10 pl-9 pr-8 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all appearance-none cursor-pointer"
                    >
                        <option value="all">All Networks</option>
                        {uniqueNetworks.map(n => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                </div>
            </div>

            <div className="flex gap-3">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowGuide(!showGuide)}
                    className={`rounded-xl border-white/10 hover:bg-white/5 transition-all ${showGuide ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : ""
                        }`}
                >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Guide
                    <ChevronDown className={`w-3 h-3 ml-1.5 transition-transform duration-200 ${showGuide ? "rotate-180" : ""}`} />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefresh}
                    disabled={loading}
                    className="rounded-xl border-white/10 hover:bg-white/5"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
                <Button
                    size="sm"
                    onClick={onAdd}
                    className="rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/25 font-semibold"
                >
                    <Plus className="w-4 h-4 mr-2" /> Add Partner
                </Button>
            </div>
        </div>
    );
}
