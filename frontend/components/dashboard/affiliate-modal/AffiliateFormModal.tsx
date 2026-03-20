"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Link as LinkIcon, CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { AffiliateFormData, EMPTY_AFFILIATE_FORM, ProviderOption } from "./types";
import { AffiliateBasicInfo } from "./sections/AffiliateBasicInfo";
import { AffiliateCommission } from "./sections/AffiliateCommission";
import { AffiliateAccount } from "./sections/AffiliateAccount";

export interface AffiliateFormModalProps {
    title: string;
    subtitle: string;
    initialData: AffiliateFormData;
    providerLocked?: boolean;
    providerOptions?: ProviderOption[];
    showWarning?: boolean;
    warningProvider?: string;
    submitLabel: string;
    submitGradient?: string;
    headerGradient?: string;
    headerIconColor?: string;
    showStatus?: boolean;
    onSubmit: (data: AffiliateFormData) => Promise<void>;
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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-all"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl overflow-visible border border-gray-100 flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
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

                <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-12 lg:col-span-7 space-y-6">
                            <AffiliateBasicInfo 
                                formData={formData} 
                                update={update} 
                                providerOptions={providerOptions} 
                                providerLocked={providerLocked} 
                            />
                            <AffiliateAccount formData={formData} update={update} />
                        </div>

                        {showStatus && (
                            <AffiliateCommission formData={formData} update={update} />
                        )}
                    </div>
                </form>

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
