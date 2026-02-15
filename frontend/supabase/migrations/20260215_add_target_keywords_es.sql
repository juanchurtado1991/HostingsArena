-- Add target_keywords_es to posts table for decoupled multi-language SEO
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS target_keywords_es TEXT[];

-- Add comment for documentation
COMMENT ON COLUMN posts.target_keywords_es IS 'Array of target SEO keywords in Spanish, independent from English keywords';
