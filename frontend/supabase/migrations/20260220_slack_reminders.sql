-- Migration to add slack_reminders table

CREATE TABLE IF NOT EXISTS public.slack_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message TEXT NOT NULL,
    mention_user TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Setup RLS (Row Level Security)
ALTER TABLE public.slack_reminders ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated users
CREATE POLICY "Allow authenticated read access on slack_reminders" ON public.slack_reminders
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow insert access for authenticated users
CREATE POLICY "Allow authenticated insert access on slack_reminders" ON public.slack_reminders
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow update access for authenticated users
CREATE POLICY "Allow authenticated update access on slack_reminders" ON public.slack_reminders
    FOR UPDATE
    TO authenticated
    USING (true);

-- Allow delete access for authenticated users
CREATE POLICY "Allow authenticated delete access on slack_reminders" ON public.slack_reminders
    FOR DELETE
    TO authenticated
    USING (true);
