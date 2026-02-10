"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    X, Link as LinkIcon, CheckCircle, Loader2, AlertTriangle, Search
} from "lucide-react";

export interface AffiliateFormData {
    provider_name: string;
    affiliate_link: string;
    network: string;
    commission_rate: string;
    cookie_days: string;
    link_duration_days: string;
    status: string;
}

export const EMPTY_AFFILIATE_FORM: AffiliateFormData = {
    provider_name: "",
    affiliate_link: "",
    network: "",
    commission_rate: "",
    cookie_days: "",
    link_duration_days: "",
    status: "active",
};

export interface ProviderOption {
    name: string;
    type: "hosting" | "vpn";
}

const INPUT_CLASS = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all";

interface AffiliateFormModalProps {
    /** Modal title */
    title: string;
    /** Subtitle shown below title */
    subtitle: string;
    /** Initial form values */
    initialData: AffiliateFormData;
    /** Whether provider_name is locked (editing mode) */
    providerLocked?: boolean;
    /** List of real providers from DB for dropdown */
    providerOptions?: ProviderOption[];
    /** Show "Lost Revenue" warning banner */
    showWarning?: boolean;
    /** Provider name for the warning message */
    warningProvider?: string;
    /** Label for the submit button */
    submitLabel: string;
    /** Gradient class for the submit button */
    submitGradient?: string;
    /** Icon gradient for the header */
    headerGradient?: string;
    /** Icon color class */
    headerIconColor?: string;
    /** Whether to show the Status field */
    showStatus?: boolean;
    /** Called with form data on submit. Return a promise — modal handles loading/error */
    onSubmit: (data: AffiliateFormData) => Promise<void>;
    /** Called when modal is closed */
    onClose: () => void;
}

