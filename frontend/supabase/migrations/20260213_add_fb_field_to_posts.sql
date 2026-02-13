-- Add facebook social field to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS social_fb_text TEXT;

-- Add comment for documentation
COMMENT ON COLUMN posts.social_fb_text IS 'AI-generated content for Facebook posts';
