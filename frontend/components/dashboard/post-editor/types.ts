export interface Post {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    category: string | null;
    status: string;
    is_ai_generated: boolean;
    ai_quality_score: number | null;
    seo_title: string | null;
    seo_description: string | null;
    target_keywords: string[] | null;
    related_provider_name: string | null;
    image_prompt: string | null;
    cover_image_url: string | null;
    published_at: string | null;
    created_at: string;
    social_tw_text: string | null;
    social_fb_text: string | null;
    social_li_text: string | null;
    social_hashtags: string[] | null;
    updated_at?: string;
    title_es?: string | null;
    content_es?: string | null;
    excerpt_es?: string | null;
    seo_title_es?: string | null;
    seo_description_es?: string | null;
    social_tw_text_es?: string | null;
    social_fb_text_es?: string | null;
    social_li_text_es?: string | null;
    social_hashtags_es?: string[] | null;
    target_keywords_es?: string[] | null;
}

export interface AffiliateLink {
    id: string;
    provider_name: string;
    affiliate_link: string;
    status: string;
}
