export interface Reminder {
    id: string;
    message: string;
    mention_user: string | null;
    scheduled_at: string;
    status: 'pending' | 'sent' | 'failed';
    is_recurring: boolean;
    recurrence_pattern: 'daily' | 'weekly' | 'monthly' | null;
    created_at: string;
}
