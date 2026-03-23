import { useState, useEffect, useCallback, useRef } from "react";
import { Post, AffiliateLink } from "../types";
import { FontSize, CustomImage } from "../utils/EditorExtensions";
import { useTiptapSetup } from "./useTiptapSetup";
import { usePostState } from "./usePostState";

export function usePostEditor(
    post: Post | null,
    onSave: (data: Partial<Post>) => Promise<any>
) {
    const {
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
    } = usePostState(post);
    const editor = useTiptapSetup({ post, isSwappingLangRef, editLangRef, setContentEn, setContentEs });

    useEffect(() => {
        if (post) {
            setTitle(post.title);
            setSlug(post.slug);
            setExcerpt(post.excerpt || "");
            setCategory(post.category || "");
            setSeoTitle(post.seo_title || "");
            setSeoDesc(post.seo_description || "");
            setKeywords(post.target_keywords?.join(", ") || "");
            setImagePrompt(post.image_prompt || "");
            setStatus(post.status);
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

    const handleLangSwitch = (targetLang: 'en' | 'es') => {
        if (targetLang === editLang || isSwappingLangRef.current) return;
        isSwappingLangRef.current = true;
        editLangRef.current = targetLang;
        if (editor) {
            const currentHTML = editor.getHTML();
            if (editLang === 'en') setContentEn(currentHTML);
            else setContentEs(currentHTML);
            const nextHTML = targetLang === 'en' ? (contentEn || post?.content || "") : (contentEs || post?.content_es || "");
            editor.commands.setContent(nextHTML);
        }
        setEditLang(targetLang);
        setTimeout(() => { isSwappingLangRef.current = false; }, 100);
    };

    const handleTranslate = async (manual = true) => {
        if (isTranslating) return null;
        try {
            setIsTranslating(true);
            const enContent = editLang === 'en' ? (editor?.getHTML() || "") : contentEn;
            const res = await fetch('/api/admin/posts/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title, content: enContent, excerpt,
                    seo_title: seoTitle, seo_description: seoDesc,
                    social_tw_text: socialTw, social_fb_text: socialFb, social_li_text: socialLi,
                    social_hashtags: socialTags ? socialTags.split(" ") : [],
                    from: 'en', to: 'es'
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Translation failed');
            const { translated } = data;
            setTitleEs(translated.title);
            setContentEs(translated.content);
            setExcerptEs(translated.excerpt);
            setSeoTitleEs(translated.seo_title);
            setSeoDescEs(translated.seo_description);
            setSocialTwEs(translated.social_tw_text || "");
            setSocialFbEs(translated.social_fb_text || "");
            setSocialLiEs(translated.social_li_text || "");
            setSocialTagsEs(Array.isArray(translated.social_hashtags) ? translated.social_hashtags.join(" ") : "");
            setKeywordsEs(Array.isArray(translated.target_keywords) ? translated.target_keywords.join(", ") : "");
            if (editLang === 'es') editor?.commands.setContent(translated.content);
            return translated;
        } catch (err: any) {
            setError(err.message);
            return null;
        } finally { setIsTranslating(false); }
    };

    const handleGenerateSocial = async () => {
        if (isTranslating) return;
        try {
            setIsTranslating(true);
            const contentToSend = editLang === 'en' ? (editor?.getHTML() || contentEn) : (contentEs || editor?.getHTML() || "");
            const titleToSend = editLang === 'en' ? title : titleEs;
            const res = await fetch('/api/admin/posts/generate-social', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: contentToSend, title: titleToSend, language: editLang, platform: 'all' })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Generation failed');
            const { generated } = data;
            const targetSet = editLang === 'en' ? [setSocialTw, setSocialFb, setSocialLi, setSocialTags] : [setSocialTwEs, setSocialFbEs, setSocialLiEs, setSocialTagsEs];
            targetSet[0](generated.twitter || "");
            targetSet[1](generated.facebook || "");
            targetSet[2](generated.linkedin || "");
            targetSet[3](Array.isArray(generated.hashtags) ? generated.hashtags.join(" ") : generated.hashtags);
        } catch (err: any) { setError(err.message); } finally { setIsTranslating(false); }
    };

    const handleSave = async (publish = false) => {
        if (!title.trim() && editLang === 'en') { setError("English Title is required"); return; }
        setError(null);
        setSaving(true);
        try {
            const currentHTML = editor?.getHTML() || "";
            const finalContentEn = editLang === 'en' ? currentHTML : contentEn;
            let finalContentEs = editLang === 'es' ? currentHTML : contentEs;
            let finals = { titleEs, excerptEs, seoTitleEs, seoDescEs, socialTwEs, socialFbEs, socialLiEs, socialTagsEs, keywordsEs };

            if (!titleEs.trim() && !finalContentEs.trim() && editLang === 'en') {
                const translated = await handleTranslate(false);
                if (translated) {
                    finals.titleEs = translated.title; finalContentEs = translated.content; finals.excerptEs = translated.excerpt;
                    finals.seoTitleEs = translated.seo_title; finals.seoDescEs = translated.seo_description;
                    finals.socialTwEs = translated.social_tw_text; finals.socialFbEs = translated.social_fb_text; finals.socialLiEs = translated.social_li_text;
                    finals.socialTagsEs = Array.isArray(translated.social_hashtags) ? translated.social_hashtags.join(" ") : (translated.social_hashtags || "");
                    finals.keywordsEs = Array.isArray(translated.target_keywords) ? translated.target_keywords.join(", ") : (translated.target_keywords || "");
                }
            }

            const getUtcPublishDate = () => {
                if (!scheduledDate) return new Date().toISOString();
                return new Date(`${scheduledDate}:00-06:00`).toISOString();
            };

            await onSave({
                id: post?.id, title, slug, content: finalContentEn, excerpt,
                category: category || null, status: publish ? 'published' : (status || 'draft'),
                published_at: publish ? getUtcPublishDate() : (post?.published_at || null),
                seo_title: seoTitle || title, seo_description: seoDesc || excerpt,
                target_keywords: keywords ? keywords.split(",").map(k => k.trim()).filter(Boolean) : null,
                related_provider_name: relatedProvider || null, image_prompt: imagePrompt || null,
                cover_image_url: coverImageUrl || null, social_tw_text: socialTw || null,
                social_fb_text: socialFb || null, social_li_text: socialLi || null,
                social_hashtags: socialTags ? socialTags.split(" ").map(t => t.startsWith("#") ? t : `#${t}`).filter(Boolean) : null,
                title_es: finals.titleEs || null, content_es: finalContentEs || null, excerpt_es: finals.excerptEs || null,
                seo_title_es: finals.seoTitleEs || null, seo_description_es: finals.seoDescEs || null,
                social_tw_text_es: finals.socialTwEs || null, social_fb_text_es: finals.socialFbEs || null,
                social_li_text_es: finals.socialLiEs || null,
                social_hashtags_es: finals.socialTagsEs ? finals.socialTagsEs.split(" ").map(t => t.startsWith("#") ? t : `#${t}`).filter(Boolean) : null,
                target_keywords_es: finals.keywordsEs ? finals.keywordsEs.split(",").map(k => k.trim()).filter(Boolean) : null,
            });
        } catch (err: any) { setError(err.message); } finally { setSaving(false); }
    };

    const performAutoSave = useCallback(async () => {
        if (!post?.id || !title.trim() || isAutoSaving) return;
        const currentHTML = editor?.getHTML() || "";
        const finalContentEn = editLang === 'en' ? currentHTML : contentEn;
        const finalContentEs = editLang === 'es' ? currentHTML : contentEs;
        const currentSnapshot = JSON.stringify({
            title, content: finalContentEn, content_es: finalContentEs, title_es: titleEs,
            slug, excerpt, category, seo_title: seoTitle, seo_description: seoDesc,
            keywords: keywords?.split(",").map(k => k.trim()).join(","),
        });
        if (currentSnapshot === lastSavedSnapshotRef.current) return;
        setIsAutoSaving(true);
        try {
            await onSave({
                id: post.id, title, slug, content: finalContentEn, excerpt, category: category || null, status: status || 'draft',
                published_at: post.published_at || null, seo_title: seoTitle || title, seo_description: seoDesc || excerpt,
                target_keywords: keywords ? keywords.split(",").map(k => k.trim()).filter(Boolean) : null,
                related_provider_name: relatedProvider || null, image_prompt: imagePrompt || null,
                cover_image_url: coverImageUrl || null, social_tw_text: socialTw || null,
                social_fb_text: socialFb || null, social_li_text: socialLi || null,
                social_hashtags: socialTags ? socialTags.split(" ").map(t => t.startsWith("#") ? t : `#${t}`).filter(Boolean) : null,
                title_es: titleEs || null, content_es: finalContentEs || null, excerpt_es: excerptEs || null,
                seo_title_es: seoTitleEs || null, seo_description_es: seoDescEs || null,
                social_tw_text_es: socialTwEs || null, social_fb_text_es: socialFbEs || null,
                social_li_text_es: socialLiEs || null,
                social_hashtags_es: socialTagsEs ? socialTagsEs.split(" ").map(t => t.startsWith("#") ? t : `#${t}`).filter(Boolean) : null,
                target_keywords_es: keywordsEs ? keywordsEs.split(",").map(k => k.trim()).filter(Boolean) : null,
            });
            lastSavedSnapshotRef.current = currentSnapshot;
            setLastSavedAt(new Date());
        } catch (err) { console.error("Auto-save failed:", err); } finally { setIsAutoSaving(false); }
    }, [post?.id, post?.published_at, title, slug, contentEn, contentEs, editLang, editor, excerpt, category, status, seoTitle, seoDesc, keywords, relatedProvider, imagePrompt, coverImageUrl, socialTw, socialFb, socialLi, socialTags, titleEs, excerptEs, seoTitleEs, seoDescEs, socialTwEs, socialFbEs, socialLiEs, socialTagsEs, keywordsEs, onSave, isAutoSaving]);

    useEffect(() => {
        if (!post?.id) return;
        const timer = setTimeout(() => { performAutoSave(); }, 1500);
        return () => clearTimeout(timer);
    }, [title, slug, contentEn, contentEs, excerpt, category, seoTitle, seoDesc, keywords, relatedProvider, imagePrompt, coverImageUrl, socialTw, socialFb, socialLi, socialTags, titleEs, excerptEs, seoTitleEs, seoDescEs, socialTwEs, socialFbEs, socialLiEs, socialTagsEs, keywordsEs, performAutoSave, post?.id]);

    return {
        title, setTitle, slug, setSlug, excerpt, setExcerpt, category, setCategory,
        seoTitle, setSeoTitle, seoDesc, setSeoDesc, keywords, setKeywords,
        imagePrompt, setImagePrompt, status, setStatus, relatedProvider, setRelatedProvider,
        saving, lastSavedAt, isAutoSaving, error, setError, activeSection, setActiveSection,
        coverImageUrl, setCoverImageUrl, socialTw, setSocialTw, socialFb, setSocialFb, socialLi, setSocialLi, socialTags, setSocialTags,
        uploading, setUploading, dragOver, setDragOver, editLang, setEditLang, isTranslating,
        titleEs, setTitleEs, contentEn, setContentEn, contentEs, setContentEs, excerptEs, setExcerptEs,
        seoTitleEs, setSeoTitleEs, seoDescEs, setSeoDescEs, socialTwEs, setSocialTwEs, socialFbEs, setSocialFbEs, socialLiEs, setSocialLiEs, socialTagsEs, setSocialTagsEs, keywordsEs, setKeywordsEs,
        editor, scheduledDate, setScheduledDate,
        handleLangSwitch, handleTranslate, handleGenerateSocial, handleSave,
    };
}
