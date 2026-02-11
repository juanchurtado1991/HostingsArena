"""COMPLETE data models with ALL critical fields for differentiating comparisons"""
from pydantic import BaseModel, HttpUrl, Field
from typing import List, Optional, Dict
from datetime import datetime, date
from enum import Enum


# Enums
class VPNJurisdiction(str, Enum):
    FIVE_EYES = "5-eyes"
    NINE_EYES = "9-eyes"
    FOURTEEN_EYES = "14-eyes"
    PRIVACY_FRIENDLY = "privacy-friendly"
    UNKNOWN = "unknown"


class EncryptionType(str, Enum):
    AES_256_GCM = "AES-256-GCM"
    AES_256_CBC = "AES-256-CBC"
    CHACHA20 = "ChaCha20"
    AES_128 = "AES-128"
    UNKNOWN = "unknown"


class StorageType(str, Enum):
    NVME_SSD = "NVMe SSD"
    SSD = "SSD"
    HDD = "HDD"
    HYBRID = "Hybrid"
    UNKNOWN = "unknown"


class WebServer(str, Enum):
    LITESPEED = "LiteSpeed"
    APACHE = "Apache"
    NGINX = "Nginx"
    OPENLITESPEED = "OpenLiteSpeed"
    UNKNOWN = "unknown"


