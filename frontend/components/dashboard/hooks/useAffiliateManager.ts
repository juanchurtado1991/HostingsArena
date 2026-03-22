import { useState, useEffect, useCallback, useMemo } from "react";
import { type AffiliatePartner, type AffiliateStats } from "../affiliate-manager/AffiliateConstants";
import { EMPTY_AFFILIATE_FORM, type AffiliateFormData, type ProviderOption } from "../affiliate-modal/types";

export function useAffiliateManager() {
    const [affiliates, setAffiliates] = useState<AffiliatePartner[]>([]);
    const [stats, setStats] = useState<AffiliateStats>({ total: 0, active: 0, paused: 0, expired: 0, processing: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [networkFilter, setNetworkFilter] = useState("all");
    const [showModal, setShowModal] = useState(false);
    const [editingAffiliate, setEditingAffiliate] = useState<AffiliatePartner | null>(null);
    const [modalInitialData, setModalInitialData] = useState<AffiliateFormData>(EMPTY_AFFILIATE_FORM);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [showGuide, setShowGuide] = useState(false);
    const [allProviders, setAllProviders] = useState<ProviderOption[]>([]);

    useEffect(() => {
        const fetchProviders = async () => {
            try {
                const [hostingRes, vpnRes] = await Promise.all([
                    fetch("/api/providers?type=hosting"),
                    fetch("/api/providers?type=vpn"),
                ]);
                const hosting = await hostingRes.json();
                const vpn = await vpnRes.json();

                const uniqueMap = new Map<string, ProviderOption>();

                if (Array.isArray(hosting)) {
                    hosting.forEach((p: any) => {
                        if (!uniqueMap.has(p.provider_name)) {
                            uniqueMap.set(p.provider_name, { name: p.provider_name, type: "hosting" });
                        }
                    });
                }

                if (Array.isArray(vpn)) {
                    vpn.forEach((p: any) => {
                        if (!uniqueMap.has(p.provider_name)) {
                            uniqueMap.set(p.provider_name, { name: p.provider_name, type: "vpn" });
                        }
                    });
                }

                setAllProviders(Array.from(uniqueMap.values()));
            } catch (e) {
                console.error("Failed to fetch providers:", e);
            }
        };
        fetchProviders();
    }, []);

    const availableProviders = useMemo(() => {
        const usedNames = new Set(affiliates.map(a => a.provider_name));
        return allProviders.filter(p => !usedNames.has(p.name));
    }, [allProviders, affiliates]);

    const uniqueNetworks = useMemo(() => {
        const networks = new Set(affiliates.map(a => a.network).filter((n): n is string => !!n));
        return Array.from(networks).sort();
    }, [affiliates]);

    const fetchAffiliates = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            if (statusFilter !== "all") params.set("status", statusFilter);

            const res = await fetch(`/api/admin/affiliates?${params}`);
            const data = await res.json();

            if (data.affiliates) {
                let filtered = data.affiliates;
                if (networkFilter !== "all") {
                    filtered = filtered.filter((a: AffiliatePartner) => a.network === networkFilter);
                }
                setAffiliates(filtered);
            }
            if (data.stats) setStats(data.stats);
        } catch (e) {
            console.error("Failed to fetch affiliates:", e);
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter, networkFilter]);

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
            account_email: aff.account_email || "",
            account_password: aff.account_password || "",
            dashboard_url: aff.dashboard_url || "",
            account_phone: aff.account_phone || "",
            payment_method: aff.payment_method || "",
            minimum_payout_amount: aff.minimum_payout_amount ? String(aff.minimum_payout_amount) : "",
            minimum_payout_currency: aff.minimum_payout_currency || "USD",
            reminder_at: aff.reminder_at || "",
            reminder_note: aff.reminder_note || "",
            promo_code: aff.promo_code || "",
            promo_discount: aff.promo_discount || "",
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
        if (!confirm("Are you sure? This will remove the affiliate link and all CTAs will fall back to website_url.")) return;

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

    return {
        affiliates,
        stats,
        loading,
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        networkFilter,
        setNetworkFilter,
        showModal,
        setShowModal,
        editingAffiliate,
        modalInitialData,
        deletingId,
        copiedId,
        showGuide,
        setShowGuide,
        availableProviders,
        uniqueNetworks,
        fetchAffiliates,
        openAddModal,
        openEditModal,
        handleSave,
        handleDelete,
        handleToggleStatus,
        handleCopy,
        handleTestLink,
    };
}
