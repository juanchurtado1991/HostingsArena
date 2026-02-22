/**
 * Shared TypeScript types for HostingArena
 */

// Used by ComparisonTable and Editor
export interface HostingProvider {
    id?: string;
    provider_name: string;
    slug: string;
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
    wordpress_optimized?: boolean;
    free_migration?: boolean;
    features?: Record<string, any>;
    raw_data?: Record<string, any>;
    last_updated?: string;
    created_at?: string;
    // Enriched Specs
    web_server?: string;
    control_panel?: string;
    backup_frequency?: string;
    inodes?: string | number;
    max_processes?: string | number;
    php_versions?: string[];
    data_center_locations?: string[];
    uptime_guarantee?: number | string;
    setup_fee?: number;
    databases_allowed?: number | string;
}

// Used by VPN pages and Editor
export interface VPNProvider {
    id?: string;
    provider_name: string;
    slug: string;
    website_url?: string;
    pricing_monthly: number | null;
    pricing_yearly: number | null;
    pricing_2year?: number | null;
    pricing_3year?: number | null;
    renewal_price_monthly?: number | null;
    renewal_price_yearly?: number | null;
    money_back_days?: number;
    avg_speed_mbps?: number;
    server_count?: number;
    country_count?: number;
    city_count?: number;
    simultaneous_connections?: number;
    jurisdiction?: string;
    encryption_type?: string;
    protocols?: string[];
    has_kill_switch?: boolean;
    dns_leak_protection?: boolean;
    ipv6_leak_protection?: boolean;
    streaming_support?: boolean;
    features?: Record<string, any>;
    raw_data?: Record<string, any>;
    last_updated?: string;
    created_at?: string;
    support_quality_score?: number;
    audits?: string[];
}

// Used by lib/data.ts
export interface ProviderData {
    hosting: HostingProvider[];
    vpn: VPNProvider[];
}
