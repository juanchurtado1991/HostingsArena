-- Add new columns for affiliate management
ALTER TABLE affiliate_partners
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS minimum_payout_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS minimum_payout_currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS reminder_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reminder_note TEXT;

-- update the status check constraint to include new statuses
ALTER TABLE affiliate_partners DROP CONSTRAINT IF EXISTS affiliate_partners_status_check;
ALTER TABLE affiliate_partners ADD CONSTRAINT affiliate_partners_status_check CHECK (status IN ('active', 'paused', 'expired', 'processing_approval', 'rejected'));
