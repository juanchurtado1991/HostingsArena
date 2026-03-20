export type TaskType =
    | 'affiliate_audit' 
    | 'scraper_fix'
    | 'content_review'
    | 'content_update'
    | 'system_alert'
    | 'seo_opportunity'
    | 'social_post'
    | 'content_update';

export type TaskPriority = 'critical' | 'high' | 'normal' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'ignored';

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

export interface ProviderWithAffiliate {
    id: string;
    provider_name: string;
    affiliate_link: string | null;
    affiliate_status: string | null;
}

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
