import { CheckCircle, Pause, AlertTriangle, Clock, XCircle } from "lucide-react";

export const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; ribbon: string; label: string }> = {
    active: { 
        icon: CheckCircle, 
        color: "text-emerald-400", 
        bg: "bg-emerald-500/10 border-emerald-500/20", 
        ribbon: "from-emerald-500 to-green-400", 
        label: "Active" 
    },
    paused: { 
        icon: Pause, 
        color: "text-amber-400", 
        bg: "bg-amber-500/10 border-amber-500/20", 
        ribbon: "from-amber-500 to-orange-400", 
        label: "Paused" 
    },
    expired: { 
        icon: AlertTriangle, 
        color: "text-red-400", 
        bg: "bg-red-500/10 border-red-500/20", 
        ribbon: "from-red-500 to-rose-400", 
        label: "Expired" 
    },
    processing_approval: { 
        icon: Clock, 
        color: "text-blue-400", 
        bg: "bg-blue-500/10 border-blue-500/20", 
        ribbon: "from-blue-500 to-indigo-400", 
        label: "Processing" 
    },
    rejected: { 
        icon: XCircle, 
        color: "text-gray-400", 
        bg: "bg-gray-500/10 border-gray-500/20", 
        ribbon: "from-gray-500 to-slate-400", 
        label: "Rejected" 
    },
};

export interface AffiliatePartner {
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
    account_email?: string;
    account_password?: string;
    dashboard_url?: string;
    account_phone?: string;
    payment_method?: string;
    minimum_payout_amount?: number;
    minimum_payout_currency?: string;
    reminder_at?: string;
    reminder_note?: string;
    promo_code?: string;
    promo_discount?: string;
}

export interface AffiliateStats {
    total: number;
    active: number;
    paused: number;
    expired: number;
    processing: number;
    rejected: number;
}
