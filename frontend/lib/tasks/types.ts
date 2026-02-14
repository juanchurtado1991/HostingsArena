/**
 * Task Types for the Admin Task System
 */
export type TaskType =
    | 'affiliate_audit'   // Missing/Broken affiliate links
    | 'scraper_fix'       // Scraper failures
    | 'content_review'    // AI-generated news drafts
    | 'content_update'    // Posts needing affiliate link updates
    | 'system_alert'      // General system warnings
    | 'seo_opportunity'   // Backlink opportunities
    | 'social_post'       // Social media queue
    | 'content_update';   // Content decay/refresh

export type TaskPriority = 'critical' | 'high' | 'normal' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'ignored';

/**
 * Admin Task record as stored in Supabase
 */
export interface AdminTask {
    id?: string;
    task_type: TaskType;
    priority: TaskPriority;
    status?: TaskStatus;
    title: string;
    description?: string;
    metadata?: Record<string, unknown>;
    assigned_to?: string;
    due_date?: string;
    created_at?: string;
    updated_at?: string;
}

/**
 * Provider with affiliate info (from JOIN)
 */
export interface ProviderWithAffiliate {
    id: string;
    provider_name: string;
    affiliate_link: string | null;
    affiliate_status: string | null;
}

/**
 * Scraper status record
 */
export interface ScraperStatus {
    id: string;
    provider_name: string;
    provider_type: 'hosting' | 'vpn';
    status: 'success' | 'error' | 'warning' | 'stale';
    last_run: string;
    duration_seconds: number;
    error_message: string | null;
    items_synced: number;
}
