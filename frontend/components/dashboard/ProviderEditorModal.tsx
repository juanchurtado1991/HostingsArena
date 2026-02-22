"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Globe, DollarSign, HardDrive, Zap, CheckCircle2, Server, ShieldCheck, Languages, Save, Loader2, AlertTriangle, CheckCircle, Smartphone, Monitor, Key, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    { id: 'features', label: 'Features', icon: CheckCircle2 },
    { id: 'scores', label: 'Scores', icon: Zap },
];

const INPUT_CLASS = "w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all";
const LABEL_CLASS = "block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 ml-1";
const TOGGLE_CARD_CLASS = "flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:border-primary/30 transition-all cursor-pointer";

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
                {/* Header */}
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
                    {/* Sidebar Tabs */}
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

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        {activeTab === 'general' && (
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2 md:col-span-1">
                                    <label className={LABEL_CLASS}>Provider Name</label>
                                    <input
                                        className={INPUT_CLASS}
                                        value={formData.provider_name || ""}
                                        onChange={(e) => handleChange('provider_name', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className={LABEL_CLASS}>Slug (URL)</label>
                                    <input
                                        className={INPUT_CLASS}
                                        value={formData.slug || ""}
                                        onChange={(e) => handleChange('slug', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className={LABEL_CLASS}>Website URL (Affiliate Target)</label>
                                    <input
                                        className={INPUT_CLASS}
                                        value={formData.website_url || ""}
                                        onChange={(e) => handleChange('website_url', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className={LABEL_CLASS}>Provider Type</label>
                                    <select 
                                        className={INPUT_CLASS} 
                                        value={formData.provider_type || ""} 
                                        onChange={(e) => handleChange('provider_type', e.target.value)}
                                    >
                                        {type === 'hosting' ? (
                                            <>
                                                <option value="Shared">Shared Hosting</option>
                                                <option value="VPS">VPS Hosting</option>
                                                <option value="Dedicated">Dedicated Server</option>
                                                <option value="Cloud">Cloud Hosting</option>
                                            </>
                                        ) : (
                                            <option value="VPN">VPN Service</option>
                                        )}
                                    </select>
                                </div>
                                {type === 'hosting' && (
                                    <div className="col-span-2 md:col-span-1">
                                        <label className={LABEL_CLASS}>Plan Name</label>
                                        <input
                                            className={INPUT_CLASS}
                                            value={formData.plan_name || ""}
                                            onChange={(e) => handleChange('plan_name', e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'content' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className={LABEL_CLASS}>Summary (English)</label>
                                        <textarea
                                            className={cn(INPUT_CLASS, "min-h-[120px] resize-none")}
                                            value={formData.raw_data?.summary_en || ""}
                                            onChange={(e) => handleChange('raw_data.summary_en', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className={LABEL_CLASS}>Summary (Spanish)</label>
                                        <textarea
                                            className={cn(INPUT_CLASS, "min-h-[120px] resize-none")}
                                            value={formData.raw_data?.summary_es || ""}
                                            onChange={(e) => handleChange('raw_data.summary_es', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={LABEL_CLASS}>Editor Notes / Quick Verdict</label>
                                    <textarea
                                        className={cn(INPUT_CLASS, "min-h-[80px] resize-none italic")}
                                        placeholder="Small excerpt used in detail pages..."
                                        value={formData.raw_data?.notes || ""}
                                        onChange={(e) => handleChange('raw_data.notes', e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className={LABEL_CLASS}>Pros (One per line)</label>
                                        <textarea
                                            className={cn(INPUT_CLASS, "min-h-[120px] resize-none font-mono text-xs")}
                                            value={formData.raw_data?.pros?.join('\n') || ""}
                                            onChange={(e) => handleChange('raw_data.pros', e.target.value.split('\n'))}
                                        />
                                    </div>
                                    <div>
                                        <label className={LABEL_CLASS}>Cons (One per line)</label>
                                        <textarea
                                            className={cn(INPUT_CLASS, "min-h-[120px] resize-none font-mono text-xs")}
                                            value={formData.raw_data?.cons?.join('\n') || ""}
                                            onChange={(e) => handleChange('raw_data.cons', e.target.value.split('\n'))}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'pricing' && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-3 gap-6">
                                    <div>
                                        <label className={LABEL_CLASS}>Monthly Intro ($)</label>
                                        <input type="number" step="0.01" className={INPUT_CLASS} value={formData.pricing_monthly || ""} onChange={(e) => handleChange('pricing_monthly', parseFloat(e.target.value))} />
                                    </div>
                                    <div>
                                        <label className={LABEL_CLASS}>Renewal Price ($)</label>
                                        <input type="number" step="0.01" className={INPUT_CLASS} value={formData.renewal_price || formData.renewal_price_monthly || ""} onChange={(e) => handleChange(type === 'hosting' ? 'renewal_price' : 'renewal_price_monthly', parseFloat(e.target.value))} />
                                    </div>
                                    <div>
                                        <label className={LABEL_CLASS}>Setup Fee ($)</label>
                                        <input type="number" step="0.01" className={INPUT_CLASS} value={formData.setup_fee || 0} onChange={(e) => handleChange('setup_fee', parseFloat(e.target.value))} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-4">
                                    <div>
                                        <label className={LABEL_CLASS}>Yearly Total ($)</label>
                                        <input type="number" step="0.01" className={INPUT_CLASS} value={formData.pricing_yearly || ""} onChange={(e) => handleChange('pricing_yearly', parseFloat(e.target.value))} />
                                    </div>
                                    <div>
                                        <label className={LABEL_CLASS}>2-Year Total ($)</label>
                                        <input type="number" step="0.01" className={INPUT_CLASS} value={formData.pricing_2year || ""} onChange={(e) => handleChange('pricing_2year', parseFloat(e.target.value))} />
                                    </div>
                                    <div>
                                        <label className={LABEL_CLASS}>3-Year Total ($)</label>
                                        <input type="number" step="0.01" className={INPUT_CLASS} value={formData.pricing_3year || ""} onChange={(e) => handleChange('pricing_3year', parseFloat(e.target.value))} />
                                    </div>
                                    <div>
                                        <label className={LABEL_CLASS}>Refund Guarantee (Days)</label>
                                        <input type="number" className={INPUT_CLASS} value={formData.money_back_days || ""} onChange={(e) => handleChange('money_back_days', parseInt(e.target.value))} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'specs' && (
                            <div className="grid grid-cols-2 gap-6">
                                {type === 'hosting' ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-4 col-span-2">
                                            <div>
                                                <label className={LABEL_CLASS}>Storage (GB)</label>
                                                <input type="number" className={INPUT_CLASS} value={formData.storage_gb || ""} onChange={(e) => handleChange('storage_gb', parseInt(e.target.value))} />
                                            </div>
                                            <div>
                                                <label className={LABEL_CLASS}>Storage Type</label>
                                                <select className={INPUT_CLASS} value={formData.storage_type || ""} onChange={(e) => handleChange('storage_type', e.target.value)}>
                                                    <option value="SSD">SATA SSD</option>
                                                    <option value="NVMe">NVMe SSD</option>
                                                    <option value="HDD">HDD</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className={LABEL_CLASS}>Web Server</label>
                                            <input className={INPUT_CLASS} value={formData.web_server || ""} placeholder="LiteSpeed, NGINX, Apache..." onChange={(e) => handleChange('web_server', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={LABEL_CLASS}>Control Panel</label>
                                            <input className={INPUT_CLASS} value={formData.control_panel || ""} placeholder="cPanel, hPanel, Plesk..." onChange={(e) => handleChange('control_panel', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={LABEL_CLASS}>Inode Limit</label>
                                            <input type="number" className={INPUT_CLASS} value={formData.inodes || ""} onChange={(e) => handleChange('inodes', parseInt(e.target.value))} />
                                        </div>
                                        <div>
                                            <label className={LABEL_CLASS}>Uptime Guarantee (%)</label>
                                            <input className={INPUT_CLASS} value={formData.uptime_guarantee || ""} placeholder="99.9%" onChange={(e) => handleChange('uptime_guarantee', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={LABEL_CLASS}>PHP Versions (comma separated)</label>
                                            <input className={INPUT_CLASS} value={formData.php_versions?.join(', ') || ""} onChange={(e) => handleChange('php_versions', e.target.value.split(',').map(s => s.trim()))} />
                                        </div>
                                        <div>
                                            <label className={LABEL_CLASS}>Databases Allowed</label>
                                            <input className={INPUT_CLASS} value={formData.databases_allowed || ""} onChange={(e) => handleChange('databases_allowed', e.target.value)} />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <label className={LABEL_CLASS}>Avg Speed (Mbps)</label>
                                            <input type="number" className={INPUT_CLASS} value={formData.avg_speed_mbps || ""} onChange={(e) => handleChange('avg_speed_mbps', parseInt(e.target.value))} />
                                        </div>
                                        <div>
                                            <label className={LABEL_CLASS}>Server Count</label>
                                            <input type="number" className={INPUT_CLASS} value={formData.server_count || ""} onChange={(e) => handleChange('server_count', parseInt(e.target.value))} />
                                        </div>
                                        <div>
                                            <label className={LABEL_CLASS}>Country Count</label>
                                            <input type="number" className={INPUT_CLASS} value={formData.country_count || ""} onChange={(e) => handleChange('country_count', parseInt(e.target.value))} />
                                        </div>
                                        <div>
                                            <label className={LABEL_CLASS}>City Count</label>
                                            <input type="number" className={INPUT_CLASS} value={formData.city_count || ""} onChange={(e) => handleChange('city_count', parseInt(e.target.value))} />
                                        </div>
                                        <div>
                                            <label className={LABEL_CLASS}>Encryption Type</label>
                                            <input className={INPUT_CLASS} value={formData.encryption_type || ""} placeholder="AES-256-GCM" onChange={(e) => handleChange('encryption_type', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={LABEL_CLASS}>Jurisdiction</label>
                                            <input className={INPUT_CLASS} value={formData.jurisdiction || ""} placeholder="Panama, BVI, Switzerland..." onChange={(e) => handleChange('jurisdiction', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={LABEL_CLASS}>Protocols (comma separated)</label>
                                            <input className={INPUT_CLASS} value={formData.protocols?.join(', ') || ""} onChange={(e) => handleChange('protocols', e.target.value.split(',').map(s => s.trim()))} />
                                        </div>
                                        <div>
                                            <label className={LABEL_CLASS}>Audits (comma separated)</label>
                                            <input className={INPUT_CLASS} value={formData.audits?.join(', ') || ""} onChange={(e) => handleChange('audits', e.target.value.split(',').map(s => s.trim()))} />
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {activeTab === 'features' && (
                            <div className="grid grid-cols-2 gap-4">
                                {type === 'hosting' ? (
                                    <>
                                        {[
                                            { id: 'free_ssl', label: 'Free SSL Certificate' },
                                            { id: 'free_domain', label: 'Free Domain Name' },
                                            { id: 'backup_included', label: 'Backups Included' },
                                            { id: 'wordpress_optimized', label: 'WordPress Optimized' },
                                            { id: 'free_migration', label: 'Free Migration' },
                                        ].map(f => (
                                            <div 
                                                key={f.id} 
                                                className={cn(TOGGLE_CARD_CLASS, formData[f.id] && "bg-primary/5 border-primary/20")}
                                                onClick={() => handleChange(f.id, !formData[f.id])}
                                            >
                                                <span className="text-sm font-bold">{f.label}</span>
                                                <div className={cn(
                                                    "w-10 h-5 rounded-full transition-all relative",
                                                    formData[f.id] ? "bg-primary" : "bg-gray-200"
                                                )}>
                                                    <div className={cn(
                                                        "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                                                        formData[f.id] ? "left-6" : "left-1"
                                                    )} />
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <>
                                        {[
                                            { id: 'has_kill_switch', label: 'Automatic Kill Switch' },
                                            { id: 'dns_leak_protection', label: 'DNS Leak Protection' },
                                            { id: 'ipv6_leak_protection', label: 'IPv6 Leak Protection' },
                                            { id: 'streaming_support', label: 'Streaming Support (Netflix/etc)' },
                                        ].map(f => (
                                            <div 
                                                key={f.id} 
                                                className={cn(TOGGLE_CARD_CLASS, formData[f.id] && "bg-blue-500/5 border-blue-500/20")}
                                                onClick={() => handleChange(f.id, !formData[f.id])}
                                            >
                                                <span className="text-sm font-bold">{f.label}</span>
                                                <div className={cn(
                                                    "w-10 h-5 rounded-full transition-all relative",
                                                    formData[f.id] ? "bg-blue-500" : "bg-gray-200"
                                                )}>
                                                    <div className={cn(
                                                        "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                                                        formData[f.id] ? "left-6" : "left-1"
                                                    )} />
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}

                        {activeTab === 'scores' && (
                            <div className="grid grid-cols-2 gap-8">
                                <div className="col-span-2 bg-primary/5 p-6 rounded-3xl border border-primary/10">
                                    <label className={cn(LABEL_CLASS, "text-primary text-xs mb-3")}>
                                        {type === 'hosting' ? 'Support Score' : 'Support Quality Score'} (0-100)
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="1"
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                                        value={(type === 'hosting' ? formData.support_score : formData.support_quality_score) || 0}
                                        onChange={(e) => handleChange(type === 'hosting' ? 'support_score' : 'support_quality_score', parseInt(e.target.value))}
                                    />
                                    <div className="flex justify-between mt-2 font-black text-2xl text-primary">
                                        <span>{(type === 'hosting' ? formData.support_score : formData.support_quality_score) || 0}%</span>
                                        <span className="text-sm uppercase tracking-widest mt-2">
                                            {((type === 'hosting' ? formData.support_score : formData.support_quality_score) || 0) >= 90 ? 'Elite' : 
                                             ((type === 'hosting' ? formData.support_score : formData.support_quality_score) || 0) >= 80 ? 'Excellent' : 'Average'}
                                        </span>
                                    </div>
                                </div>
                                {type === 'hosting' && (
                                    <div>
                                        <label className={LABEL_CLASS}>Performance Grade (A-F)</label>
                                        <select className={INPUT_CLASS} value={formData.performance_grade || ""} onChange={(e) => handleChange('performance_grade', e.target.value)}>
                                            {['A+', 'A', 'B+', 'B', 'C', 'D', 'F'].map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className={LABEL_CLASS}>Manual Entry (%)</label>
                                    <input 
                                        type="number" 
                                        className={INPUT_CLASS} 
                                        value={(type === 'hosting' ? formData.support_score : formData.support_quality_score) || ""} 
                                        onChange={(e) => handleChange(type === 'hosting' ? 'support_score' : 'support_quality_score', parseInt(e.target.value))} 
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
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
