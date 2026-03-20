import { useState } from "react";
import { Search, X, Link as LinkIcon, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { INPUT_CLASS, LABEL_CLASS } from "../constants";
import { AffiliateFormData, ProviderOption } from "../types";

interface AffiliateBasicInfoProps {
    formData: AffiliateFormData;
    update: (key: keyof AffiliateFormData, value: string) => void;
    providerOptions?: ProviderOption[];
    providerLocked?: boolean;
}

export function AffiliateBasicInfo({ formData, update, providerOptions, providerLocked }: AffiliateBasicInfoProps) {
    const [providerSearch, setProviderSearch] = useState("");
    const [showProviderDropdown, setShowProviderDropdown] = useState(false);

    const filteredProviders = providerOptions?.filter(p =>
        p.name.toLowerCase().includes(providerSearch.toLowerCase())
    ) || [];

    const hostingProviders = filteredProviders.filter(p => p.type === "hosting");
    const vpnProviders = filteredProviders.filter(p => p.type === "vpn");

    const showDropdown = !providerLocked && providerOptions && providerOptions.length > 0;

    return (
        <div className="space-y-6">
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

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className={LABEL_CLASS}>Promo Code (Optional)</label>
                    <div className="relative group">
                        <input
                            type="text"
                            value={formData.promo_code || ""}
                            onChange={(e) => update("promo_code", e.target.value)}
                            className={`${INPUT_CLASS} text-xs`}
                            placeholder="e.g. HOSTING2026"
                        />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 ml-1">Displayed on Top 3 section.</p>
                </div>
                <div className="space-y-1.5">
                    <label className={LABEL_CLASS}>Discount % (Optional)</label>
                    <div className="relative group">
                        <input
                            type="text"
                            value={formData.promo_discount || ""}
                            onChange={(e) => update("promo_discount", e.target.value)}
                            className={`${INPUT_CLASS} text-xs`}
                            placeholder="e.g. 20"
                        />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 ml-1">Example: "20" (Get 20% off)</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className={LABEL_CLASS}>Dashboard URL</label>
                    <input
                        type="url"
                        value={formData.dashboard_url || ""}
                        onChange={(e) => update("dashboard_url", e.target.value)}
                        placeholder="https://partner..."
                        className={`${INPUT_CLASS} text-xs`}
                    />
                </div>
                <div className="space-y-1.5">
                    <label className={LABEL_CLASS}>Payment Method (Optional)</label>
                    <select
                        value={formData.payment_method || ""}
                        onChange={(e) => update("payment_method", e.target.value)}
                        className={`${INPUT_CLASS} appearance-none cursor-pointer text-xs`}
                    >
                        <option value="">Select Method...</option>
                        <option value="Paypal">Paypal</option>
                        <option value="Payoneer">Payoneer</option>
                        <option value="Wire Transfer">Wire Transfer</option>
                        <option value="ACH / Direct Deposit">ACH / Direct Deposit</option>
                        <option value="Check">Check</option>
                        <option value="Cryptocurrency">Cryptocurrency</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