class VPNProvider(BaseModel):
    """Complete VPN Provider model with ALL critical differentiating data"""
    
    # Basic Info
    provider_name: str
    website_url: str
    last_updated: datetime = Field(default_factory=datetime.now)
    
    # ===== PRICING & TRUE COST =====
    pricing_monthly: Optional[float] = Field(default=None, ge=0)
    pricing_yearly: Optional[float] = Field(default=None, ge=0)
    pricing_2year: Optional[float] = Field(default=None, ge=0)
    pricing_3year: Optional[float] = Field(default=None, ge=0)
    money_back_days: Optional[int] = Field(default=None, ge=0)
    free_trial_days: Optional[int] = Field(default=0, ge=0)
    
    # 🔥 CRITICAL: Renewal pricing (for True Cost Calculator)
    renewal_price_monthly: Optional[float] = Field(default=None, ge=0)
    renewal_price_yearly: Optional[float] = Field(default=None, ge=0)
    price_increase_percentage: Optional[float] = Field(default=None, ge=0)  # % increase
    promotional_period_months: Optional[int] = Field(default=None, ge=0)  # How long promo lasts
    
    # Money-back restrictions
    money_back_restrictions: Optional[str] = None  # "Must use < 10GB bandwidth"
    refund_processing_days: Optional[int] = Field(default=None, ge=0)
    
    # ===== NETWORK INFRASTRUCTURE =====
    server_count: Optional[int] = Field(default=None, ge=0)
    country_count: Optional[int] = Field(default=None, ge=0)
    city_count: Optional[int] = Field(default=None, ge=0)
    simultaneous_connections: Optional[int] = Field(default=None, ge=0)  # 999 = unlimited
    
    # 🔥 CRITICAL: Server details for quality assessment
    server_locations_detailed: List[str] = []  # ["New York, US", "London, UK"]
    server_load_percentage: Optional[float] = Field(default=None, ge=0, le=100)
    virtual_servers_percentage: Optional[float] = Field(default=None, ge=0, le=100)  # % virtual vs physical
    
    # ===== PERFORMANCE (CRITICAL for Speed comparisons) =====
    avg_speed_mbps: Optional[float] = Field(default=None, ge=0)
    avg_latency_ms: Optional[int] = Field(default=None, ge=0)
    bandwidth_limit: Optional[str] = Field(default="unlimited")
    
    # 🔥 CRITICAL: Real performance data
    speed_test_results: Optional[Dict[str, float]] = None  # {"US-East": 850, "EU-West": 720}
    speed_test_date: Optional[date] = None
    actual_speed_tests_performed: bool = False
    connection_drop_rate_percentage: Optional[float] = Field(default=None, ge=0, le=100)
    
    # ===== SECURITY & ENCRYPTION =====
    protocols: List[str] = []
    encryption_type: EncryptionType = EncryptionType.UNKNOWN
    has_kill_switch: bool = False
    dns_leak_protection: bool = True
    ipv6_leak_protection: bool = True
    webrtc_leak_protection: bool = True
    
    # ===== PRIVACY (CRITICAL for Privacy Score) =====
    logging_policy: Optional[str] = None
    jurisdiction: VPNJurisdiction = VPNJurisdiction.UNKNOWN
    jurisdiction_country: Optional[str] = None
    has_warrant_canary: bool = False
    
    # 🔥 CRITICAL: Audit & transparency
    third_party_audited: bool = False
    audit_company: Optional[str] = None
    audit_year: Optional[int] = None
    audit_frequency_months: Optional[int] = None  # How often they audit
    
    # 🔥 CRITICAL: Transparency data
    data_requests_disclosed: Optional[int] = None  # # of government requests
    data_requests_complied: Optional[int] = None  # # they complied with
    last_transparency_report_date: Optional[date] = None
    publishes_transparency_reports: bool = False
    
    # ===== FEATURES =====
    split_tunneling: bool = False
    obfuscation_stealth: bool = False
    multi_hop_double_vpn: bool = False
    tor_over_vpn: bool = False
    dedicated_ip_available: bool = False
    dedicated_ip_price: Optional[float] = Field(default=None, ge=0)
    port_forwarding: bool = False
    ad_blocker_included: bool = False
    malware_protection: bool = False
    
    # ===== STREAMING & P2P (CRITICAL for Streaming Matrix) =====
    streaming_support: bool = False
    streaming_services: List[str] = []  # ["Netflix US", "BBC iPlayer"]
    
    # 🔥 CRITICAL: Detailed streaming info
    netflix_regions_working: List[str] = []  # ["US", "UK", "JP", "CA"]
    streaming_quality_max: Optional[str] = None  # "4K", "HD", "SD"
    streaming_buffering_issues: bool = False
    streaming_last_tested: Optional[date] = None
    
    torrenting_allowed: bool = False
    p2p_servers: Optional[str] = Field(default="all")  # "all", "dedicated", "none"
    p2p_unlimited: bool = True
    
    # ===== PLATFORM SUPPORT =====
    platforms: List[str] = []
    browser_extensions: List[str] = []
    smart_tv_support: bool = False
    router_support: bool = False
    router_app_available: bool = False  # Dedicated router app vs manual config
    
    # ===== PAYMENT & SUPPORT =====
    payment_methods: List[str] = []
    accepts_crypto: bool = False
    crypto_types_accepted: List[str] = []  # ["Bitcoin", "Ethereum", "Monero"]
    
    # 🔥 CRITICAL: Support quality
    support_channels: List[str] = []
    support_languages: int = 1
    support_24_7: bool = False
    support_response_time_avg_minutes: Optional[int] = None  # Real measured time
    support_quality_score: Optional[float] = Field(default=None, ge=0, le=5)  # User ratings
    
    # ===== RELIABILITY (CRITICAL) =====
    uptime_percentage: Optional[float] = Field(default=None, ge=0, le=100)
    uptime_last_30_days: Optional[float] = Field(default=None, ge=0, le=100)
    downtime_incidents_last_year: Optional[int] = None
    
    # ===== ADDITIONAL =====
    data_center_locations: List[str] = []
    custom_dns: bool = False
    ipv6_support: bool = False
    wireguard_support: bool = False
    
    class Config:
        use_enum_values = True


