"use client";

import { useState, useEffect, useCallback } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import {
    Search, Plus, Link as LinkIcon, ExternalLink, Edit3, Trash2,
    CheckCircle, XCircle, Pause, RefreshCw, Loader2, Globe,
    TrendingUp, Clock, BarChart3, Copy, Check, BookOpen, ChevronDown
} from "lucide-react";
import { AffiliateFormModal, EMPTY_AFFILIATE_FORM } from "./AffiliateFormModal";
import type { AffiliateFormData, ProviderOption } from "./AffiliateFormModal";

interface AffiliatePartner {
    id: string;
    provider_name: string;
    affiliate_link: string | null;
    network: string | null;
    commission_rate: string | null;
    cookie_days: number | null;
    link_duration_days: number | null;
    expires_at: string | null;
    status: string;
    last_verified_at: string | null;
}

interface AffiliateStats {
    total: number;
    active: number;
    paused: number;
    expired: number;
}



const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
    active: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", label: "Active" },
    paused: { icon: Pause, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", label: "Paused" },
    expired: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", label: "Expired" },
};

export function AffiliateManager() {
    const [affiliates, setAffiliates] = useState<AffiliatePartner[]>([]);
    const [stats, setStats] = useState<AffiliateStats>({ total: 0, active: 0, paused: 0, expired: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [showModal, setShowModal] = useState(false);
    const [editingAffiliate, setEditingAffiliate] = useState<AffiliatePartner | null>(null);
    const [modalInitialData, setModalInitialData] = useState<AffiliateFormData>(EMPTY_AFFILIATE_FORM);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [showGuide, setShowGuide] = useState(false);
    const [providerOptions, setProviderOptions] = useState<ProviderOption[]>([]);

    // Fetch real providers for dropdown
    useEffect(() => {
        const fetchProviders = async () => {
            try {
                const [hostingRes, vpnRes] = await Promise.all([
                    fetch("/api/providers?type=hosting"),
                    fetch("/api/providers?type=vpn"),
                ]);
                const hosting = await hostingRes.json();
                const vpn = await vpnRes.json();
                const options: ProviderOption[] = [
                    ...(Array.isArray(hosting) ? hosting.map((p: any) => ({ name: p.provider_name, type: "hosting" as const })) : []),
                    ...(Array.isArray(vpn) ? vpn.map((p: any) => ({ name: p.provider_name, type: "vpn" as const })) : []),
                ];
                setProviderOptions(options);
            } catch (e) {
                console.error("Failed to fetch providers:", e);
            }
        };
        fetchProviders();
    }, []);

    const fetchAffiliates = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            if (statusFilter !== "all") params.set("status", statusFilter);

            const res = await fetch(`/api/admin/affiliates?${params}`);
            const data = await res.json();

            if (data.affiliates) setAffiliates(data.affiliates);
            if (data.stats) setStats(data.stats);
        } catch (e) {
            console.error("Failed to fetch affiliates:", e);
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter]);

    useEffect(() => {
        fetchAffiliates();
    }, [fetchAffiliates]);

    const openAddModal = () => {
        setEditingAffiliate(null);
        setModalInitialData(EMPTY_AFFILIATE_FORM);
        setShowModal(true);
    };

    const openEditModal = (aff: AffiliatePartner) => {
        setEditingAffiliate(aff);
        setModalInitialData({
            provider_name: aff.provider_name,
            affiliate_link: aff.affiliate_link || "",
            network: aff.network || "",
            commission_rate: aff.commission_rate || "",
            cookie_days: aff.cookie_days ? String(aff.cookie_days) : "",
            link_duration_days: aff.link_duration_days ? String(aff.link_duration_days) : "",
            status: aff.status || "active",
        });
        setShowModal(true);
    };

    const handleSave = async (data: AffiliateFormData) => {
        const method = editingAffiliate ? "PATCH" : "POST";
        const body = editingAffiliate
            ? { id: editingAffiliate.id, ...data }
            : data;

        const res = await fetch("/api/admin/affiliates", {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Failed to save");

        setShowModal(false);
        fetchAffiliates();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro? This will remove the affiliate link and all CTAs will fall back to website_url.")) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/admin/affiliates?id=${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            fetchAffiliates();
        } catch (e) {
            console.error("Delete failed:", e);
        } finally {
            setDeletingId(null);
        }
    };

    const handleToggleStatus = async (aff: AffiliatePartner) => {
        const nextStatus = aff.status === "active" ? "paused" : "active";
        try {
            await fetch("/api/admin/affiliates", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: aff.id, status: nextStatus }),
            });
            fetchAffiliates();
        } catch (e) {
            console.error("Toggle failed:", e);
        }
    };

    const handleCopy = (id: string, link: string) => {
        navigator.clipboard.writeText(link);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleTestLink = (link: string) => {
        window.open(link, "_blank", "noopener,noreferrer");
    };

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Partners", value: stats.total, icon: Globe, gradient: "from-blue-500/20 to-indigo-500/20", color: "text-blue-400" },
                    { label: "Active Links", value: stats.active, icon: TrendingUp, gradient: "from-emerald-500/20 to-green-500/20", color: "text-emerald-400" },
                    { label: "Paused", value: stats.paused, icon: Pause, gradient: "from-amber-500/20 to-orange-500/20", color: "text-amber-400" },
                    { label: "Expired", value: stats.expired, icon: XCircle, gradient: "from-red-500/20 to-rose-500/20", color: "text-red-400" },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className={`relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br ${stat.gradient} p-5 backdrop-blur-sm transition-transform hover:scale-[1.02]`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                        </div>
                        <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Affiliate Guide Panel */}
            {showGuide && (
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/5 via-card/80 to-blue-500/5 backdrop-blur-sm overflow-hidden animate-in slide-in-from-top-2 duration-300">
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2 rounded-xl bg-indigo-500/15">
                                <BookOpen className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">How to Get Affiliate Links</h3>
                                <p className="text-xs text-muted-foreground">Step-by-step guide to start earning commissions</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                {
                                    step: "1",
                                    title: "Find the Program",
                                    desc: "Go to the provider's website → scroll to the footer → look for \"Affiliates\" or \"Partners\" link. Most hosting/VPN companies have one.",
                                    color: "text-blue-400",
                                    bg: "bg-blue-500/10",
                                },
                                {
                                    step: "2",
                                    title: "Check Networks",
                                    desc: "Many programs run through networks like ShareASale, CJ Affiliate, Impact, or Awin. Search the provider name on these platforms.",
                                    color: "text-purple-400",
                                    bg: "bg-purple-500/10",
                                },
                                {
                                    step: "3",
                                    title: "Apply & Get Approved",
                                    desc: "Sign up, describe your site (comparison/review platform), and wait for approval. Most approve within 1-3 business days.",
                                    color: "text-amber-400",
                                    bg: "bg-amber-500/10",
                                },
                                {
                                    step: "4",
                                    title: "Generate Your Link",
                                    desc: "Once approved, go to the dashboard → \"Links\" or \"Creatives\" → generate a tracking URL. This is your affiliate link.",
                                    color: "text-emerald-400",
                                    bg: "bg-emerald-500/10",
                                },
                                {
                                    step: "5",
                                    title: "Add It Here",
                                    desc: "Click \"Add Partner\", paste the link, and set the commission rate and cookie duration from the program details page.",
                                    color: "text-cyan-400",
                                    bg: "bg-cyan-500/10",
                                },
                                {
                                    step: "6",
                                    title: "Verify & Monitor",
                                    desc: "Use \"Test Link\" to verify it redirects correctly. Check the network dashboard periodically for clicks and conversions.",
                                    color: "text-rose-400",
                                    bg: "bg-rose-500/10",
                                },
                            ].map((item) => (
                                <div key={item.step} className="flex gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center font-bold text-sm ${item.color}`}>
                                        {item.step}
                                    </div>
                                    <div>
                                        <p className={`text-sm font-semibold ${item.color} mb-1`}>{item.title}</p>
                                        <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/15 text-xs text-emerald-400">
                            <span className="font-semibold">💡 Pro tip:</span> Search Google for <span className="font-mono">"[provider name] affiliate program"</span> — it often leads directly to the sign-up page.
                        </div>
                    </div>
                </div>
            )}

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 md:w-72">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search providers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
                        {["all", "active", "paused", "expired"].map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s
                                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                    }`}
                            >
                                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
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
                        onClick={fetchAffiliates}
                        disabled={loading}
                        className="rounded-xl border-white/10 hover:bg-white/5"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                    <Button
                        size="sm"
                        onClick={openAddModal}
                        className="rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/25 font-semibold"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add Partner
                    </Button>
                </div>
            </div>

            {/* Affiliate Cards Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : affiliates.length === 0 ? (
                <GlassCard className="text-center py-16">
                    <LinkIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Affiliates Found</h3>
                    <p className="text-muted-foreground text-sm mb-6">
                        {search ? `No results for "${search}"` : "Start by adding your first affiliate partner"}
                    </p>
                    <Button onClick={openAddModal} className="rounded-xl">
                        <Plus className="w-4 h-4 mr-2" /> Add First Partner
                    </Button>
                </GlassCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {affiliates.map((aff) => {
                        const statusCfg = STATUS_CONFIG[aff.status] || STATUS_CONFIG.active;
                        const StatusIcon = statusCfg.icon;

                        return (
                            <div
                                key={aff.id}
                                className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-white/[0.12] hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5"
                            >
                                {/* Status Ribbon */}
                                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${aff.status === "active" ? "from-emerald-500 to-green-400" :
                                    aff.status === "paused" ? "from-amber-500 to-orange-400" :
                                        "from-red-500 to-rose-400"
                                    }`} />

                                <div className="p-5">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/10 border border-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                {aff.provider_name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-sm leading-tight">{aff.provider_name}</h3>
                                                {aff.network && (
                                                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{aff.network}</span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleToggleStatus(aff)}
                                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105 ${statusCfg.bg} ${statusCfg.color}`}
                                        >
                                            <StatusIcon className="w-3 h-3" />
                                            {statusCfg.label}
                                        </button>
                                    </div>

                                    {/* Link Preview */}
                                    <div className="relative mb-4">
                                        <div className="bg-black/30 rounded-xl p-3 pr-10 border border-white/5 group-hover:border-white/10 transition-colors">
                                            <code className="text-[11px] text-muted-foreground break-all font-mono leading-relaxed">
                                                {aff.affiliate_link || "No link configured"}
                                            </code>
                                        </div>
                                        {aff.affiliate_link && (
                                            <button
                                                onClick={() => handleCopy(aff.id, aff.affiliate_link!)}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                                title="Copy link"
                                            >
                                                {copiedId === aff.id ? (
                                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                ) : (
                                                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    {/* Meta Info */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {aff.commission_rate && (
                                            <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
                                                <BarChart3 className="w-3 h-3" /> {aff.commission_rate}
                                            </span>
                                        )}
                                        {aff.cookie_days && (
                                            <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/10">
                                                <Clock className="w-3 h-3" /> {aff.cookie_days}d cookie
                                            </span>
                                        )}
                                        {aff.last_verified_at && (
                                            <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg bg-white/5 text-muted-foreground border border-white/5">
                                                <CheckCircle className="w-3 h-3" /> Verified
                                            </span>
                                        )}
                                        {aff.expires_at && (
                                            <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg border ${new Date(aff.expires_at) < new Date()
                                                    ? "bg-red-500/10 text-red-400 border-red-500/10"
                                                    : "bg-indigo-500/10 text-indigo-400 border-indigo-500/10"
                                                }`}>
                                                <Clock className="w-3 h-3" />
                                                {new Date(aff.expires_at) < new Date()
                                                    ? "Expired"
                                                    : `Expires ${new Date(aff.expires_at).toLocaleDateString()}`
                                                }
                                            </span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-3 border-t border-white/5">
                                        <button
                                            onClick={() => openEditModal(aff)}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        {aff.affiliate_link && (
                                            <button
                                                onClick={() => handleTestLink(aff.affiliate_link!)}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" /> Test
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(aff.id)}
                                            disabled={deletingId === aff.id}
                                            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/5 text-xs font-medium text-red-400 hover:bg-red-500/15 transition-all disabled:opacity-50"
                                        >
                                            {deletingId === aff.id ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-3.5 h-3.5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <AffiliateFormModal
                    title={editingAffiliate ? "Edit Affiliate" : "Add Affiliate Partner"}
                    subtitle={editingAffiliate ? `Editing ${editingAffiliate.provider_name}` : "Configure a new affiliate link"}
                    initialData={modalInitialData}
                    providerLocked={!!editingAffiliate}
                    providerOptions={providerOptions}
                    showStatus
                    submitLabel={editingAffiliate ? "Save Changes" : "Add Partner"}
                    onSubmit={handleSave}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
}
