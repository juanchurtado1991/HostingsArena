import { useState, useEffect, useRef } from "react";
import { Post } from "../types";

export function usePostState(post: Post | null) {
    const [title, setTitle] = useState(post?.title || "");
    const [slug, setSlug] = useState(post?.slug || "");
    const [excerpt, setExcerpt] = useState(post?.excerpt || "");
    const [category, setCategory] = useState(post?.category || "");
    const [seoTitle, setSeoTitle] = useState(post?.seo_title || "");
    const [seoDesc, setSeoDesc] = useState(post?.seo_description || "");
    const [keywords, setKeywords] = useState(post?.target_keywords?.join(", ") || "");
    const [imagePrompt, setImagePrompt] = useState(post?.image_prompt || "");
    const [status, setStatus] = useState(post?.status || "draft");
    const [relatedProvider, setRelatedProvider] = useState(post?.related_provider_name || "");
    const [saving, setSaving] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const lastSavedSnapshotRef = useRef<string>("");
    const editLangRef = useRef<'en' | 'es'>(post ? 'en' : 'en');
    const isSwappingLangRef = useRef(false);
    const [scheduledDate, setScheduledDate] = useState<string>("");

    const [error, setError] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState<"content" | "seo" | "social" | "image">("content");
    const [coverImageUrl, setCoverImageUrl] = useState(post?.cover_image_url || "");
    const [socialTw, setSocialTw] = useState(post?.social_tw_text || "");
    const [socialFb, setSocialFb] = useState(post?.social_fb_text || "");
    const [socialLi, setSocialLi] = useState(post?.social_li_text || "");
    const [socialTags, setSocialTags] = useState(post?.social_hashtags?.join(" ") || "");
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [editLang, setEditLang] = useState<'en' | 'es'>('en');
    const [isTranslating, setIsTranslating] = useState(false);
    const [contentEn, setContentEn] = useState(post?.content || "");
    const [titleEs, setTitleEs] = useState(post?.title_es || "");
    const [contentEs, setContentEs] = useState(post?.content_es || "");
    const [excerptEs, setExcerptEs] = useState(post?.excerpt_es || "");
    const [seoTitleEs, setSeoTitleEs] = useState(post?.seo_title_es || "");
    const [seoDescEs, setSeoDescEs] = useState(post?.seo_description_es || "");
    const [socialTwEs, setSocialTwEs] = useState(post?.social_tw_text_es || "");
    const [socialFbEs, setSocialFbEs] = useState(post?.social_fb_text_es || "");
    const [socialLiEs, setSocialLiEs] = useState(post?.social_li_text_es || "");
    const [socialTagsEs, setSocialTagsEs] = useState(post?.social_hashtags_es?.join(" ") || "");
    const [keywordsEs, setKeywordsEs] = useState(post?.target_keywords_es?.join(", ") || "");

    useEffect(() => {
        if (post) {
            setTitle(post.title || "");
            setSlug(post.slug || "");
            setExcerpt(post.excerpt || "");
            setCategory(post.category || "");
            setSeoTitle(post.seo_title || "");
            setSeoDesc(post.seo_description || "");
            setKeywords(post.target_keywords?.join(", ") || "");
            setImagePrompt(post.image_prompt || "");
            setStatus(post.status || "draft");
            setRelatedProvider(post.related_provider_name || "");
            setCoverImageUrl(post.cover_image_url || "");
            setSocialTw(post.social_tw_text || "");
            setSocialFb(post.social_fb_text || "");
            setSocialLi(post.social_li_text || "");
            setSocialTags(post.social_hashtags?.join(" ") || "");
            setTitleEs(post.title_es || "");
            setExcerptEs(post.excerpt_es || "");
            setSeoTitleEs(post.seo_title_es || "");
            setSeoDescEs(post.seo_description_es || "");
            setSocialTwEs(post.social_tw_text_es || "");
            setSocialFbEs(post.social_fb_text_es || "");
            setSocialLiEs(post.social_li_text_es || "");
            setSocialTagsEs(post.social_hashtags_es?.join(" ") || "");
            setKeywordsEs(post.target_keywords_es?.join(", ") || "");

            lastSavedSnapshotRef.current = JSON.stringify({
                title: post.title,
                content: post.content,
                content_es: post.content_es,
                title_es: post.title_es,
                slug: post.slug,
                excerpt: post.excerpt,
                category: post.category,
                seo_title: post.seo_title,
                seo_description: post.seo_description,
                keywords: post.target_keywords?.join(","),
            });

            if (post.published_at) {
                const d = new Date(post.published_at);
                const svTime = new Date(d.getTime() - 6 * 60 * 60 * 1000);
                setScheduledDate(svTime.toISOString().slice(0, 16));
            }
        }
    }, [post]);

    return {
        title, setTitle, slug, setSlug, excerpt, setExcerpt, category, setCategory,
        seoTitle, setSeoTitle, seoDesc, setSeoDesc, keywords, setKeywords,
        imagePrompt, setImagePrompt, status, setStatus, relatedProvider, setRelatedProvider,
        saving, setSaving, lastSavedAt, setLastSavedAt, isAutoSaving, setIsAutoSaving,
        lastSavedSnapshotRef, editLangRef, isSwappingLangRef, scheduledDate, setScheduledDate,
        error, setError, activeSection, setActiveSection, coverImageUrl, setCoverImageUrl,
        socialTw, setSocialTw, socialFb, setSocialFb, socialLi, setSocialLi, socialTags, setSocialTags,
        uploading, setUploading, dragOver, setDragOver, editLang, setEditLang, isTranslating, setIsTranslating,
        contentEn, setContentEn, titleEs, setTitleEs, contentEs, setContentEs, excerptEs, setExcerptEs,
        seoTitleEs, setSeoTitleEs, seoDescEs, setSeoDescEs, socialTwEs, setSocialTwEs, socialFbEs, setSocialFbEs,
        socialLiEs, setSocialLiEs, socialTagsEs, setSocialTagsEs, keywordsEs, setKeywordsEs
    };
}