class HostingProvider(BaseModel):
    """Complete Hosting Provider model with ALL critical differentiating data"""
    
    # Basic Info
    provider_name: str
    provider_type: str
    plan_name: str
    website_url: str
    last_updated: datetime = Field(default_factory=datetime.now)
    
    # ===== PRICING & TRUE COST (CRITICAL) =====
    pricing_monthly: float = Field(ge=0)
    pricing_yearly: Optional[float] = Field(default=None, ge=0)
    pricing_3year: Optional[float] = Field(default=None, ge=0)
    setup_fee: float = Field(default=0.0, ge=0)
    money_back_days: Optional[int] = Field(default=None, ge=0)
    
    # 🔥 CRITICAL: Hidden costs & renewal
    renewal_price: Optional[float] = Field(default=None, ge=0)
    renewal_price_yearly: Optional[float] = Field(default=None, ge=0)
    renewal_increase_percentage: Optional[float] = None  # % increase
    promotional_period_months: Optional[int] = None
    
    # 🔥 CRITICAL: Add-on costs
    ssl_premium_cost: Optional[float] = Field(default=None, ge=0)
    backup_premium_cost_monthly: Optional[float] = Field(default=None, ge=0)
    dedicated_ip_price: Optional[float] = Field(default=None, ge=0)
    migration_cost: Optional[float] = Field(default=0.0, ge=0)
    domain_renewal_price_yearly: Optional[float] = None
    email_hosting_cost: Optional[float] = Field(default=0.0, ge=0)
    
    # Money-back restrictions
    money_back_restrictions: Optional[str] = None
    money_back_guarantee_type: Optional[str] = Field(default="standard")
    
    # ===== STORAGE & RESOURCES =====
    storage_gb: Optional[int] = Field(default=None, ge=0)
    storage_type: StorageType = StorageType.UNKNOWN
    bandwidth: Optional[str] = "Unmetered"
    ram_mb: Optional[int] = Field(default=None, ge=0)
    cpu_cores: Optional[int] = Field(default=None, ge=0)
    cpu_type: Optional[str] = None
    
    # 🔥 CRITICAL: Technical limits (for Resource Limits Matrix)
    inodes: Optional[int] = Field(default=None, ge=0)
    max_processes: Optional[int] = Field(default=None, ge=0)
    entry_processes: Optional[int] = Field(default=None, ge=0)
    io_limit_mbps: Optional[int] = Field(default=None, ge=0)
    
    # 🔥 CRITICAL: Hidden limits
    database_size_limit_gb: Optional[int] = None
    email_send_limit_per_hour: Optional[int] = None
    ftp_accounts_limit: Optional[int] = None
    subdomains_actual_limit: Optional[int] = None  # Many say "unlimited"
    
    # ===== SERVER CONFIGURATION =====
    web_server: WebServer = WebServer.UNKNOWN
    php_versions: List[str] = []
    php_max_execution_time: Optional[int] = Field(default=None, ge=0)
    php_memory_limit_mb: Optional[int] = Field(default=None, ge=0)
    
    # ===== DATABASES =====
    databases_allowed: Optional[int] = Field(default=None, ge=0)
    database_types: List[str] = []
    mysql_version: Optional[str] = None
    postgresql_version: Optional[str] = None
    redis_available: bool = False
    memcached_available: bool = False
    
    # ===== DOMAINS & EMAIL =====
    websites_allowed: Optional[str] = Field(default="1")
    subdomains_allowed: Optional[str] = Field(default="unlimited")
    parked_domains: Optional[str] = Field(default="unlimited")
    addon_domains: Optional[int] = Field(default=None, ge=0)
    
    email_accounts: Optional[str] = Field(default="unlimited")
    email_storage_gb: Optional[int] = Field(default=None, ge=0)
    email_forwarding: bool = True
    spam_protection: bool = True
    
    # 🔥 CRITICAL: Email details
    email_spam_filter_quality: Optional[str] = None  # "Excellent", "Good", "Basic"
    email_imap_pop_support: bool = True
    email_webmail_interface: Optional[str] = None  # "RoundCube", "Horde"
    
    # ===== SSL & SECURITY =====
    free_ssl: bool = False
    ssl_type: Optional[str] = Field(default="Let's Encrypt")
    ssl_certificates_included: int = Field(default=1, ge=0)
    dedicated_ip_included: bool = False
    ddos_protection: bool = False
    waf_firewall: bool = False
    malware_scanning: bool = False
    auto_malware_removal: bool = False
    
    # ===== BACKUPS =====
    backup_included: bool = False
    backup_frequency: Optional[str] = None
    backup_retention_days: Optional[int] = Field(default=None, ge=0)
    one_click_restore: bool = False
    offsite_backup: bool = False  # Critical for safety
    
    # ===== DEVELOPER FEATURES =====
    ssh_access: bool = False
    sftp_access: bool = True
    wp_cli: bool = False
    git_integration: bool = False
    staging_environment: bool = False
    cron_jobs: bool = True
    
    node_js_support: bool = False
    node_js_versions: List[str] = []  # ["16", "18", "20"]
    python_support: bool = False
    python_versions: List[str] = []
    ruby_support: bool = False
    ruby_versions: List[str] = []
    
    # 🔥 CRITICAL: Developer tools
    composer_available: bool = False
    npm_available: bool = False
    docker_support: bool = False
    kubernetes_support: bool = False
    
    # ===== CONTROL PANEL =====
    control_panel: Optional[str] = None
    control_panel_version: Optional[str] = None
    one_click_installer: bool = True
    wordpress_optimized: bool = False
    cms_support: List[str] = []
    
    # 🔥 CRITICAL: WordPress specifics
    wordpress_install_time_seconds: Optional[int] = None
    wordpress_auto_updates: bool = False
    wordpress_security_features: List[str] = []
    wordpress_staging_sites_included: Optional[int] = None
    wordpress_max_plugins: Optional[int] = None
    
    # ===== PERFORMANCE & CDN =====
    cdn_included: bool = False
    cdn_provider: Optional[str] = None
    cdn_bandwidth_gb: Optional[int] = Field(default=None, ge=0)
    image_optimization: bool = False
    caching_type: Optional[str] = None
    http2_support: bool = True
    http3_support: bool = False
    
    # 🔥 CRITICAL: Real performance
    page_load_time_ms: Optional[int] = None
    server_response_time_ms: Optional[int] = None  # TTFB
    performance_grade: Optional[str] = None  # "A+", "B"
    
    # ===== INFRASTRUCTURE =====
    uptime_guarantee: Optional[float] = Field(default=None, ge=0, le=100)
    uptime_sla_compensation: bool = False
    data_center_locations: List[str] = []
    location_choice: bool = False
    auto_scaling: bool = False
    load_balancer_available: bool = False
    
    # 🔥 CRITICAL: Real reliability
    actual_uptime_last_30_days: Optional[float] = None
    downtime_incidents_last_year: Optional[int] = None
    mttr_minutes: Optional[int] = None  # Mean time to recovery
    
    # 🔥 CRITICAL: Infrastructure details
    server_hardware_type: Optional[str] = None  # "Intel Xeon E5"
    raid_configuration: Optional[str] = None
    network_speed_gbps: Optional[int] = None
    ipv6_support: bool = False
    
    # ===== MIGRATION & SUPPORT =====
    free_migration: bool = False
    migration_limit: Optional[int] = Field(default=None, ge=0)
    free_domain: bool = False
    domain_registration_included: bool = False
    
    # 🔥 CRITICAL: Support quality
    support_channels: List[str] = []
    support_response_time: Optional[str] = None
    support_wait_time_actual_minutes: Optional[int] = None  # Real measured
    support_satisfaction_score: Optional[float] = Field(default=None, ge=0, le=5)
    support_hours: Optional[str] = None  # "24/7" or "9am-5pm EST"
    priority_support: bool = False
    dedicated_support: bool = False
    
    # ===== ADDITIONAL =====
    website_builder: bool = False
    ecommerce_ready: bool = False
    pci_compliance: bool = False
    
    class Config:
        use_enum_values = True
