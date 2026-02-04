export type VPNJurisdiction =
    | "5-eyes"
    | "9-eyes"
    | "14-eyes"
    | "privacy-friendly"
    | "unknown";

export type EncryptionType =
    | "AES-256-GCM"
    | "AES-256-CBC"
    | "ChaCha20"
    | "AES-128"
    | "unknown";

export interface VPNProvider {
    provider_name: string;
    website_url: string;
    last_updated: string;
    pricing_monthly: number;
    pricing_yearly: number;
    pricing_2year?: number | null;
    pricing_3year?: number | null;
    money_back_days: number;
    free_trial_days?: number;
    renewal_price_monthly?: number | null;
    price_increase_percentage?: number | null;
    promotional_period_months?: number | null;
    server_count: number;
    country_count: number;
    city_count?: number | null;
    simultaneous_connections: number;
    server_locations_detailed?: string[];
    avg_speed_mbps?: number | null;
    avg_latency_ms?: number | null;
    speed_test_results?: Record<string, number>;
    connection_drop_rate_percentage?: number | null;
    protocols: string[];
    encryption_type: EncryptionType;
    has_kill_switch: boolean;
    logging_policy: string;
    jurisdiction: VPNJurisdiction;
    jurisdiction_country?: string;
    third_party_audited: boolean;
    audit_company?: string;
    audit_year?: number;
    split_tunneling: boolean;
    obfuscation_stealth: boolean;
    multi_hop_double_vpn: boolean;
    ad_blocker_included: boolean;
    dedicated_ip_available: boolean;
    streaming_services: string[];
    netflix_regions_working?: string[];
    p2p_servers?: string;
    platforms: string[];
    support_channels: string[];
    support_24_7: boolean;
    support_quality_score?: number | null;
}

export interface HostingProvider {
    provider_name: string;
    provider_type: string;
    plan_name: string;
    website_url: string;
    last_updated: string;
    pricing_monthly: number;
    pricing_yearly?: number | null;
    renewal_price?: number | null;
    renewal_increase_percentage?: number | null;
    money_back_days: number;
    domain_renewal_price_yearly?: number | null;
    ssl_premium_cost?: number | null;
    performance_grade?: string | null;
    websites_allowed?: string | null;
    storage_gb?: number | null;
    storage_type: string;
    bandwidth: string;
    ram_mb?: number | null;
    cpu_cores?: number | null;
    inodes?: number | null;
    max_processes?: number | null;
    web_server: string;
    php_versions: string[];
    caching_type?: string | null;
    free_ssl: boolean;
    free_domain: boolean;
    free_migration: boolean;
    backup_included: boolean;
    backup_frequency?: string;
    email_accounts?: string;
    support_channels: string[];
    support_satisfaction_score?: number | null;
    uptime_guarantee?: number | null;
    actual_uptime_last_30_days?: number | null;

    raw_data?: {
        server_response_time_ms?: number;
        page_load_time_ms?: number;
        load_balancer_available?: boolean;
        auto_scaling?: boolean;
        wordpress_install_time_seconds?: number;
        wordpress_optimized?: boolean;
        wordpress_auto_updates?: boolean;
        wordpress_staging_sites_included?: boolean;
        wordpress_max_plugins?: number;
        wp_cli?: boolean;
        git_integration?: boolean;
        ssh_access?: boolean;
        cron_jobs?: boolean;
        node_js_support?: boolean;
        python_support?: boolean;
        ruby_support?: boolean;
        database_types?: string[];
        mysql_version?: string;
        postgresql_version?: string;
        ddos_protection?: boolean;
        waf_firewall?: boolean;
        malware_scanning?: boolean;
        auto_malware_removal?: boolean;
        spam_protection?: boolean;
        two_factor_auth_supported?: boolean;
        email_storage_gb?: number;
        email_send_limit_per_hour?: number;
        subdomains_allowed?: number | string;
        parked_domains?: number | string;
        support_response_time?: string;
        support_wait_time_actual_minutes?: number;
        support_hours?: string;
        dedicate_support_agent?: boolean;
        [key: string]: any; 
    };
}

export interface ProviderData {
    collection_timestamp: string;
    vpn_providers: VPNProvider[];
    hosting_providers: HostingProvider[];
    summary: any;
}
