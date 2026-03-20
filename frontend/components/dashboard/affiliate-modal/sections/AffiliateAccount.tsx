import { useState } from "react";
import { Copy, Check, Lock, Eye, EyeOff, ShieldCheck, Mail } from "lucide-react";
import { INPUT_CLASS, LABEL_CLASS } from "../constants";
import { AffiliateSectionProps } from "../types";

export function AffiliateAccount({ formData, update }: AffiliateSectionProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleCopy = (field: string, value?: string) => {
        if (!value) return;
        navigator.clipboard.writeText(value);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    return (
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
                <div className="space-y-1.5 col-span-2">
                    <label className={LABEL_CLASS}>Phone (Optional)</label>
                    <input
                        type="text"
                        value={formData.account_phone || ""}
                        onChange={(e) => update("account_phone", e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className={`${INPUT_CLASS} text-xs`}
                    />
                </div>
            </div>
        </div>
    );
}
