"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    X, Link as LinkIcon, CheckCircle, Loader2, AlertTriangle, Search,
    Mail, Lock, Eye, EyeOff, Copy, Check, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface AffiliateFormData {
    provider_name: string;
    affiliate_link: string;
    network: string;
    commission_rate: string;
    cookie_days: string;
    link_duration_days: string;
    status: string;
    account_email?: string;
    account_password?: string;
}

export const EMPTY_AFFILIATE_FORM: AffiliateFormData = {
    provider_name: "",
    affiliate_link: "",
    network: "",
    commission_rate: "",
    cookie_days: "",
    link_duration_days: "",
    status: "active",
    account_email: "",
    account_password: "",
};

export interface ProviderOption {
    name: string;
    type: "hosting" | "vpn";
}

const INPUT_CLASS = "w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-gray-400 shadow-sm";
const LABEL_CLASS = "block text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1 mb-1.5";

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
    headerGradient = "from-gray-100 to-gray-50",
    headerIconColor = "text-gray-900",
    showStatus = true,
    onSubmit,
    onClose,
}: AffiliateFormModalProps) {
    const [formData, setFormData] = useState<AffiliateFormData>({
        ...EMPTY_AFFILIATE_FORM,
        ...initialData
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [providerSearch, setProviderSearch] = useState("");
    const [showProviderDropdown, setShowProviderDropdown] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

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

    const handleCopy = (field: string, value?: string) => {
        if (!value) return;
        navigator.clipboard.writeText(value);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const filteredProviders = providerOptions?.filter(p =>
        p.name.toLowerCase().includes(providerSearch.toLowerCase())
    ) || [];

    const hostingProviders = filteredProviders.filter(p => p.type === "hosting");
    const vpnProviders = filteredProviders.filter(p => p.type === "vpn");

    const showDropdown = !providerLocked && providerOptions && providerOptions.length > 0;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-all"
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl overflow-visible border border-gray-100 flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-8 pb-6 border-b border-gray-100 bg-gray-50/50 rounded-t-3xl">
                    <div className="flex items-center gap-5">
                        <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${headerGradient} shadow-sm border border-white`}>
                            <LinkIcon className={`w-6 h-6 ${headerIconColor}`} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h2>
                            <p className="text-sm text-gray-500">{subtitle}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-full hover:bg-gray-200/50 text-gray-400 hover:text-gray-600 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Warning Banner */}
                <AnimatePresence>
                    {showWarning && warningProvider && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            className="px-8 pt-6"
                        >
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
                                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div className="text-[13px]">
                                    <p className="font-bold text-amber-700">Lost Revenue!</p>
                                    <p className="text-amber-600/80 leading-relaxed">
                                        Without this link, every visit to {warningProvider} is a lost commission.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Form Content - Scrollable if needed, but designed to not need it */}
                <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-12 gap-6">

                        {/* LEFT COLUMN: Main Info & Credentials */}
                        <div className="col-span-12 lg:col-span-6 space-y-6">
                            {/* Provider Selection */}
                            <div className="space-y-1.5">
                                <label className={LABEL_CLASS}>Provider *</label>
                                {showDropdown ? (
                                    <div className="relative z-50">
                                        <div className="relative group">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
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
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        <AnimatePresence>
                                            {showProviderDropdown && !formData.provider_name && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 4, scale: 0.98 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                                                    className="absolute left-0 right-0 mt-2 max-h-64 overflow-y-auto rounded-xl bg-white border border-gray-100 shadow-2xl p-1 z-[60]"
                                                >
                                                    {hostingProviders.length > 0 && (
                                                        <div className="mb-1">
                                                            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50/50 rounded-lg mb-1">
                                                                🌐 Hosting
                                                            </div>
                                                            {hostingProviders.map((p, i) => (
                                                                <button
                                                                    key={`h-${p.name}-${i}`}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        update("provider_name", p.name);
                                                                        setProviderSearch("");
                                                                        setShowProviderDropdown(false);
                                                                    }}
                                                                    className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2.5 active:bg-blue-100"
                                                                >
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                                    {p.name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {vpnProviders.length > 0 && (
                                                        <div>
                                                            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50/50 rounded-lg mb-1">
                                                                🔒 VPN
                                                            </div>
                                                            {vpnProviders.map((p, i) => (
                                                                <button
                                                                    key={`v-${p.name}-${i}`}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        update("provider_name", p.name);
                                                                        setProviderSearch("");
                                                                        setShowProviderDropdown(false);
                                                                    }}
                                                                    className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors flex items-center gap-2.5 active:bg-purple-100"
                                                                >
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                                                    {p.name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {filteredProviders.length === 0 && (
                                                        <div className="px-4 py-8 text-sm text-gray-400 text-center">
                                                            No providers found
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {formData.provider_name && (
                                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -bottom-6 left-1 text-[11px] text-emerald-600 font-medium flex items-center gap-1.5">
                                                <CheckCircle className="w-3.5 h-3.5" /> Confirmed
                                            </motion.p>
                                        )}
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        value={formData.provider_name}
                                        onChange={(e) => update("provider_name", e.target.value)}
                                        placeholder="e.g. NordVPN"
                                        className={`${INPUT_CLASS} ${providerLocked ? "bg-gray-50 text-gray-500 cursor-not-allowed border-gray-100" : ""}`}
                                        required
                                        disabled={providerLocked}
                                    />
                                )}
                            </div>

                            {/* Affiliate Link */}
                            <div className="space-y-1.5 pt-2">
                                <label className={LABEL_CLASS}>Affiliate Link *</label>
                                <div className="relative group">
                                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="url"
                                        value={formData.affiliate_link}
                                        onChange={(e) => update("affiliate_link", e.target.value)}
                                        placeholder="https://..."
                                        className={`${INPUT_CLASS} pl-10 font-mono text-[13px] bg-gray-50 focus:bg-white`}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Account Credentials Section */}
                            <div className="pt-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-1.5 rounded bg-blue-50">
                                        <ShieldCheck className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">Account Credentials</h3>
                                        <p className="text-[10px] text-gray-400 font-medium">For {formData.provider_name || "provider"} affiliate panel (Internal use only)</p>
                                    </div>
                                    <div className="flex-1 h-px bg-gray-100" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className={LABEL_CLASS}>Email / User</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="text"
                                                value={formData.account_email || ""}
                                                onChange={(e) => update("account_email", e.target.value)}
                                                placeholder="user@network.com"
                                                className={`${INPUT_CLASS} pl-9 pr-8 text-xs`}
                                            />
                                            {formData.account_email && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy("email", formData.account_email)}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 text-gray-400 active:scale-95 transition-colors"
                                                >
                                                    {copiedField === "email" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className={LABEL_CLASS}>Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={formData.account_password || ""}
                                                onChange={(e) => update("account_password", e.target.value)}
                                                placeholder="••••••••"
                                                className={`${INPUT_CLASS} pl-9 pr-14 text-xs`}
                                            />
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="p-1 rounded-md hover:bg-gray-100 text-gray-400 active:scale-95 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy("pass", formData.account_password)}
                                                    disabled={!formData.account_password}
                                                    className="p-1 rounded-md hover:bg-gray-100 text-gray-400 active:scale-95 disabled:opacity-50 transition-colors"
                                                >
                                                    {copiedField === "pass" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Configuration Details */}
                        <div className="col-span-12 lg:col-span-6 space-y-6 lg:pl-6 lg:border-l border-gray-100">
                            <div className="flex items-center gap-3 mb-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Program Details</h3>
                                <div className="flex-1 h-px bg-gray-100" />
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className={LABEL_CLASS}>Network</label>
                                    <select
                                        value={formData.network}
                                        onChange={(e) => update("network", e.target.value)}
                                        className={`${INPUT_CLASS} appearance-none cursor-pointer bg-white`}
                                    >
                                        <option value="">Direct</option>
                                        <option value="ShareASale">ShareASale</option>
                                        <option value="CJ Affiliate">CJ Affiliate</option>
                                        <option value="Impact">Impact</option>
                                        <option value="Awin">Awin</option>
                                        <option value="Direct">Direct</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className={LABEL_CLASS}>Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => update("status", e.target.value)}
                                        className={`${INPUT_CLASS} appearance-none cursor-pointer bg-white`}
                                    >
                                        <option value="active">Active</option>
                                        <option value="paused">Paused</option>
                                        <option value="expired">Expired</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className={LABEL_CLASS}>Commission</label>
                                    <input
                                        type="text"
                                        value={formData.commission_rate}
                                        onChange={(e) => update("commission_rate", e.target.value)}
                                        placeholder="e.g. 30%"
                                        className={INPUT_CLASS}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={LABEL_CLASS}>Cookie (days)</label>
                                    <input
                                        type="number"
                                        value={formData.cookie_days}
                                        onChange={(e) => update("cookie_days", e.target.value)}
                                        placeholder="30"
                                        className={INPUT_CLASS}
                                    />
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 mt-6">
                                <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Instructions</h4>
                                <ul className="text-xs text-gray-500 space-y-1.5 list-disc pl-4">
                                    <li>Ensure the <strong>Provider Name</strong> matches the one in our database exactly.</li>
                                    <li>Credentials are stored securely but <strong>visible to admins</strong> for quick access.</li>
                                    <li>Set <strong>Status</strong> to 'Active' to immediately enable the link.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer and Status */}
                <div className="px-8 mt-auto pb-6">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px] font-medium flex items-center gap-2"
                        >
                            <AlertTriangle className="w-4 h-4" />
                            {error}
                        </motion.div>
                    )}

                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="flex-1 rounded-xl h-12 text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all shadow-sm hover:shadow"
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className={`flex-[2] rounded-xl h-12 bg-gradient-to-r ${submitGradient} shadow-lg shadow-primary/20 font-bold active:scale-95 transition-all text-white`}
                            disabled={saving || !formData.affiliate_link || !formData.provider_name}
                        >
                            {saving ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    {submitLabel}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div >
    );
}
