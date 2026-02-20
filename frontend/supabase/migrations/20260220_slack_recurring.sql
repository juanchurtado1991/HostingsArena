-- Migration to add recurring support to slack_reminders table

ALTER TABLE public.slack_reminders
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT,
ADD COLUMN IF NOT EXISTS last_sent_at TIMESTAMP WITH TIME ZONE;

-- Add a check constraint for valid recurrence patterns if it's recurring
ALTER TABLE public.slack_reminders
ADD CONSTRAINT valid_recurrence_pattern CHECK (
    (is_recurring = false) OR 
    (is_recurring = true AND recurrence_pattern IN ('daily', 'weekly', 'monthly'))
);
