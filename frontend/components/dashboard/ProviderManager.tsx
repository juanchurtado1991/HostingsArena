"use client";

import { useState, useEffect, useCallback } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
    Search, Plus, Edit3, RefreshCw, Loader2, Globe, 
    ShieldCheck, Server, Filter, Database, Zap, Heart
} from "lucide-react";
import { ProviderEditorModal } from "./ProviderEditorModal";
import type { HostingProvider, VPNProvider } from "@/types";

export function ProviderManager() {
    const [providers, setProviders] = useState<(HostingProvider | VPNProvider)[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<"hosting" | "vpn">("hosting");
    const [showModal, setShowModal] = useState(false);
    const [editingProvider, setEditingProvider] = useState<any>(null);

    const fetchProviders = useCallback(async () => {
        setLoading(true);
        try {
            // NOTE: The original code was missing the actual fetch call.
            // Assuming a fetch call like this would precede the error handling.
            // For the purpose of this edit, we're only modifying the error handling logic.
            const res = await fetch(`/api/providers?type=${typeFilter}&search=${search}`);

            if (!res.ok) {
                const text = await res.text();
                let errorMsg = "Failed to fetch providers";
                try {
                    const data = JSON.parse(text);
                    errorMsg = data.error || errorMsg;
                } catch (e) {
                    errorMsg = text || errorMsg;
                }
                throw new Error(errorMsg);
            }
            
            const text = await res.text();
            if (text) {
                try {
                    const data = JSON.parse(text);
                    setProviders(data);
                } catch (e) {
                    console.error("Failed to parse providers JSON:", e);
                    setProviders([]);
                }
            } else {
                setProviders([]);
            }
        } catch (error) {
            console.error("Error fetching providers:", error);
        } finally {
            setLoading(false);
        }
    }, [typeFilter, search]);

    useEffect(() => {
        fetchProviders();
    }, [fetchProviders]);

    const handleEdit = (provider: any) => {
        setEditingProvider(provider);
        setShowModal(true);
    };

    return (
        <div className="space-y-6">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <GlassCard className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                            <Database size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{providers.length}</div>
                            <div className="text-sm text-muted-foreground capitalize">{typeFilter} Providers</div>
                        </div>
                    </div>
                </GlassCard>
                
                <GlassCard className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                            <Zap size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">
                                {providers.filter(p => {
                                    const score = typeFilter === "hosting" ? (p as any).support_score : (p as any).support_quality_score;
                                    return (score || 0) > 80;
                                }).length}
                            </div>
                            <div className="text-sm text-muted-foreground">High Rated (80+)</div>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-6">
                    <Button 
                        variant="default" 
                        className="w-full h-full text-lg font-bold gap-2 rounded-2xl"
                        onClick={() => {
                            setEditingProvider(null);
                            setShowModal(true);
                        }}
                    >
                        <Plus size={24} /> Add Provider
                    </Button>
                </GlassCard>
            </div>

            {/* Filters */}
            <GlassCard className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or slug..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                    <button
                        onClick={() => setTypeFilter("hosting")}
                        className={cn(
                            "px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                            typeFilter === "hosting" ? "bg-primary text-white shadow-lg" : "hover:bg-white/5"
                        )}
                    >
                        <Server size={14} /> Hosting
                    </button>
                    <button
                        onClick={() => setTypeFilter("vpn")}
                        className={cn(
                            "px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                            typeFilter === "vpn" ? "bg-primary text-white shadow-lg" : "hover:bg-white/5"
                        )}
                    >
                        <ShieldCheck size={14} /> VPN
                    </button>
                </div>
            </GlassCard>

            {/* Provider List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full py-20 flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-primary" size={40} />
                        <p className="text-muted-foreground">Loading providers...</p>
                    </div>
                ) : providers.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-muted-foreground">
                        No providers found matching your search.
                    </div>
                ) : (
                    providers.map((p: any) => (
                        <GlassCard key={p.id} className="p-5 flex flex-col justify-between group">
                            <div>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
                                            {p.provider_name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg leading-tight">{p.provider_name}</h3>
                                            <p className="text-xs text-muted-foreground font-mono">{p.slug}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <div className={cn(
                                            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter",
                                            (typeFilter === "hosting" ? p.support_score : p.support_quality_score) >= 80 ? "bg-emerald-500/10 text-emerald-500" :
                                            (typeFilter === "hosting" ? p.support_score : p.support_quality_score) >= 60 ? "bg-amber-500/10 text-amber-500" :
                                            "bg-red-500/10 text-red-500"
                                        )}>
                                            Score: {typeFilter === "hosting" ? (p.support_score || 'N/A') : (p.support_quality_score || 'N/A')}
                                        </div>
                                        <div className="text-[9px] text-muted-foreground italic">
                                            Updated: {p.last_updated ? new Date(p.last_updated).toLocaleDateString() : 'Never'}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                                        <div className="text-[10px] uppercase text-muted-foreground font-bold">Price Intro</div>
                                        <div className="text-sm font-black">${p.pricing_monthly || '0.00'}/mo</div>
                                    </div>
                                    <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                                        <div className="text-[10px] uppercase text-muted-foreground font-bold">Renewal</div>
                                        <div className="text-sm font-black text-amber-500">${p.renewal_price || p.renewal_price_monthly || '0.00'}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="flex-1 rounded-xl hover:bg-white/5"
                                    onClick={() => handleEdit(p)}
                                >
                                    <Edit3 size={14} className="mr-2" /> Edit Details
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="shrink-0 rounded-xl hover:bg-white/5"
                                    asChild
                                >
                                    <a href={`/en/${typeFilter}/${p.slug}`} target="_blank">
                                        <Globe size={14} />
                                    </a>
                                </Button>
                            </div>
                        </GlassCard>
                    ))
                )}
            </div>

            {showModal && (
                <ProviderEditorModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onSave={() => {
                        setShowModal(false);
                        fetchProviders();
                    }}
                    provider={editingProvider}
                    type={typeFilter}
                />
            )}
        </div>
    );
}
