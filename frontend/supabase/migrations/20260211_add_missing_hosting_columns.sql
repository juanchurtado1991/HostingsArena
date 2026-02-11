-- Add ALL potential missing columns to hosting_providers
-- Based on HostingProvider Pydantic model
-- Using IF NOT EXISTS to avoid errors

-- Core Fields (Just in case)
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS provider_type TEXT;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS plan_name TEXT;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Pricing & Hidden Costs
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS pricing_yearly NUMERIC;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS pricing_3year NUMERIC;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS setup_fee NUMERIC DEFAULT 0;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS money_back_days INTEGER;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS renewal_price NUMERIC;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS renewal_price_yearly NUMERIC;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS renewal_increase_percentage NUMERIC;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS promotional_period_months INTEGER;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS ssl_premium_cost NUMERIC;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS backup_premium_cost_monthly NUMERIC;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS dedicated_ip_price NUMERIC;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS migration_cost NUMERIC DEFAULT 0;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS domain_renewal_price_yearly NUMERIC;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS email_hosting_cost NUMERIC DEFAULT 0;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS money_back_restrictions TEXT;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS money_back_guarantee_type TEXT DEFAULT 'standard';

-- Storage & Resources
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS bandwidth TEXT;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS storage_type TEXT;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS cpu_cores INTEGER;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS ram_mb INTEGER;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS cpu_type TEXT;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS inodes INTEGER;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS max_processes INTEGER;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS entry_processes INTEGER;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS io_limit_mbps INTEGER;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS database_size_limit_gb INTEGER;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS email_send_limit_per_hour INTEGER;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS ftp_accounts_limit INTEGER;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS subdomains_actual_limit INTEGER;

-- Server Config
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS web_server TEXT;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS php_versions JSONB;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS php_max_execution_time INTEGER;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS php_memory_limit_mb INTEGER;

-- Databases
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS databases_allowed INTEGER;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS database_types JSONB;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS mysql_version TEXT;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS postgresql_version TEXT;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS redis_available BOOLEAN DEFAULT FALSE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS memcached_available BOOLEAN DEFAULT FALSE;

-- Domains & Email
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS websites_allowed TEXT;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS subdomains_allowed TEXT;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS parked_domains TEXT;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS addon_domains INTEGER;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS email_accounts TEXT;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS email_storage_gb INTEGER;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS email_forwarding BOOLEAN DEFAULT TRUE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS spam_protection BOOLEAN DEFAULT TRUE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS email_spam_filter_quality TEXT;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS email_imap_pop_support BOOLEAN DEFAULT TRUE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS email_webmail_interface TEXT;

-- SSL & Security
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS free_ssl BOOLEAN DEFAULT FALSE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS ssl_type TEXT;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS ssl_certificates_included INTEGER DEFAULT 1;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS dedicated_ip_included BOOLEAN DEFAULT FALSE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS ddos_protection BOOLEAN DEFAULT FALSE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS waf_firewall BOOLEAN DEFAULT FALSE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS malware_scanning BOOLEAN DEFAULT FALSE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS auto_malware_removal BOOLEAN DEFAULT FALSE;

-- Backups
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS backup_included BOOLEAN DEFAULT FALSE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS backup_frequency TEXT;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS backup_retention_days INTEGER;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS one_click_restore BOOLEAN DEFAULT FALSE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS offsite_backup BOOLEAN DEFAULT FALSE;

-- Developer Features
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS ssh_access BOOLEAN DEFAULT FALSE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS sftp_access BOOLEAN DEFAULT TRUE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS wp_cli BOOLEAN DEFAULT FALSE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS git_integration BOOLEAN DEFAULT FALSE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS staging_environment BOOLEAN DEFAULT FALSE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS cron_jobs BOOLEAN DEFAULT TRUE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS node_js_support BOOLEAN DEFAULT FALSE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS node_js_versions JSONB;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS python_support BOOLEAN DEFAULT FALSE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS python_versions JSONB;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS ruby_support BOOLEAN DEFAULT FALSE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS ruby_versions JSONB;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS composer_available BOOLEAN DEFAULT FALSE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS npm_available BOOLEAN DEFAULT FALSE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS docker_support BOOLEAN DEFAULT FALSE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS kubernetes_support BOOLEAN DEFAULT FALSE;

-- Control Panel
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS control_panel TEXT;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS control_panel_version TEXT;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS one_click_installer BOOLEAN DEFAULT TRUE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS wordpress_optimized BOOLEAN DEFAULT FALSE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS cms_support JSONB;

-- Wordpress Specifics
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS wordpress_install_time_seconds INTEGER;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS wordpress_auto_updates BOOLEAN DEFAULT FALSE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS wordpress_security_features JSONB;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS wordpress_staging_sites_included INTEGER;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS wordpress_max_plugins INTEGER;

-- Performance & CDN
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS cdn_included BOOLEAN DEFAULT FALSE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS cdn_provider TEXT;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS cdn_bandwidth_gb INTEGER;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS image_optimization BOOLEAN DEFAULT FALSE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS caching_type TEXT;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS http2_support BOOLEAN DEFAULT TRUE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS http3_support BOOLEAN DEFAULT FALSE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS page_load_time_ms INTEGER;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS server_response_time_ms INTEGER;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS performance_grade TEXT;

-- Infrastructure
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS uptime_guarantee NUMERIC;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS uptime_sla_compensation BOOLEAN DEFAULT FALSE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS data_center_locations JSONB;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS location_choice BOOLEAN DEFAULT FALSE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS auto_scaling BOOLEAN DEFAULT FALSE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS load_balancer_available BOOLEAN DEFAULT FALSE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS actual_uptime_last_30_days NUMERIC;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS downtime_incidents_last_year INTEGER;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS mttr_minutes INTEGER;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS server_hardware_type TEXT;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS raid_configuration TEXT;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS network_speed_gbps INTEGER;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS ipv6_support BOOLEAN DEFAULT FALSE;

-- Migration & Support
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS free_migration BOOLEAN DEFAULT FALSE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS migration_limit INTEGER;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS free_domain BOOLEAN DEFAULT FALSE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS domain_registration_included BOOLEAN DEFAULT FALSE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS support_channels JSONB;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS support_response_time TEXT;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS support_wait_time_actual_minutes INTEGER;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS support_satisfaction_score NUMERIC;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS support_hours TEXT;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS priority_support BOOLEAN DEFAULT FALSE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS dedicated_support BOOLEAN DEFAULT FALSE;

-- Additional
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS website_builder BOOLEAN DEFAULT FALSE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS ecommerce_ready BOOLEAN DEFAULT FALSE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS pci_compliance BOOLEAN DEFAULT FALSE;

-- Reload
NOTIFY pgrst, 'reload schema';
