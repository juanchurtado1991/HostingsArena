"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Trophy, RefreshCw, Save, ArrowDown, ArrowUp } from "lucide-react";

interface AffiliatePartner {
    id: string;
    provider_name: string;
    homepage_rank: number | null;
}

export function Top3Manager() {
    const [affiliates, setAffiliates] = useState<AffiliatePartner[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedTop3, setSelectedTop3] = useState<(string | null)[]>([null, null, null]);

    const fetchAffiliates = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/affiliates?status=active");
            const data = await res.json();
            if (data.affiliates) {
                setAffiliates(data.affiliates);
                
                const initialTop3: (string | null)[] = [null, null, null];
                data.affiliates.forEach((aff: AffiliatePartner) => {
                    if (aff.homepage_rank === 1) initialTop3[0] = aff.id;
                    if (aff.homepage_rank === 2) initialTop3[1] = aff.id;
                    if (aff.homepage_rank === 3) initialTop3[2] = aff.id;
                });
                setSelectedTop3(initialTop3);
            }
        } catch (error) {
            console.error("Failed to fetch affiliates for top 3", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAffiliates();
    }, []);

    const handleSelectChange = (index: number, affiliateId: string) => {
        const newSelected = [...selectedTop3];
        const existingIndex = newSelected.indexOf(affiliateId);
        if (existingIndex !== -1 && existingIndex !== index && affiliateId !== "") {
            newSelected[existingIndex] = null;
        }
        newSelected[index] = affiliateId === "" ? null : affiliateId;
        setSelectedTop3(newSelected);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/settings/top-providers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ top3: selectedTop3 }),
            });
            
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to save top 3");
            }
            alert("Top 3 saved successfully!");
            fetchAffiliates(); 
        } catch (error: any) {
            console.error("Save error:", error);
            alert("Error saving: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <GlassCard className="p-4 md:p-6 mb-8 border-white/[0.05] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-yellow-500/20" />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        Homepage Top 3 Providers
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 text-balance">
                        Select which providers to feature on the main homepage. If empty, the system automatically falls back to sorting by support score.
                    </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                     <Button size="sm" variant="outline" onClick={fetchAffiliates} disabled={loading} className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 flex-1 sm:flex-none">
                        <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={loading || saving} className="rounded-xl bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-600/90 hover:to-orange-600/90 shadow-lg shadow-yellow-500/20 font-semibold flex-1 sm:flex-none text-white border-0">
                        {saving ? <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
                        Save Rankings
                    </Button>
                </div>
            </div>

            {loading ? (
                 <div className="text-center py-8 text-muted-foreground">Loading rank data...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((rank, index) => (
                        <div key={rank} className="p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col gap-3 group hover:border-white/20 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${rank === 1 ? 'bg-yellow-500/20 text-yellow-500' : rank === 2 ? 'bg-gray-400/20 text-gray-400' : 'bg-orange-500/20 text-orange-500'}`}>
                                        #{rank}
                                    </div>
                                    <span className="text-sm font-semibold text-muted-foreground group-hover:text-white transition-colors">Rank {rank}</span>
                                </div>
                            </div>
                            
                            <select
                                value={selectedTop3[index] || ""}
                                onChange={(e) => handleSelectChange(index, e.target.value)}
                                className="w-full h-10 px-3 rounded-lg bg-black/40 border border-white/10 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-white appearance-none"
                            >
                                <option value="">-- Auto Fallback --</option>
                                {affiliates.map(aff => (
                                    <option key={aff.id} value={aff.id}>
                                        {aff.provider_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            )}
        </GlassCard>
    );
}