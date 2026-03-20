"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Globe, DollarSign, HardDrive, Zap, Server, ShieldCheck, Languages, Save, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { GeneralTab } from "./tabs/GeneralTab";
import { ContentTab } from "./tabs/ContentTab";
import { PricingTab } from "./tabs/PricingTab";
import { SpecsTab } from "./tabs/SpecsTab";
import { FeaturesTab } from "./tabs/FeaturesTab";
import { ScoresTab } from "./tabs/ScoresTab";

interface ProviderEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    provider: any;
    type: "hosting" | "vpn";
}

const TABS = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'content', label: 'Content (Review)', icon: Languages },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'specs', label: 'Technical Specs', icon: HardDrive },
    { id: 'features', label: 'Features', icon: CheckCircle },
    { id: 'scores', label: 'Scores', icon: Zap },
];

export function ProviderEditorModal({ isOpen, onClose, onSave, provider, type }: ProviderEditorModalProps) {
    const [activeTab, setActiveTab] = useState('general');
    const [formData, setFormData] = useState<any>({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (provider) {
            setFormData({ ...provider });
        } else {
            setFormData({
                provider_name: "",
                slug: "",
                website_url: "",
                provider_type: type === 'hosting' ? "Shared" : "VPN",
                pricing_monthly: 0,
                support_score: 70,
                support_quality_score: 70,
                raw_data: {
                    pros: [],
                    cons: [],
                    summary_en: "",
                    summary_es: "",
                    notes: ""
                },
                features: {},
                protocols: [],
                audits: [],
                php_versions: [],
                data_center_locations: []
            });
        }
    }, [provider, type]);

    const handleChange = (path: string, value: any) => {
        const newData = { ...formData };
        if (path.includes('.')) {
            const [parent, child] = path.split('.');
            if (!newData[parent]) newData[parent] = {};
            newData[parent][child] = value;
        } else {
            newData[path] = value;
        }
        setFormData(newData);
    };

    const handleSave = async () => {
        setSaving(true);
        const isNew = !formData.id;
        try {
            const res = await fetch("/api/admin/providers", {
                method: isNew ? "POST" : "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...(isNew ? {} : { id: formData.id }),
                    type,
                    ...formData
                })
            });

            if (!res.ok) {
                const text = await res.text();
                let errorMsg = "Failed to save";
                try {
                    const data = JSON.parse(text);
                    errorMsg = data.error || errorMsg;
                } catch (e) {
                    errorMsg = text || errorMsg;
                }
                throw new Error(errorMsg);
            }

            onSave();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-6xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8 pb-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                            {type === 'hosting' ? <Server size={24} /> : <ShieldCheck size={24} />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">
                                {provider ? `Edit ${provider.provider_name}` : `Add New ${type === 'hosting' ? 'Hosting' : 'VPN'}`}
                            </h2>
                            <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold text-[10px]">
                                Data Audit Mode: All Fields Enabled
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    <div className="w-64 border-r border-gray-100 bg-gray-50/50 p-6 space-y-2">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all",
                                    activeTab === tab.id 
                                        ? "bg-white shadow-lg shadow-gray-200/50 text-primary border border-gray-100" 
                                        : "text-muted-foreground hover:bg-gray-100"
                                )}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        {activeTab === 'general' && <GeneralTab formData={formData} handleChange={handleChange} type={type} />}
                        {activeTab === 'content' && <ContentTab formData={formData} handleChange={handleChange} type={type} />}
                        {activeTab === 'pricing' && <PricingTab formData={formData} handleChange={handleChange} type={type} />}
                        {activeTab === 'specs' && <SpecsTab formData={formData} handleChange={handleChange} type={type} />}
                        {activeTab === 'features' && <FeaturesTab formData={formData} handleChange={handleChange} type={type} />}
                        {activeTab === 'scores' && <ScoresTab formData={formData} handleChange={handleChange} type={type} />}
                    </div>
                </div>

                <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    {error ? (
                        <div className="text-red-500 text-sm flex items-center gap-2">
                            <AlertTriangle size={16} /> {error}
                        </div>
                    ) : (
                        <div className="text-xs text-muted-foreground italic">
                            All changes will reflect immediately after cache revalidation.
                        </div>
                    )}
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={onClose} disabled={saving} className="rounded-2xl px-8">
                            Cancel
                        </Button>
                        <Button 
                            className="rounded-2xl px-12 font-black shadow-lg shadow-primary/20 bg-primary"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
                            Save Provider
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
