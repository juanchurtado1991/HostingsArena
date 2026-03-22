import React from "react";
import { Copy, Check, Clock, BarChart3, ShieldCheck, Edit3, ExternalLink, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_CONFIG, type AffiliatePartner } from "./AffiliateConstants";

interface AffiliateCardProps {
    aff: AffiliatePartner;
    copiedId: string | null;
    deletingId: string | null;
    onCopy: (id: string, link: string) => void;
    onToggleStatus: (aff: AffiliatePartner) => void;
    onEdit: (aff: AffiliatePartner) => void;
    onDelete: (id: string) => void;
    onTest: (link: string) => void;
}

export function AffiliateCard({
    aff, copiedId, deletingId,
    onCopy, onToggleStatus, onEdit, onDelete, onTest
}: AffiliateCardProps) {
    const statusCfg = STATUS_CONFIG[aff.status] || STATUS_CONFIG.active;
    const StatusIcon = statusCfg.icon;

    return (
        <div className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-white/[0.12] hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5">
            <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", statusCfg.ribbon)} />

            <div className="p-5">
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
                        onClick={() => onToggleStatus(aff)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105 ${statusCfg.bg} ${statusCfg.color}`}
                    >
                        <StatusIcon className="w-3 h-3" />
                        {statusCfg.label}
                    </button>
                </div>

                <div className="relative mb-4">
                    <div className="bg-black/30 rounded-xl p-3 pr-10 border border-white/5 group-hover:border-white/10 transition-colors">
                        <code className="text-[11px] text-muted-foreground break-all font-mono leading-relaxed">
                            {aff.affiliate_link || "No link configured"}
                        </code>
                    </div>
                    {aff.affiliate_link && (
                        <button
                            onClick={() => onCopy(aff.id, aff.affiliate_link!)}
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

                {aff.reminder_at && (
                    <div className={`mb-4 flex items-start gap-2 p-2.5 rounded-xl border ${new Date(aff.reminder_at) <= new Date()
                        ? "bg-amber-500/10 border-amber-500/20"
                        : "bg-blue-500/5 border-blue-500/10"
                        }`}>
                        <Clock className={`w-4 h-4 mt-0.5 flex-shrink-0 ${new Date(aff.reminder_at) <= new Date() ? "text-amber-500" : "text-blue-400"
                            }`} />
                        <div>
                            <p className={`text-[11px] font-bold ${new Date(aff.reminder_at) <= new Date() ? "text-amber-500" : "text-blue-400"
                                }`}>
                                {new Date(aff.reminder_at) <= new Date()
                                    ? "Reminder Due"
                                    : `Reminder: ${new Date(aff.reminder_at).toLocaleDateString()}`}
                            </p>
                            {aff.reminder_note && (
                                <p className={`text-[10px] leading-relaxed ${new Date(aff.reminder_at) <= new Date() ? "text-amber-400/80" : "text-blue-400/70"
                                    }`}>
                                    {aff.reminder_note}
                                </p>
                            )}
                        </div>
                    </div>
                )}

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
                    {(aff.account_email || aff.account_password) && (
                        <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg bg-primary/10 text-primary border border-primary/10">
                            <ShieldCheck className="w-3 h-3" /> Credentials
                        </span>
                    )}
                    {aff.payment_method && (
                        <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/10">
                            {aff.payment_method}
                        </span>
                    )}
                    {aff.promo_code && (
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                            Code: {aff.promo_code} {aff.promo_discount && `(${aff.promo_discount}% off)`}
                        </span>
                    )}
                </div>

                <div className="flex gap-2 pt-3 border-t border-white/5">
                    <button
                        onClick={() => onEdit(aff)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all"
                    >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    {aff.affiliate_link && (
                        <button
                            onClick={() => onTest(aff.affiliate_link!)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all"
                        >
                            <ExternalLink className="w-3.5 h-3.5" /> Test
                        </button>
                    )}
                    <button
                        onClick={() => onDelete(aff.id)}
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
}
