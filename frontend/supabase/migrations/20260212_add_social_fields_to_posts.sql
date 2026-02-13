-- Add social media fields to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS social_tw_text TEXT,
ADD COLUMN IF NOT EXISTS social_li_text TEXT,
ADD COLUMN IF NOT EXISTS social_hashtags TEXT[];

-- Add comment for documentation
COMMENT ON COLUMN posts.social_tw_text IS 'AI-generated content for Twitter/X posts';
COMMENT ON COLUMN posts.social_li_text IS 'AI-generated content for LinkedIn posts';
COMMENT ON COLUMN posts.social_hashtags IS 'Array of hashtags for social media sharing';