export function AffiliateFormModal({
    title,
    subtitle,
    initialData,
    providerLocked = false,
    providerOptions,
    showWarning = false,
    warningProvider,
    submitLabel,
    submitGradient = "from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-primary/25",
    headerGradient = "from-primary/20 to-blue-500/10",
    headerIconColor = "text-primary",
    showStatus = true,
    onSubmit,
    onClose,
}: AffiliateFormModalProps) {
    const [formData, setFormData] = useState<AffiliateFormData>(initialData);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [providerSearch, setProviderSearch] = useState("");
    const [showProviderDropdown, setShowProviderDropdown] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.provider_name.trim() || !formData.affiliate_link.trim()) {
            setError("Provider name and affiliate link are required");
            return;
        }

        try {
            new URL(formData.affiliate_link);
        } catch {
            setError("Please enter a valid URL (e.g. https://...)");
            return;
        }

        setSaving(true);
        try {
            await onSubmit(formData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setSaving(false);
        }
    };

    const update = (key: keyof AffiliateFormData, value: string) =>
        setFormData((f) => ({ ...f, [key]: value }));

    // Filter providers based on search
    const filteredProviders = providerOptions?.filter(p =>
        p.name.toLowerCase().includes(providerSearch.toLowerCase())
    ) || [];

    const hostingProviders = filteredProviders.filter(p => p.type === "hosting");
    const vpnProviders = filteredProviders.filter(p => p.type === "vpn");

    const showDropdown = !providerLocked && providerOptions && providerOptions.length > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md" onClick={onClose}>
            <div
                className="w-full max-w-lg mx-4 rounded-2xl border border-white/10 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/40 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${headerGradient}`}>
                            <LinkIcon className={`w-5 h-5 ${headerIconColor}`} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">{title}</h2>
                            <p className="text-xs text-muted-foreground">{subtitle}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Warning Banner */}
                {showWarning && warningProvider && (
                    <div className="mx-6 mt-5 flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/15">
                        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-semibold text-amber-400">Lost Revenue!</p>
                            <p className="text-muted-foreground">
                                Without this link, every visit to {warningProvider} is a lost commission.
                            </p>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-5">
                        {/* Provider Name — Dropdown or Locked Input */}
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                Provider *
                            </label>
                            {showDropdown ? (
                                <div className="relative">
                                    <div className="relative">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            value={formData.provider_name || providerSearch}
                                            onChange={(e) => {
                                                setProviderSearch(e.target.value);
                                                update("provider_name", "");
                                                setShowProviderDropdown(true);
                                            }}
                                            onFocus={() => setShowProviderDropdown(true)}
                                            placeholder="Search providers..."
                                            className={`${INPUT_CLASS} pl-10`}
                                            autoFocus
                                        />
                                        {formData.provider_name && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    update("provider_name", "");
                                                    setProviderSearch("");
                                                    setShowProviderDropdown(true);
                                                }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-white/10 transition-colors"
                                            >
                                                <X className="w-3.5 h-3.5 text-muted-foreground" />
                                            </button>
                                        )}
                                    </div>

                                    {showProviderDropdown && !formData.provider_name && (
                                        <div className="absolute z-10 w-full mt-1.5 max-h-56 overflow-y-auto rounded-xl bg-card border border-white/10 shadow-2xl shadow-black/40 backdrop-blur-xl">
                                            {hostingProviders.length > 0 && (
                                                <>
                                                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-white/5 bg-blue-500/5">
                                                        🌐 Hosting ({hostingProviders.length})
                                                    </div>
                                                    {hostingProviders.map((p) => (
                                                        <button
                                                            key={`h-${p.name}`}
                                                            type="button"
                                                            onClick={() => {
                                                                update("provider_name", p.name);
                                                                setProviderSearch("");
                                                                setShowProviderDropdown(false);
                                                            }}
                                                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors flex items-center gap-2"
                                                        >
                                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                                            {p.name}
                                                        </button>
                                                    ))}
                                                </>
                                            )}
                                            {vpnProviders.length > 0 && (
                                                <>
                                                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-white/5 bg-purple-500/5">
                                                        🔒 VPN ({vpnProviders.length})
                                                    </div>
                                                    {vpnProviders.map((p) => (
                                                        <button
                                                            key={`v-${p.name}`}
                                                            type="button"
                                                            onClick={() => {
                                                                update("provider_name", p.name);
                                                                setProviderSearch("");
                                                                setShowProviderDropdown(false);
                                                            }}
                                                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors flex items-center gap-2"
                                                        >
                                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                                            {p.name}
                                                        </button>
                                                    ))}
                                                </>
                                            )}
                                            {filteredProviders.length === 0 && (
                                                <div className="px-4 py-6 text-sm text-muted-foreground text-center">
                                                    No providers match &ldquo;{providerSearch}&rdquo;
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {formData.provider_name && (
                                        <p className="text-[10px] text-emerald-400 mt-1.5 flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" /> Selected: {formData.provider_name}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    value={formData.provider_name}
                                    onChange={(e) => update("provider_name", e.target.value)}
                                    placeholder="e.g. NordVPN, Bluehost"
                                    className={`${INPUT_CLASS} ${providerLocked ? "opacity-60 cursor-not-allowed" : ""}`}
                                    required
                                    disabled={providerLocked}
                                    autoFocus={providerLocked}
                                />
                            )}
                        </div>

                        {/* Affiliate Link */}
                        <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                Affiliate Link *
                            </label>
                            <input
                                type="url"
                                value={formData.affiliate_link}
                                onChange={(e) => update("affiliate_link", e.target.value)}
                                placeholder="https://affiliate-link.com/ref=123"
                                className={`${INPUT_CLASS} font-mono`}
                                required
                                autoFocus={providerLocked}
                            />
                        </div>

                        {/* Row: Network + Status/Commission */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                    Network
                                </label>
                                <select
                                    value={formData.network}
                                    onChange={(e) => update("network", e.target.value)}
                                    className={INPUT_CLASS}
                                >
                                    <option value="">Select...</option>
                                    <option value="ShareASale">ShareASale</option>
                                    <option value="CJ Affiliate">CJ Affiliate</option>
                                    <option value="Impact">Impact</option>
                                    <option value="Awin">Awin</option>
                                    <option value="Rakuten">Rakuten</option>
                                    <option value="FlexOffers">FlexOffers</option>
                                    <option value="Direct">Direct Program</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            {showStatus ? (
                                <div>
                                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => update("status", e.target.value)}
                                        className={INPUT_CLASS}
                                    >
                                        <option value="active">✅ Active</option>
                                        <option value="paused">⏸️ Paused</option>
                                        <option value="expired">❌ Expired</option>
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                        Commission Rate
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.commission_rate}
                                        onChange={(e) => update("commission_rate", e.target.value)}
                                        placeholder="e.g. 30%, $100/sale"
                                        className={INPUT_CLASS}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Row: Commission + Cookie Days */}
                        <div className="grid grid-cols-2 gap-4">
                            {showStatus && (
                                <div>
                                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                        Commission Rate
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.commission_rate}
                                        onChange={(e) => update("commission_rate", e.target.value)}
                                        placeholder="e.g. 30%, $100/sale"
                                        className={INPUT_CLASS}
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                    Cookie Duration (days)
                                </label>
                                <input
                                    type="number"
                                    value={formData.cookie_days}
                                    onChange={(e) => update("cookie_days", e.target.value)}
                                    placeholder="e.g. 30, 60, 90"
                                    className={INPUT_CLASS}
                                />
                            </div>
                        </div>

                        {/* Link Duration (days) */}
                        <div className="w-1/2">
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                Link Validity (days)
                            </label>
                            <input
                                type="number"
                                value={formData.link_duration_days}
                                onChange={(e) => update("link_duration_days", e.target.value)}
                                placeholder="e.g. 90, 180, 365"
                                className={INPUT_CLASS}
                            />
                            <p className="text-[10px] text-muted-foreground mt-1.5">
                                Auto-expires after this many days. Leave empty for no expiry.
                            </p>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mx-6 mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex gap-3 p-6 border-t border-white/5">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 rounded-xl border-white/10"
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className={`flex-1 rounded-xl bg-gradient-to-r ${submitGradient} shadow-lg font-semibold`}
                            disabled={saving || !formData.affiliate_link || !formData.provider_name}
                        >
                            {saving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    {submitLabel}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
