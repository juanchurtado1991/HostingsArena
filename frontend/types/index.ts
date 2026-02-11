/**
 * Shared TypeScript types for HostingArena
 */

// Used by ComparisonTable
export interface HostingProvider {
    provider_name: string;
    plan_name: string;
    provider_type?: string;
    website_url?: string;
    pricing_monthly: number | null;
    renewal_price: number | null;
    storage_gb: number | null;
    storage_type?: string;
    bandwidth?: string;
    ram_mb?: number;
    websites_allowed?: number | string;
    performance_grade?: string;
    support_score?: number;
    support_satisfaction_score?: number;
    free_ssl?: boolean;
    free_domain?: boolean;
    backup_included?: boolean;
    features?: Record<string, unknown>;
    raw_data?: Record<string, unknown>;
    last_updated?: string;
}

// Used by VPN pages
export interface VPNProvider {
    provider_name: string;
    website_url?: string;
    pricing_monthly: number | null;
    pricing_yearly: number | null;
    money_back_days?: number;
    avg_speed_mbps?: number;
    server_count?: number;
    features?: Record<string, unknown>;
    raw_data?: Record<string, unknown>;
    last_updated?: string;
}

// Used by lib/data.ts
export interface ProviderData {
    hosting: HostingProvider[];
    vpn: VPNProvider[];
}
