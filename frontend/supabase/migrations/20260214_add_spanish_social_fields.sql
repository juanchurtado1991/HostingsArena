-- Add Spanish social media fields to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS social_tw_text_es TEXT,
ADD COLUMN IF NOT EXISTS social_fb_text_es TEXT,
ADD COLUMN IF NOT EXISTS social_li_text_es TEXT,
ADD COLUMN IF NOT EXISTS social_hashtags_es TEXT[];

-- Add comments for documentation
COMMENT ON COLUMN posts.social_tw_text_es IS 'AI-generated content for Twitter/X posts in Spanish';
COMMENT ON COLUMN posts.social_fb_text_es IS 'AI-generated content for Facebook posts in Spanish';
COMMENT ON COLUMN posts.social_li_text_es IS 'AI-generated content for LinkedIn posts in Spanish';
COMMENT ON COLUMN posts.social_hashtags_es IS 'Array of hashtags for social media sharing in Spanish';
